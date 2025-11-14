import { MetricsCard } from "./MetricsCard";
import { RevenueCard } from "./RevenueCard";
import { SubscriptionsCard } from "./SubscriptionsCard";
import { CalendarCard } from "./CalendarCard";
import { DailyGoalCard } from "./DailyGoalCard";
import { ExerciseMinutesCard } from "./ExerciseMinutesCard";
import { VisitorsChart } from "./VisitorsChart";
import { UpgradeCard } from "./UpgradeCard";
import { CreateAccountCard } from "./CreateAccountCard";
import { metricsData } from "@/lib/mockData";

export function DashboardGrid() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            description={metric.description}
          />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard />
        <SubscriptionsCard />
        <CalendarCard />
        <DailyGoalCard />
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpgradeCard />
        <CreateAccountCard />
      </div>

      {/* Full Width Charts */}
      <ExerciseMinutesCard />
      <VisitorsChart />
    </div>
  );
}
