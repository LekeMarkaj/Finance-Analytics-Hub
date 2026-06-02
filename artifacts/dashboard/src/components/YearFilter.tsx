import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useSearch } from "wouter";

export function YearFilter({ defaultYear = 2025 }: { defaultYear?: number }) {
  const [location] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const currentYear = searchParams.get("year") || defaultYear.toString();

  const handleYearChange = (year: string) => {
    searchParams.set("year", year);
    window.history.replaceState(null, "", `${location}?${searchParams.toString()}`);
    // A quick hack to force re-render, though ideally we'd use a context or proper router hook
    window.dispatchEvent(new Event("popstate")); 
  };

  const years = ["2025", "2024", "2023", "2022"];

  return (
    <Select value={currentYear} onValueChange={handleYearChange}>
      <SelectTrigger className="w-[120px] bg-card font-medium">
        <SelectValue placeholder="Select Year" />
      </SelectTrigger>
      <SelectContent>
        {years.map(y => (
          <SelectItem key={y} value={y}>{y}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useYearFilter(defaultYear = 2025) {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  return parseInt(searchParams.get("year") || defaultYear.toString(), 10);
}
