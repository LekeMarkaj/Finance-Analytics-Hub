import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetBudgetCategory, useListBudgetLineItems, useCreateBudgetLineItem, useUpdateBudgetLineItem, useDeleteBudgetLineItem } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, ArrowLeft } from "lucide-react";

export default function CategoryDetail() {
  const { id } = useParams();
  const categoryId = parseInt(id || "0", 10);
  
  const categoryQuery = useGetBudgetCategory(categoryId, { query: { enabled: !!categoryId, queryKey: ['category', categoryId] } });
  const itemsQuery = useListBudgetLineItems({ categoryId }, { query: { enabled: !!categoryId, queryKey: ['lineItems', categoryId] } });
  
  const category = categoryQuery.data;
  const items = itemsQuery.data;

  const loading = categoryQuery.isLoading || categoryQuery.isFetching || itemsQuery.isLoading || itemsQuery.isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Categories
        </Link>
        
        {categoryQuery.isLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{category?.name}</h1>
            <p className="text-muted-foreground mt-1">Line item breakdown for {category?.year}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Final Budget</p>
            {categoryQuery.isLoading ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-bold">{formatCurrency(category?.finalBudget || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Amount Spent</p>
            {categoryQuery.isLoading ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-bold">{formatCurrency(category?.spent || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
            {categoryQuery.isLoading ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-bold">{formatCurrency(category?.remaining || 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Utilization</p>
            {categoryQuery.isLoading ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-bold">{formatPercent(category?.utilizationPct || 0)}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Detailed spending records for this category</CardDescription>
          </div>
          {category && <LineItemFormDialog categoryId={categoryId} year={category.year} />}
        </CardHeader>
        <CardContent className="p-0">
          {itemsQuery.isLoading || itemsQuery.isFetching ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">% of Category</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-right">{formatPercent(item.percentage)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {category && <LineItemFormDialog item={item} categoryId={categoryId} year={category.year} />}
                        <DeleteLineItemDialog id={item.id} name={item.name} categoryId={categoryId} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!items || items.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No line items found for this category.
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

function LineItemFormDialog({ item, categoryId, year }: { item?: any, categoryId: number, year: number }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!item;
  const [name, setName] = useState(item?.name || "");
  const [amount, setAmount] = useState(item?.amount?.toString() || "");
  const [percentage, setPercentage] = useState(item?.percentage?.toString() || "");

  const createMut = useCreateBudgetLineItem();
  const updateMut = useUpdateBudgetLineItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      categoryId,
      name,
      amount: parseFloat(amount) || 0,
      percentage: parseFloat(percentage) || 0,
      year
    };

    if (isEditing) {
      updateMut.mutate({ id: item.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['lineItems', categoryId] });
          setOpen(false);
          toast({ title: "Line item updated" });
        }
      });
    } else {
      createMut.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['lineItems', categoryId] });
          setOpen(false);
          setName("");
          setAmount("");
          setPercentage("");
          toast({ title: "Line item created" });
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
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Line Item' : 'Add Line Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Description</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input id="percentage" type="number" step="0.01" value={percentage} onChange={e => setPercentage(e.target.value)} />
            </div>
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

function DeleteLineItemDialog({ id, name, categoryId }: { id: number, name: string, categoryId: number }) {
  const [open, setOpen] = useState(false);
  const deleteMut = useDeleteBudgetLineItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lineItems', categoryId] });
        setOpen(false);
        toast({ title: "Line item deleted" });
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
          <DialogTitle>Delete Line Item</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete <strong>{name}</strong>?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
