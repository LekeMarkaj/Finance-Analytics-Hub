import { useState } from "react";
import { Link } from "wouter";
import { useListCustomDatasets, useCreateCustomDataset, useUpdateCustomDataset, useDeleteCustomDataset } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, Database, ChevronRight, BarChart3, LineChart, PieChart, AreaChart } from "lucide-react";
import { format } from "date-fns";

export default function CustomDatasets() {
  const { data: datasets, isLoading, isFetching } = useListCustomDatasets({ query: { queryKey: ['customDatasets'] } });
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Custom Datasets</h1>
          <p className="text-muted-foreground mt-1">Create and manage your own custom data visualizations.</p>
        </div>
        <DatasetFormDialog />
      </div>

      <Card>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Chart Type</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets?.map(dataset => (
                  <TableRow key={dataset.id} className="group cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/custom/${dataset.id}`} className="hover:underline flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        {dataset.name}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-xs">{dataset.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {dataset.chartType === 'bar' && <BarChart3 className="w-4 h-4 text-blue-500" />}
                        {dataset.chartType === 'line' && <LineChart className="w-4 h-4 text-green-500" />}
                        {dataset.chartType === 'pie' && <PieChart className="w-4 h-4 text-purple-500" />}
                        {dataset.chartType === 'area' && <AreaChart className="w-4 h-4 text-orange-500" />}
                        <span className="capitalize">{dataset.chartType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(dataset.updatedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <DatasetFormDialog dataset={dataset} />
                        <DeleteDatasetDialog id={dataset.id} name={dataset.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!datasets || datasets.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Database className="w-12 h-12 text-muted-foreground/30" />
                        <p>No custom datasets created yet.</p>
                      </div>
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

function DatasetFormDialog({ dataset }: { dataset?: any }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!dataset;
  const [name, setName] = useState(dataset?.name || "");
  const [description, setDescription] = useState(dataset?.description || "");
  const [chartType, setChartType] = useState<'bar'|'line'|'pie'|'area'>(dataset?.chartType || "bar");
  const [xAxisLabel, setXAxisLabel] = useState(dataset?.xAxisLabel || "");
  const [yAxisLabel, setYAxisLabel] = useState(dataset?.yAxisLabel || "");

  const createMut = useCreateCustomDataset();
  const updateMut = useUpdateCustomDataset();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      chartType,
      xAxisLabel,
      yAxisLabel
    };

    if (isEditing) {
      updateMut.mutate({ id: dataset.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['customDatasets'] });
          queryClient.invalidateQueries({ queryKey: ['customDataset', dataset.id] });
          setOpen(false);
          toast({ title: "Dataset updated" });
        }
      });
    } else {
      createMut.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['customDatasets'] });
          setOpen(false);
          setName("");
          setDescription("");
          setChartType("bar");
          setXAxisLabel("");
          setYAxisLabel("");
          toast({ title: "Dataset created" });
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
          <Button><Plus className="w-4 h-4 mr-2" /> New Dataset</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Dataset' : 'Create Dataset'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dataset Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <Select value={chartType} onValueChange={(val: any) => setChartType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(chartType !== 'pie') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xLabel">X-Axis Label (Optional)</Label>
                <Input id="xLabel" value={xAxisLabel} onChange={e => setXAxisLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yLabel">Y-Axis Label (Optional)</Label>
                <Input id="yLabel" value={yAxisLabel} onChange={e => setYAxisLabel(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDatasetDialog({ id, name }: { id: number, name: string }) {
  const [open, setOpen] = useState(false);
  const deleteMut = useDeleteCustomDataset();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMut.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customDatasets'] });
        setOpen(false);
        toast({ title: "Dataset deleted" });
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
          <DialogTitle>Delete Dataset</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete <strong>{name}</strong>? All associated data rows will be lost permanently.</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
