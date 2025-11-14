import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your analytics dashboard</p>
        </div>
        
        <DashboardGrid />
      </div>
    </div>
  );
};

export default Index;
