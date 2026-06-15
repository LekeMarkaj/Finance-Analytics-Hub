import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetCustomDataset, useListCustomDataRows, useCreateCustomDataRow, useUpdateCustomDataRow, useDeleteCustomDataRow, useUpdateCustomDataset } from "@workspace/api-client-react";
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
import { Trash2, Edit, Plus, ArrowLeft } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
  orange: "#f97316",
  teal: "#14b8a6",
  cyan: "#06b6d4"
};

const DEFAULT_COLOR = CHART_COLORS.blue;

function CustomTooltip({ active, payload, label, yLabel }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "10px 14px", border: "1px solid #e0e0e0", color: "#1a1a1a", fontSize: "13px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
      {label && <div style={{ marginBottom: "6px", fontWeight: 600 }}>{label}</div>}
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "2px", backgroundColor: entry.color || entry.payload?.color || entry.payload?.fill, flexShrink: 0 }} />
          <span style={{ color: "#555" }}>{entry.name || yLabel || 'Value'}:</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CustomDatasetDetail() {
  const [, params] = useRoute<{ id: string }>("/custom/:id");
  const datasetId = parseInt(params?.id || "0", 10);
  
  const queryClient = useQueryClient();
  const datasetQuery = useGetCustomDataset(datasetId, { query: { enabled: !!datasetId, queryKey: ['customDataset', datasetId] } });
  const rowsQuery = useListCustomDataRows(datasetId, { query: { enabled: !!datasetId, queryKey: ['customDataRows', datasetId] } });
  const updateDatasetMut = useUpdateCustomDataset();
  const { toast } = useToast();

  const dataset = datasetQuery.data;
  const rows = rowsQuery.data?.sort((a, b) => a.sortOrder - b.sortOrder) || [];

  const loading = datasetQuery.isLoading || datasetQuery.isFetching || rowsQuery.isLoading || rowsQuery.isFetching;

  const handleTypeChange = (val: any) => {
    if (!dataset) return;
    updateDatasetMut.mutate({ id: datasetId, data: { ...dataset, chartType: val } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customDataset', datasetId] });
        toast({ title: "Chart type updated" });
      }
    });
  };

  const renderChart = () => {
    if (!dataset || rows.length === 0) return (
      <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
        Add some data rows to see the preview
      </div>
    );

    const type = dataset.chartType;

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400} debounce={0}>
          <PieChart>
            <Pie
              data={rows}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={130}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
              isAnimationActive={false}
            >
              {rows.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || Object.values(CHART_COLORS)[index % 8]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400} debounce={0}>
        {type === 'bar' ? (
          <BarChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} tickLine={false} label={{ value: dataset.xAxisLabel, position: 'insideBottom', offset: -10, fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} label={{ value: dataset.yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: "#6b7280" }} />
            <RechartsTooltip content={<CustomTooltip yLabel={dataset.yAxisLabel} />} cursor={{ fill: "rgba(0,0,0,0.04)" }} isAnimationActive={false} />
            <Bar dataKey="value" name={dataset.yAxisLabel || "Value"} radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {rows.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLOR} />
              ))}
            </Bar>
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} tickLine={false} label={{ value: dataset.xAxisLabel, position: 'insideBottom', offset: -10, fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} label={{ value: dataset.yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: "#6b7280" }} />
            <RechartsTooltip content={<CustomTooltip yLabel={dataset.yAxisLabel} />} cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Line type="monotone" dataKey="value" name={dataset.yAxisLabel || "Value"} stroke={DEFAULT_COLOR} strokeWidth={3} dot={{ r: 4, fill: DEFAULT_COLOR }} activeDot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        ) : (
          <AreaChart data={rows} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={DEFAULT_COLOR} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={DEFAULT_COLOR} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} tickLine={false} label={{ value: dataset.xAxisLabel, position: 'insideBottom', offset: -10, fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} label={{ value: dataset.yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 12, fill: "#6b7280" }} />
            <RechartsTooltip content={<CustomTooltip yLabel={dataset.yAxisLabel} />} isAnimationActive={false} />
            <Area type="monotone" dataKey="value" name={dataset.yAxisLabel || "Value"} stroke={DEFAULT_COLOR} strokeWidth={2} fillOpacity={1} fill="url(#areaGradient)" isAnimationActive={false} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Link href="/custom" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Datasets
        </Link>
        
        {datasetQuery.isLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{dataset?.name}</h1>
              <p className="text-muted-foreground mt-1">{dataset?.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dataset?.chartType} onValueChange={handleTypeChange} disabled={updateDatasetMut.isPending}>
                <SelectTrigger className="w-[150px] bg-card">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[400px] w-full" /> : renderChart()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Data Rows</CardTitle>
            <DataRowFormDialog datasetId={datasetId} nextSortOrder={rows.length + 1} />
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-[80px] text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {row.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                            <span className="font-medium">{row.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DataRowFormDialog row={row} datasetId={datasetId} />
                            <DeleteDataRowDialog id={row.id} label={row.label} datasetId={datasetId} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground text-sm">
                          No data rows added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataRowFormDialog({ row, datasetId, nextSortOrder = 1 }: { row?: any, datasetId: number, nextSortOrder?: number }) {
  const [open, setOpen] = useState(false);
  const isEditing = !!row;
  const [label, setLabelStr] = useState(row?.label || "");
  const [value, setValue] = useState(row?.value?.toString() || "");
  const [color, setColor] = useState(row?.color || "");

  const createMut = useCreateCustomDataRow();
  const updateMut = useUpdateCustomDataRow();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      label,
      value: parseFloat(value) || 0,
      color: color || undefined,
      sortOrder: row?.sortOrder ?? nextSortOrder
    };

    if (isEditing) {
      updateMut.mutate({ datasetId, rowId: row.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['customDataRows', datasetId] });
          setOpen(false);
          toast({ title: "Row updated" });
        }
      });
    } else {
      createMut.mutate({ datasetId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['customDataRows', datasetId] });
          setOpen(false);
          setLabelStr("");
          setValue("");
          setColor("");
          toast({ title: "Row added" });
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
          <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Row</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Data Row' : 'Add Data Row'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Data Label</Label>
            <Input id="label" value={label} onChange={e => setLabelStr(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Numeric Value</Label>
            <Input id="value" type="number" step="any" value={value} onChange={e => setValue(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Custom Color (Hex) - Optional</Label>
            <div className="flex gap-2">
              <Input id="color" value={color} onChange={e => setColor(e.target.value)} placeholder="#0079F2" />
              <div className="w-10 h-10 rounded border" style={{ backgroundColor: color || '#f3f4f6' }} />
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

function DeleteDataRowDialog({ id, label, datasetId }: { id: number, label: string, datasetId: number }) {
  const [open, setOpen] = useState(false);
  const deleteMut = useDeleteCustomDataRow();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMut.mutate({ datasetId, rowId: id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['customDataRows', datasetId] });
        setOpen(false);
        toast({ title: "Row deleted" });
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
          <DialogTitle>Delete Row</DialogTitle>
        </DialogHeader>
        <p>Delete <strong>{label}</strong>?</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMut.isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
