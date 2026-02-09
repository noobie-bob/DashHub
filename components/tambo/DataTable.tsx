import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { z } from "zod";

interface DataTableProps {
  title: string;
  columns: { key: string; label: string }[];
  rows: Array<Record<string, string | number | boolean | null | undefined>>;
  maxRows?: number;
}

export function DataTable({
  title,
  columns,
  rows,
  maxRows = 5,
}: DataTableProps) {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeRows = Array.isArray(rows) ? rows : [];
  const displayRows = safeRows.slice(0, maxRows);

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
                {safeColumns.map((col, j) => {
                  const value = row[col.key];

                  return (
                    <TableCell key={`cell-${i}-${col.key}-${j}`}>
                      {value == null ? "-" : String(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {safeRows.length > maxRows && (
          <div className="bg-muted/10 p-2 text-center text-xs text-muted-foreground">
            Showing {maxRows} of {safeRows.length} rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DataTableRowsSchema = z.array(
  z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
);

let hasWarnedInvalidJson = false;
let hasWarnedWrongShape = false;

function warnInvalidJson(error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error("Failed to parse DataTable rows JSON:", error);
    return;
  }

  if (hasWarnedInvalidJson) return;
  console.warn("Failed to parse DataTable rows JSON.");
  hasWarnedInvalidJson = true;
}

function warnWrongShape(details: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error("DataTable rows JSON had an unexpected shape:", details);
    return;
  }

  if (hasWarnedWrongShape) return;
  console.warn("DataTable rows JSON had an unexpected shape.");
  hasWarnedWrongShape = true;
}

interface DataTableToolProps {
  title: string;
  columns: { key: string; label: string }[];
  rows: string;
  maxRows?: number;
}

export function DataTableTool({
  title,
  columns,
  rows,
  maxRows,
}: DataTableToolProps) {
  const parsedRows = useMemo(() => {
    try {
      const parsed = JSON.parse(rows);
      const result = DataTableRowsSchema.safeParse(parsed);
      if (!result.success) {
        warnWrongShape(result.error);
        return {
          ok: false,
          error: "DataTable rows must be a JSON array of objects.",
        } as const;
      }

      return { ok: true, rows: result.data } as const;
    } catch (error) {
      warnInvalidJson(error);
      return { ok: false, error: "DataTable rows were not valid JSON." } as const;
    }
  }, [rows]);

  if (!parsedRows.ok) {
    return (
      <div className="rounded-md border border-dashed bg-muted/10 p-4 text-sm">
        <p className="font-medium">Unable to render DataTable</p>
        <p className="mt-1 text-muted-foreground">{parsedRows.error}</p>
      </div>
    );
  }

  return (
    <DataTable
      title={title}
      columns={columns}
      rows={parsedRows.rows}
      maxRows={maxRows}
    />
  );
}
