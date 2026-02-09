"use client";

import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DataTableCellValue = string | number | boolean | null;
type DataTableRow = Partial<Record<string, DataTableCellValue>>;

function parseRowsInput(rows: string | DataTableRow[]): {
  parsedRows: DataTableRow[];
  parseError: boolean;
} {
  if (typeof rows !== "string") {
    return { parsedRows: Array.isArray(rows) ? rows : [], parseError: false };
  }

  try {
    const parsed = JSON.parse(rows);

    if (!Array.isArray(parsed)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("DataTable rows JSON is valid but not an array:", parsed);
      }

      return { parsedRows: [], parseError: true };
    }

    return { parsedRows: parsed as DataTableRow[], parseError: false };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to parse DataTable rows JSON:", error);
    }

    return { parsedRows: [], parseError: true };
  }
}

interface DataTableProps {
  title: string;
  columns: { key: string; label: string }[];
  /**
   * For best performance, treat `rows` as immutable: if you pass an array, pass a
   * new reference whenever its contents change.
   */
  rows: string | DataTableRow[];
  maxRows?: number;
}

export function DataTable({
  title,
  columns = [],
  rows,
  maxRows = 5,
}: DataTableProps) {
  const { parsedRows, parseError } = useMemo(() => parseRowsInput(rows), [rows]);

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
            {parseError ? (
              <TableRow>
                <TableCell
                  colSpan={Math.max(1, safeColumns.length)}
                  className="p-4 text-center text-xs text-muted-foreground"
                >
                  Unable to display rows. Expected a JSON array of row objects.
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, i) => (
                <TableRow key={`row-${i}`}>
                  {safeColumns.map((col, j) => {
                    const value = row[col.key];
                    return (
                      <TableCell key={`cell-${i}-${col.key}-${j}`}>
                        {value === null || value === undefined
                          ? "-"
                          : String(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
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
