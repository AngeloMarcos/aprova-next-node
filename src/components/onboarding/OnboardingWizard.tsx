import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { BancoStep } from "./steps/BancoStep";
import { ProdutoStep } from "./steps/ProdutoStep";
import { FinalStep } from "./steps/FinalStep";
import { useOnboarding } from "@/hooks/useOnboarding";
import logoIcon from "@/assets/logo-icon.png";

export type OnboardingData = {
  banco?: {
    nome: string;
    cnpj?: string;
  };
  produto?: {
    nome: string;
    tipo_credito: string;
  };
};

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [completing, setCompleting] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Cadastro de Banco", description: "Adicione seu primeiro banco parceiro" },
    { number: 2, title: "Cadastro de Produto", description: "Configure seu primeiro produto financeiro" },
    { number: 3, title: "Finalização", description: "Tudo pronto para começar!" },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeOnboarding();
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
    } finally {
      setCompleting(false);
    }
  };

  const updateData = (stepData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...stepData }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-center pt-2">
            <img 
              src={logoIcon} 
              alt="AprovaCRM" 
              className="h-16 w-16 object-contain" 
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              Configuração Inicial
            </CardTitle>
            <CardDescription className="text-center text-base">
              Vamos configurar seu sistema em {totalSteps} passos simples
            </CardDescription>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Passo {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-center gap-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                  step.number === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.number < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <BancoStep 
                data={data} 
                updateData={updateData} 
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <ProdutoStep 
                data={data} 
                updateData={updateData} 
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <FinalStep 
                onComplete={handleComplete}
                onBack={handleBack}
                completing={completing}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}