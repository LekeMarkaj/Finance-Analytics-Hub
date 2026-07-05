import { Router } from "express";
import multer from "multer";
import { extractText } from "unpdf";
import Groq from "groq-sdk";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { pdfUploadsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import type { ExtractedFinancialData } from "@workspace/db";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

router.post(
  "/pdf-upload",
  requireAuth,
  (req: any, res: any, next: any) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  async (req: any, res: any): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const [record] = await db
      .insert(pdfUploadsTable)
      .values({
        userId: req.userId,
        fileName: req.file.originalname,
        status: "processing",
      })
      .returning();

    res.status(202).json({ id: record.id, status: "processing" });

    try {
      const { text: pages } = await extractText(new Uint8Array(req.file.buffer), { mergePages: true });
      const text = (Array.isArray(pages) ? pages.join("\n") : pages).slice(0, 12000);

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content: `You are a financial data extraction assistant. Given raw text from a financial PDF (budget report, bank statement, annual report, etc.), extract structured financial data and return ONLY valid JSON with no markdown, no code fences, no explanation.

The JSON must match this exact shape:
{
  "title": "string — document title or best guess",
  "summary": "string — 1-2 sentence plain-language summary",
  "currency": "string — detected currency symbol or code, e.g. EUR or €",
  "sections": [
    {
      "name": "string — section name, e.g. Revenue Breakdown, Expense Categories",
      "chartType": "bar | line | pie | area",
      "items": [
        { "label": "string", "value": number }
      ]
    }
  ]
}

Rules:
- Extract ALL numeric financial figures you can find and group them meaningfully into sections
- Each section must have at least 2 items
- Values must be plain numbers (no commas, no currency symbols)
- Choose chartType based on the data: pie for budget breakdowns/shares, bar for comparisons, line/area for time series
- If no financial data can be found, return { "title": "Unknown", "summary": "No financial data found", "currency": "", "sections": [] }
- Return ONLY the JSON object, nothing else`,
          },
          {
            role: "user",
            content: `Extract financial data from this PDF text:\n\n${text}`,
          },
        ],
      });

      const rawContent = completion.choices[0]?.message?.content ?? "{}";

      let extractedData: ExtractedFinancialData;
      try {
        extractedData = JSON.parse(rawContent);
      } catch {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI did not return valid JSON");
        }
      }

      await db
        .update(pdfUploadsTable)
        .set({ status: "done", extractedData, updatedAt: new Date() })
        .where(eq(pdfUploadsTable.id, record.id));
    } catch (err: any) {
      await db
        .update(pdfUploadsTable)
        .set({
          status: "error",
          errorMessage: err?.message ?? "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(pdfUploadsTable.id, record.id));
    }
  }
);

router.get("/pdf-uploads", requireAuth, async (req: any, res: any): Promise<void> => {
  const rows = await db
    .select()
    .from(pdfUploadsTable)
    .where(eq(pdfUploadsTable.userId, req.userId))
    .orderBy(desc(pdfUploadsTable.createdAt));
  res.json(rows.map(uploadToApi));
});

router.get("/pdf-uploads/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .select()
    .from(pdfUploadsTable)
    .where(and(eq(pdfUploadsTable.id, id), eq(pdfUploadsTable.userId, req.userId)));
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(uploadToApi(row));
});

router.patch("/pdf-uploads/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const id = Number(req.params.id);
  const extractedData = req.body?.extractedData;

  if (!extractedData || typeof extractedData !== "object" || !Array.isArray(extractedData.sections)) {
    res.status(400).json({ error: "Invalid extractedData payload" });
    return;
  }

  for (const section of extractedData.sections) {
    if (
      typeof section.name !== "string" ||
      !["bar", "line", "pie", "area"].includes(section.chartType) ||
      !Array.isArray(section.items) ||
      section.items.some(
        (item: any) => typeof item.label !== "string" || typeof item.value !== "number" || Number.isNaN(item.value)
      )
    ) {
      res.status(400).json({ error: "Invalid section data" });
      return;
    }
  }

  const [row] = await db
    .update(pdfUploadsTable)
    .set({ extractedData, updatedAt: new Date() })
    .where(and(eq(pdfUploadsTable.id, id), eq(pdfUploadsTable.userId, req.userId)))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(uploadToApi(row));
});

router.delete("/pdf-uploads/:id", requireAuth, async (req: any, res: any): Promise<void> => {
  const id = Number(req.params.id);
  const [row] = await db
    .delete(pdfUploadsTable)
    .where(and(eq(pdfUploadsTable.id, id), eq(pdfUploadsTable.userId, req.userId)))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});

function uploadToApi(row: typeof pdfUploadsTable.$inferSelect) {
  return {
    id: row.id,
    fileName: row.fileName,
    status: row.status,
    errorMessage: row.errorMessage,
    extractedData: row.extractedData,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export default router;
