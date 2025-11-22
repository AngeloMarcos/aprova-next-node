import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/DashboardLayout';

interface CadastrosLayoutProps {
  titulo: string;
  descricao?: string;
  children: ReactNode;
  botaoNovoLabel?: string;
  onNovoClick: () => void;
  isLoading?: boolean;
}

export function CadastrosLayout({
  titulo,
  descricao,
  children,
  botaoNovoLabel = 'Novo',
  onNovoClick,
  isLoading,
}: CadastrosLayoutProps) {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Cadastros</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{titulo}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-3xl font-bold">{titulo}</h1>
            {descricao && (
              <p className="text-sm text-muted-foreground">{descricao}</p>
            )}
          </div>
          <Button onClick={onNovoClick} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {botaoNovoLabel}
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </DashboardLayout>
  );
}
