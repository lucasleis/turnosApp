import { cn } from "@/lib/utils";

const STEPS = ["Servicio", "Barbero", "Fecha", "Confirmar"];

export function ProgressBar({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  isCompleted && "bg-accent text-white",
                  isActive && "bg-zinc-900 text-white ring-2 ring-accent ring-offset-2",
                  !isCompleted && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  "text-xs hidden sm:block",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 mb-4",
                  isCompleted ? "bg-accent" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
