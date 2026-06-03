import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListBudgetCategories, useCreateBudgetCategory, useUpdateBudgetCategory, useDeleteBudgetCategory } from "@workspace/api-client-react";
import { useYearFilter, YearFilter } from "@/components/YearFilter";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, ChevronRight, Download } from "lucide-react";
import Papa from "papaparse";

export default function Categories() {
  const year = useYearFilter(2025);
  const { data, isLoading, isFetching } = useListBudgetCategories({ year }, { query: { queryKey: ['categories', year] } });

  const handleExportCsv = () => {
    const rows = (data ?? []).map(c => ({
      Year: year,
      Category: c.name,
      "Initial Budget (€)": c.initialBudget,
      "Final Budget (€)": c.finalBudget,
      "Spent (€)": c.spent,
      "Remaining (€)": c.remaining,
      "Utilization (%)": c.utilizationPct,
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budget-categories-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Budget Categories</h1>
          <p className="text-muted-foreground mt-1">Manage and track spending across major economic categories.</p>
        </div>
        <div className="flex items-center gap-4">
          <YearFilter defaultYear={2025} />
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isLoading || isFetching || !data?.length}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <CategoryFormDialog year={year} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading || isFetching ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="text-right">Initial Budget</TableHead>
                  <TableHead className="text-right">Final Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map(category => (
                  <TableRow key={category.id} className="group cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/categories/${category.id}`} className="hover:underline flex items-center gap-2">
                        {category.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(category.initialBudget)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(category.finalBudget)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(category.spent)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(category.remaining)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={category.utilizationPct > 95 ? "text-destructive font-bold" : ""}>
                          {formatPercent(category.utilizationPct)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <CategoryFormDialog category={category} year={year} />
                        <DeleteCategoryDialog id={category.id} name={category.name} year={year} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No budget categories found for {year}.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryFormDialog({ category, year }: { category?: any, year: number }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || "");
  const [initialBudget, setInitialBudget] = useState(category?.initialBudget?.toString() || "");
  const [finalBudget, setFinalBudget] = useState(category?.finalBudget?.toString() || "");
  const [spent, setSpent] = useState(category?.spent?.toString() || "");

  const createMut = useCreateBudgetCategory();
  const updateMut = useUpdateBudgetCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      year,
      initialBudget: parseFloat(initialBudget) || 0,
      finalBudget: parseFloat(finalBudget) || 0,
      spent: parseFloat(spent) || 0,
      remaining: (parseFloat(finalBudget) || 0) - (parseFloat(spent) || 0),
      utilizationPct: (parseFloat(finalBudget) || 0) > 0 ? ((parseFloat(spent) || 0) / (parseFloat(finalBudget) || 0)) * 100 : 0
    };

    if (isEditing) {
      updateMut.mutate({ id: category.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['categories', year] });
          queryClient.invalidateQueries({ queryKey: ['summary'] });
          setOpen(false);
          toast({ title: "Category updated successfully" });
        }
      });
    } else {
      createMut.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['categories', year] });
          queryClient.invalidateQueries({ queryKey: ['summary'] });
          setOpen(false);
          setName("");
          setInitialBudget("");
          setFinalBudget("");
          setSpent("");
          toast({ title: "Category created successfully" });
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4 text-muted-foreground" /></Button>
        ) : (
          <Button><Plus className="w-4 h-4 mr-2" /> New Category</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="initialBudget">Initial Budget (€)</Label>
              <Input id="initialBudget" type="number" step="0.01" value={initialBudget} onChange={e => setInitialBudget(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalBudget">Final Budget (€)</Label>
              <Input id="finalBudget" type="number" step="0.01" value={finalBudget} onChange={e => setFinalBudget(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spent">Amount Spent (€)</Label>
            <Input id="spent" type="number" step="0.01" value={spent} onChange={e => setSpent(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({ id, name, year }: { id: number, name: string, year: number }) {
  const [open, setOpen] = useState(false);
  const deleteMut = useDeleteBudgetCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories', year] });
        queryClient.invalidateQueries({ queryKey: ['summary'] });
        setOpen(false);
        toast({ title: "Category deleted" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone and will delete all associated line items.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
