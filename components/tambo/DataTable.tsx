import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useRef } from "react";
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
  z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]))
);

const WARN_INTERVAL_MS = 60_000;

type DataTableParseWarn =
  | { kind: "invalidJson"; detail: unknown }
  | { kind: "wrongShape"; detail: unknown };

type DataTableParseResult =
  | { ok: true; rows: z.infer<typeof DataTableRowsSchema>; warn: null }
  | { ok: false; error: string; warn: DataTableParseWarn | null };

function parseDataTableRows(rows: string | unknown[]): DataTableParseResult {
  if (Array.isArray(rows)) {
    const result = DataTableRowsSchema.safeParse(rows);
    if (!result.success) {
      return {
        ok: false,
        error: "DataTable rows must be a JSON array of objects.",
        warn: { kind: "wrongShape", detail: result.error },
      };
    }

    return { ok: true, rows: result.data, warn: null };
  }

  if (typeof rows !== "string") {
    return {
      ok: false,
      error: "DataTable rows must be a JSON array of objects.",
      warn: { kind: "wrongShape", detail: rows },
    };
  }

  try {
    const parsed = JSON.parse(rows);
    const result = DataTableRowsSchema.safeParse(parsed);
    if (!result.success) {
      return {
        ok: false,
        error: "DataTable rows must be a JSON array of objects.",
        warn: { kind: "wrongShape", detail: result.error },
      };
    }

    return { ok: true, rows: result.data, warn: null };
  } catch (error) {
    return {
      ok: false,
      error: "DataTable rows were not valid JSON.",
      warn: { kind: "invalidJson", detail: error },
    };
  }
}

function logDataTableWarning(
  parsedRows: DataTableParseResult,
  lastWarnAtRef: { current: { invalidJson: number; wrongShape: number } }
) {
  if (parsedRows.ok || !parsedRows.warn) return;

  if (process.env.NODE_ENV !== "production") {
    if (parsedRows.warn.kind === "invalidJson") {
      console.error("Failed to parse DataTable rows JSON:", parsedRows.warn.detail);
      return;
    }

    console.error(
      "DataTable rows JSON had an unexpected shape:",
      parsedRows.warn.detail
    );
    return;
  }

  const now = Date.now();
  const last = lastWarnAtRef.current[parsedRows.warn.kind];
  if (now - last < WARN_INTERVAL_MS) return;

  lastWarnAtRef.current[parsedRows.warn.kind] = now;

  if (parsedRows.warn.kind === "invalidJson") {
    console.warn("Failed to parse DataTable rows JSON.");
    return;
  }

  console.warn("DataTable rows JSON had an unexpected shape.");
}

interface DataTableToolProps {
  title: string;
  columns: { key: string; label: string }[];
  rows: string | unknown[];
  maxRows?: number;
}

export function DataTableTool({
  title,
  columns,
  rows,
  maxRows,
}: DataTableToolProps) {
  const lastWarnAtRef = useRef({ invalidJson: 0, wrongShape: 0 });

  const parsedRows = useMemo(() => parseDataTableRows(rows), [rows]);

  useEffect(() => {
    logDataTableWarning(parsedRows, lastWarnAtRef);
  }, [parsedRows]);

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
