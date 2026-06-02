import { useListBalanceSheetItems } from "@workspace/api-client-react";
import { useYearFilter, YearFilter } from "@/components/YearFilter";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BalanceSheet() {
  const year = useYearFilter(2025);
  const { data: items, isLoading, isFetching } = useListBalanceSheetItems({ year }, { query: { queryKey: ['balanceSheet', year] } });
  
  const loading = isLoading || isFetching;

  const assets = items?.filter(i => i.category === 'asset').sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const liabilities = items?.filter(i => i.category === 'liability').sort((a, b) => a.sortOrder - b.sortOrder) || [];
  const capital = items?.filter(i => i.category === 'capital').sort((a, b) => a.sortOrder - b.sortOrder) || [];

  const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
  const totalCapital = capital.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Balance Sheet</h1>
          <p className="text-muted-foreground mt-1">Assets, Liabilities, and Capital summary.</p>
        </div>
        <div className="flex items-center gap-4">
          <YearFilter defaultYear={2025} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="flex justify-between items-center">
              <span>Assets</span>
              {loading ? <Skeleton className="h-6 w-24" /> : <span>{formatCurrency(totalAssets)}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : assets.length > 0 ? (
              <div className="divide-y divide-border">
                {assets.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                    <span className="font-medium text-sm text-foreground/80">{asset.name}</span>
                    <span className="font-mono text-sm">{formatCurrency(asset.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">No assets recorded for {year}</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-t-4 border-t-orange-500">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="flex justify-between items-center">
                <span>Liabilities</span>
                {loading ? <Skeleton className="h-6 w-24" /> : <span>{formatCurrency(totalLiabilities)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : liabilities.length > 0 ? (
                <div className="divide-y divide-border">
                  {liabilities.map(liability => (
                    <div key={liability.id} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                      <span className="font-medium text-sm text-foreground/80">{liability.name}</span>
                      <span className="font-mono text-sm">{formatCurrency(liability.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No liabilities recorded for {year}</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="flex justify-between items-center">
                <span>Capital</span>
                {loading ? <Skeleton className="h-6 w-24" /> : <span>{formatCurrency(totalCapital)}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : capital.length > 0 ? (
                <div className="divide-y divide-border">
                  {capital.map(cap => (
                    <div key={cap.id} className="flex justify-between items-center p-4 hover:bg-muted/10 transition-colors">
                      <span className="font-medium text-sm text-foreground/80">{cap.name}</span>
                      <span className="font-mono text-sm">{formatCurrency(cap.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No capital recorded for {year}</div>
              )}
            </CardContent>
          </Card>
          
          {/* Balance check */}
          {!loading && (
            <div className={`p-4 rounded-lg border ${Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 1 ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400'} flex justify-between items-center font-bold`}>
              <span>Balance Check (Assets = Liabilities + Capital)</span>
              <span>{Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 1 ? 'Balanced' : 'Unbalanced'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
