import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function QuickActionCard({ title, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "w-14 h-14 flex items-center justify-center cursor-pointer transition-all duration-200 border-border/40",
              "hover:border-primary hover:shadow-lg hover:scale-105 group"
            )}
            onClick={onClick}
          >
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
