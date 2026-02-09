import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryCardProps {
  title: string;
  summary: string;
  bullets?: string[];
  tone?: "neutral" | "executive" | "technical";
}

export function SummaryCard({
  title,
  summary,
  bullets,
  tone = "neutral",
}: SummaryCardProps) {
  return (
    <Card className="my-2 overflow-hidden border-l-4 border-l-primary">
      <CardHeader className="bg-muted/30 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          {tone && tone !== "neutral" && (
            <Badge variant="outline" className="text-xs capitalize">
              {tone}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 text-sm leading-relaxed">
        <p className="mb-3">{summary}</p>
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
            {bullets.map((bullet, i) => (
              <li key={`bullet-${i}`}>{bullet}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
