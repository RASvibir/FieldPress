import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Landmark, Users } from "lucide-react";
import { SCALE_LABEL, type TrendDesk, type TrendItem, type TrendScale } from "@/lib/trend-desk";

const SCALE_STYLE: Record<TrendScale, { color: string; border: string; Icon: typeof Users }> = {
  relatable: { color: "text-neon-yellow", border: "border-neon-yellow/30", Icon: Users },
  national: { color: "text-neon", border: "border-neon/30", Icon: Landmark },
  global: { color: "text-neon-red", border: "border-neon-red/30", Icon: Globe },
};

function TrendCard({
  trend,
  compact,
  onInsert,
}: {
  trend: TrendItem;
  compact?: boolean;
  onInsert?: (text: string) => void;
}) {
  const style = SCALE_STYLE[trend.scale] ?? SCALE_STYLE.relatable;
  const Icon = style.Icon;
  return (
    <Card
      className={`${style.border} bg-card ${onInsert ? "cursor-pointer hover:border-neon/40" : ""}`}
      onClick={onInsert ? () => onInsert(trend.productHook) : undefined}
      title={onInsert ? "Click to insert this hook" : undefined}
    >
      <CardContent className={compact ? "p-2" : "p-3"}>
        <div className="flex items-start gap-2">
          <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${style.color}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`${style.color} border-current text-[9px]`}>
                {SCALE_LABEL[trend.scale]}
              </Badge>
              {trend.source && (
                <span className="text-[10px] text-muted-foreground truncate">{trend.source}</span>
              )}
            </div>
            <p className={`text-sm ${style.color}`}>{trend.headline}</p>
            {!compact && (
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{trend.whyItMatters}</p>
            )}
            <p className="text-[11px] text-foreground/80 mt-1 leading-relaxed">{trend.productHook}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendDeskPanel({
  desk,
  compact,
  onInsert,
}: {
  desk: TrendDesk;
  compact?: boolean;
  onInsert?: (text: string) => void;
}) {
  if (!desk.whyNow && !desk.audience && desk.trends.length === 0 && !desk.summary) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className={`tracking-wider ${compact ? "text-xs text-muted-foreground" : "text-lg text-neon"}`}>
          TREND DESK
        </h2>
        {desk.searchedAt && (
          <span className="text-[10px] text-muted-foreground">
            {typeof desk.headlineCount === "number"
              ? `${desk.headlineCount} headlines · `
              : ""}
            {new Date(desk.searchedAt).toLocaleString()}
          </span>
        )}
      </div>
      {desk.whyNow && (
        <Card className="border-cyan-400/20 bg-card">
          <CardContent className={compact ? "p-2" : "p-3"}>
            <div className="text-[10px] text-cyan-300 tracking-widest mb-1">WHY NOW</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{desk.whyNow}</p>
          </CardContent>
        </Card>
      )}
      {desk.audience && (
        <Card className="border-neon-yellow/20 bg-card">
          <CardContent className={compact ? "p-2" : "p-3"}>
            <div className="text-[10px] text-neon-yellow tracking-widest mb-1">AUDIENCE</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{desk.audience}</p>
          </CardContent>
        </Card>
      )}
      {desk.trends.length > 0 && (
        <div className="space-y-2">
          {desk.trends.map((trend, index) => (
            <TrendCard key={`${trend.scale}-${index}`} trend={trend} compact={compact} onInsert={onInsert} />
          ))}
        </div>
      )}
      {!compact && desk.outline.length > 0 && (
        <Card className="border-neon/10 bg-card">
          <CardContent className="p-3">
            <div className="text-[10px] text-neon tracking-widest mb-2">OUTLINE</div>
            <ol className="space-y-1">
              {desk.outline.map((item, index) => (
                <li key={index} className="text-sm text-foreground/80">
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
