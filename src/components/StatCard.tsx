import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  iconColor?: "primary" | "muted" | "warning";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: Array<{ value: number }>;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  iconColor = "muted", 
  trend,
  sparklineData 
}: StatCardProps) {
  const iconColorClass = {
    primary: "text-primary",
    muted: "text-muted-foreground",
    warning: "text-warning"
  }[iconColor];

  // Generate placeholder sparkline data if none provided
  const defaultSparkline = Array.from({ length: 7 }, (_, i) => ({
    value: Math.random() * 100 + 50
  }));

  const chartData = sparklineData || defaultSparkline;

  return (
    <Card className="transition-all duration-200 hover:shadow-lg border-border/40 min-w-[170px] h-[110px]">
      <CardContent className="p-2.5 h-full flex flex-col justify-between">
        {/* Header: Icon + Title + Badge */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className={cn("flex-shrink-0 w-5 h-5 rounded-sm bg-primary/10 flex items-center justify-center")}>
              <Icon className={cn("h-3 w-3", iconColorClass)} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wide truncate">
              {title}
            </span>
          </div>
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"} 
              className="h-4 px-1.5 text-[9px] font-bold flex-shrink-0 rounded-sm"
            >
              {trend.isPositive ? '↑' : '↓'}{Math.abs(trend.value)}%
            </Badge>
          )}
        </div>

        {/* Main Value */}
        <div className="text-2xl font-bold tracking-tight leading-none">{value}</div>

        {/* Sparkline + Description */}
        <div className="space-y-0">
          <div className="h-8 -mx-0.5 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {description && (
            <p className="text-[9px] text-muted-foreground/60 truncate leading-tight pt-0.5">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
