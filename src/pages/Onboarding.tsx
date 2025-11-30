import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, onboardingCompleted } = useOnboarding();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Se já completou o onboarding, redireciona para o dashboard
    if (!loading && onboardingCompleted) {
      navigate("/dashboard");
    }
  }, [user, loading, onboardingCompleted, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <OnboardingWizard />;
}