import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataTableProps {
  title: string;
  columns: { key: string; label: string }[];
  rows: string | Record<string, string | number | boolean | null>[];
  maxRows?: number;
}

export function DataTable({
  title,
  columns = [],
  rows,
  maxRows = 5,
}: DataTableProps) {
  let parsedRows: Record<string, string | number | boolean | null>[] = [];

  if (typeof rows === "string") {
    try {
      const parsed = JSON.parse(rows);
      parsedRows = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse DataTable rows:", e);
      parsedRows = [];
    }
  } else if (Array.isArray(rows)) {
    parsedRows = rows;
  } else {
    parsedRows = [];
  }

  const safeColumns = columns || [];
  const displayRows = parsedRows.slice(0, maxRows);

  return (
    <Card className="my-2 overflow-hidden">
      <CardHeader className="bg-muted/30 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {safeColumns.map((col, idx) => (
                <TableHead key={`${col.key}-${idx}`}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, i) => (
              <TableRow key={`row-${i}`}>
                {safeColumns.map((col, j) => (
                  <TableCell key={`cell-${i}-${col.key}-${j}`}>
                    {row[col.key] !== null ? String(row[col.key]) : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {parsedRows.length > maxRows && (
          <div className="bg-muted/10 p-2 text-center text-xs text-muted-foreground">
            Showing {maxRows} of {parsedRows.length} rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}
