import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphProps {
  title: string;
  type: "bar" | "line" | "pie";
  data: { name: string; value: number }[];
  xLabel?: string;
  yLabel?: string;
}

export function Graph({ title, type, data = [], xLabel, yLabel }: GraphProps) {
  const safeData = Array.isArray(data) ? data : [];
  const maxValue = Math.max(...safeData.map((d) => d.value), 1);

  return (
    <Card className="my-2 overflow-hidden">
      <CardHeader className="bg-muted/30 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title} ({type} chart)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          {safeData.map((d, idx) => (
            <div
              key={`${d.name}-${idx}`}
              className="flex items-center gap-2 text-sm"
            >
              <div className="w-24 shrink-0 truncate text-right font-medium">
                {d.name}
              </div>
              <div className="flex-1 h-4 bg-muted overflow-hidden rounded-full">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(d.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="w-12 shrink-0 text-right tabular-nums">
                {d.value}
              </div>
            </div>
          ))}
        </div>
        {(xLabel || yLabel) && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            {xLabel} {xLabel && yLabel && "/"} {yLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
