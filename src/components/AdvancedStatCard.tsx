import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniSparkline } from "./MiniSparkline";
import { Badge } from "@/components/ui/badge";

interface AdvancedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  sparklineData?: number[];
  progress?: number; // 0-100 for progress bar
  badge?: string;
}

export function AdvancedStatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary",
  trend,
  sparklineData,
  progress,
  badge
}: AdvancedStatCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md border-border bg-card h-[110px] flex flex-col">
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          </div>
          {badge && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
              {badge}
            </Badge>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-between gap-2">
          <div className="flex flex-col justify-center">
            <div className="text-xl font-bold text-card-foreground leading-none mb-1">{value}</div>
            {trend && (
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-medium",
                trend.isPositive ? "text-chart-1" : "text-destructive"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end justify-center gap-1">
            {sparklineData && sparklineData.length > 0 && (
              <MiniSparkline 
                data={sparklineData} 
                color={trend?.isPositive ? 'oklch(var(--chart-1))' : 'oklch(var(--chart-3))'} 
              />
            )}
            {progress !== undefined && (
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
