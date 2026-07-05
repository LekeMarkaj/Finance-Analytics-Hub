import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ExtractedSection, ExtractedItem } from "@/lib/reports";

interface EditChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section?: ExtractedSection;
  onSave: (section: ExtractedSection) => void;
}

const emptyItem = (): ExtractedItem => ({ label: "", value: 0 });

export function EditChartDialog({ open, onOpenChange, section, onSave }: EditChartDialogProps) {
  const isNew = !section;
  const [name, setName] = useState("");
  const [chartType, setChartType] = useState<ExtractedSection["chartType"]>("bar");
  const [items, setItems] = useState<ExtractedItem[]>([emptyItem(), emptyItem()]);

  useEffect(() => {
    if (open) {
      setName(section?.name ?? "");
      setChartType(section?.chartType ?? "bar");
      setItems(section?.items?.length ? section.items.map((i) => ({ ...i })) : [emptyItem(), emptyItem()]);
    }
  }, [open, section]);

  const updateItem = (index: number, field: "label" | "value", value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "value" ? Number(value) || 0 : value } : item
      )
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const isValid = name.trim().length > 0 && items.length >= 1 && items.every((i) => i.label.trim().length > 0);

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      ...section,
      name: name.trim(),
      chartType,
      items: items.map((i) => ({ ...i, label: i.label.trim() })),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add chart" : "Edit chart"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Create a new chart with manually entered data." : "Update the name, type, or data for this chart."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="chart-name">Chart name</Label>
            <Input id="chart-name" data-testid="input-chart-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Revenue Breakdown" />
          </div>

          <div className="space-y-1.5">
            <Label>Chart type</Label>
            <Select value={chartType} onValueChange={(v) => setChartType(v as ExtractedSection["chartType"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Data</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addItem}>
                <Plus className="w-3.5 h-3.5" />Add row
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Label"
                    data-testid={`input-row-label-${i}`}
                    value={item.label}
                    onChange={(e) => updateItem(i, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Value"
                    data-testid={`input-row-value-${i}`}
                    value={item.value}
                    onChange={(e) => updateItem(i, "value", e.target.value)}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    data-testid={`button-remove-row-${i}`}
                    onClick={() => removeItem(i)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" data-testid="button-dialog-cancel" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button data-testid="button-dialog-save" onClick={handleSave} disabled={!isValid}>{isNew ? "Add chart" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
