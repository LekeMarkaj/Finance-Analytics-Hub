import { useState } from "react";
import { useListOwnRevenues, useCreateOwnRevenue, useUpdateOwnRevenue, useDeleteOwnRevenue } from "@workspace/api-client-react";
import { useYearFilter, YearFilter } from "@/components/YearFilter";
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
import { Trash2, Edit, Plus } from "lucide-react";

export default function Revenues() {
  const year = useYearFilter(2025);
  const { data: revenues, isLoading, isFetching } = useListOwnRevenues({ year }, { query: { queryKey: ['revenues', year] } });
  const loading = isLoading || isFetching;

  const totalRevenue = revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Own Revenues</h1>
          <p className="text-muted-foreground mt-1">Track internally generated income sources.</p>
        </div>
        <div className="flex items-center gap-4">
          <YearFilter defaultYear={2025} />
          <RevenueFormDialog year={year} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-1 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle>Total Own Revenue</CardTitle>
            <CardDescription>For fiscal year {year}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <p className="text-4xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues?.map(rev => (
                    <TableRow key={rev.id}>
                      <TableCell className="font-medium">{rev.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rev.amount)}</TableCell>
                      <TableCell className="text-right">{formatPercent(rev.percentage)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <RevenueFormDialog revenue={rev} year={year} />
                          <DeleteRevenueDialog id={rev.id} name={rev.name} year={year} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!revenues || revenues.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No revenue sources found for {year}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueFormDialog({ revenue, year }: { revenue?: any, year: number }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!revenue;
  const [name, setName] = useState(revenue?.name || "");
  const [amount, setAmount] = useState(revenue?.amount?.toString() || "");
  const [percentage, setPercentage] = useState(revenue?.percentage?.toString() || "");

  const createMut = useCreateOwnRevenue();
  const updateMut = useUpdateOwnRevenue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      amount: parseFloat(amount) || 0,
      percentage: parseFloat(percentage) || 0,
      year
    };

    if (isEditing) {
      updateMut.mutate({ id: revenue.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['revenues', year] });
          setOpen(false);
          toast({ title: "Revenue source updated" });
        }
      });
    } else {
      createMut.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['revenues', year] });
          setOpen(false);
          setName("");
          setAmount("");
          setPercentage("");
          toast({ title: "Revenue source created" });
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
          <Button><Plus className="w-4 h-4 mr-2" /> New Source</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Revenue Source' : 'Add Revenue Source'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Source Name</Label>
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

function DeleteRevenueDialog({ id, name, year }: { id: number, name: string, year: number }) {
  const [open, setOpen] = useState(false);
  const deleteMut = useDeleteOwnRevenue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['revenues', year] });
        setOpen(false);
        toast({ title: "Revenue source deleted" });
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
          <DialogTitle>Delete Revenue Source</DialogTitle>
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
