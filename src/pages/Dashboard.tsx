import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Users, FileText, CheckCircle, DollarSign, FileSearch, TrendingUp, Plus, UserPlus, Search, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

interface DashboardKPIs {
  total_clientes: number;
  total_propostas: number;
  propostas_aprovadas: number;
  propostas_pendentes: number;
  propostas_analise: number;
  valor_total_aprovado: number;
  ticket_medio: number;
  taxa_aprovacao: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { loading: onboardingLoading, onboardingCompleted } = useOnboarding();
  const [stats, setStats] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { trends, statusBreakdown, recentPropostas, loading: dashboardLoading } = useDashboardData();

  // Verifica se o onboarding foi completado e redireciona se necessário
  useEffect(() => {
    if (!onboardingLoading && !onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [onboardingLoading, onboardingCompleted, navigate]);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!profile?.empresa_id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .rpc('get_dashboard_kpis', { _empresa_id: profile.empresa_id });

      if (error) throw error;

      if (data && typeof data === 'object') {
        setStats(data as unknown as DashboardKPIs);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar estatísticas: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Atualizar em tempo real quando houver mudanças
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clientes' },
        () => loadStats()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'propostas' },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading || dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[110px] min-w-[170px] bg-muted/50 rounded-lg border animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do seu sistema de CRM
          </p>
        </div>

        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 overflow-x-auto pb-1">
          <StatCard
            title="Clientes"
            value={stats?.total_clientes || 0}
            icon={Users}
            iconColor="primary"
            description="Total cadastrados"
            trend={{ value: 12.5, isPositive: true }}
            sparklineData={trends.slice(0, 7).map(t => ({ value: t.count || 0 }))}
          />
          <StatCard
            title="Propostas"
            value={stats?.total_propostas || 0}
            icon={FileText}
            iconColor="primary"
            description="Total cadastradas"
            trend={{ value: 8.2, isPositive: true }}
            sparklineData={trends.slice(0, 7).map(t => ({ value: t.count || 0 }))}
          />
          <StatCard
            title="Em Análise"
            value={stats?.propostas_analise || 0}
            icon={FileSearch}
            iconColor="warning"
            description="Aguardando"
            trend={{ value: -3.1, isPositive: false }}
          />
          <StatCard
            title="Aprovação"
            value={`${(stats?.taxa_aprovacao || 0).toFixed(1)}%`}
            icon={TrendingUp}
            iconColor="primary"
            description="Taxa atual"
            trend={{ value: 5.4, isPositive: true }}
          />
          <StatCard
            title="Aprovadas"
            value={stats?.propostas_aprovadas || 0}
            icon={CheckCircle}
            iconColor="primary"
            description="Finalizadas"
            trend={{ value: 15.8, isPositive: true }}
          />
          <StatCard
            title="Ticket Médio"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(stats?.ticket_medio || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Média aprovado"
            trend={{ value: 7.3, isPositive: true }}
          />
          <StatCard
            title="Total"
            value={new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(stats?.valor_total_aprovado || 0)}
            icon={DollarSign}
            iconColor="primary"
            description="Valor aprovado"
            trend={{ value: 22.1, isPositive: true }}
          />
          <StatCard
            title="Pendentes"
            value={stats?.propostas_pendentes || 0}
            icon={FileText}
            iconColor="muted"
            description="Em aberto"
            trend={{ value: -1.5, isPositive: false }}
          />
        </div>

        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ações Rápidas</h3>
          <div className="flex gap-2.5 flex-wrap">
            <QuickActionCard
              title="Nova Proposta"
              icon={Plus}
              onClick={() => navigate('/propostas?new=true')}
            />
            <QuickActionCard
              title="Novo Cliente"
              icon={UserPlus}
              onClick={() => navigate('/clientes?new=true')}
            />
            <QuickActionCard
              title="Consultar Propostas"
              icon={Search}
              onClick={() => navigate('/propostas')}
            />
            <QuickActionCard
              title="Calendário"
              icon={CalendarIcon}
              onClick={() => {}}
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Tendência de Propostas</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {dashboardLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Propostas", color: "hsl(var(--chart-1))" },
                    total_valor: { label: "Valor Total", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="month"
                        className="text-xs"
                        tickFormatter={(value) => {
                          const [year, month] = value.split('-');
                          return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM', { locale: ptBR });
                        }}
                      />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Calendário</CardTitle>
              <CardDescription className="text-xs">Atividades</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0 text-xs [&_.rdp-day]:text-xs [&_.rdp-day]:h-7 [&_.rdp-day]:w-7 [&_.rdp-caption]:text-xs"
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Propostas por Status</CardTitle>
              <CardDescription>Distribuição atual</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <ChartContainer
                  config={{
                    count: { label: "Quantidade", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="status" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Propostas Recentes</CardTitle>
              <CardDescription>Últimas 5 propostas</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentPropostas.map((proposta) => (
                    <div
                      key={proposta.id}
                      className="flex items-center gap-2.5 cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-all border border-transparent hover:border-border/50"
                      onClick={() => navigate(`/propostas/${proposta.id}`)}
                    >
                      <Badge
                        variant={
                          proposta.status === 'aprovada'
                            ? 'default'
                            : proposta.status === 'recusada'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-[9px] h-5 px-1.5 font-semibold flex-shrink-0 rounded-sm"
                      >
                        {proposta.status}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight">{proposta.cliente_nome}</p>
                        <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">
                          {proposta.produto_nome} • {proposta.banco_nome}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(proposta.valor)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
