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

type DataTableCellValue = string | number | boolean | null | undefined;

interface DataTableProps {
  title: string;
  columns: { key: string; label: string }[];
  rows: string | Record<string, DataTableCellValue>[];
  maxRows?: number;
}

export function DataTable({
  title,
  columns = [],
  rows,
  maxRows = 5,
}: DataTableProps) {
  const parsedRows = useMemo((): Record<string, DataTableCellValue>[] => {
    if (typeof rows === "string") {
      try {
        const parsed = JSON.parse(rows);
        return Array.isArray(parsed) ? (parsed as Record<string, DataTableCellValue>[]) : [];
      } catch {
        return [];
      }
    }

    return Array.isArray(rows) ? rows : [];
  }, [rows]);

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
                    {row[col.key] === null || row[col.key] === undefined
                      ? "-"
                      : String(row[col.key])}
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
