import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Step1Template, Step2Resources, Step3Availability, Step4Milestones, Step6Done } from './WizardSteps';
import { goalsApi, resourcesApi } from '../../services/api';

// Supported goal templates
export type GoalTemplate = {
  title: string;
  category: string;
  type: string;
  isDSA: boolean;
};

// A resource captured during onboarding (URL or uploaded file)
export type OnboardingResource = {
  filename: string;
  url: string;
  fileType: 'url' | 'pdf' | 'txt';
};

const DEFAULT_TEMPLATE: GoalTemplate = {
  title: 'Master DSA (Striver A-Z)',
  category: 'DSA',
  type: 'dsa',
  isDSA: true,
};

export default function OnboardingWizard({
  onComplete,
  onClose,
}: {
  onComplete: (id: string, type: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const [template, setTemplate] = useState<GoalTemplate>(DEFAULT_TEMPLATE);
  const [contextText, setContextText] = useState<string>('');
  // Track all resources added during onboarding so they can be attached to the goal
  const [onboardingResources, setOnboardingResources] = useState<OnboardingResource[]>([]);
  const [availability, setAvailability] = useState({ hoursPerDay: 2, days: [0, 1, 2, 3, 4] });
  const [milestones, setMilestones] = useState<any[]>([
    { title: '', target_date: '' },
    { title: '', target_date: '' },
    { title: '', target_date: '' },
  ]);

  const STEPS = ['Template', 'Resources', 'Availability', 'Milestones', 'Done'];

  const handleFinish = async () => {
    try {
      const data = {
        title: template.title,
        category: template.category,
        type: template.type,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        milestones: milestones.filter(m => m.title && m.target_date),
      };

      const res = await goalsApi.createGoal(data);
      const goalId = res.id;

      // Save any onboarding resources to the resources table so they appear in the Resources tab
      if (onboardingResources.length > 0) {
        await Promise.all(onboardingResources.map(async (resource) => {
          try {
            await resourcesApi.createResource(
              goalId,
              resource.filename,
              resource.url,
              resource.fileType,
            );
          } catch (e) {
            console.warn('Could not save onboarding resource:', e);
            // Non-fatal — goal is already created
          }
        }));
      }

      onComplete(goalId, template.type);
    } catch (err) {
      console.error(err);
      alert('Failed to create goal! Check the browser console for details.');
    }
  };

  const handleClose = () => {
    if (step > 1 && !window.confirm('Leave setup? Your progress on this goal will be lost.')) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="relative bg-background border border-border shadow-2xl rounded-2xl w-full max-w-2xl sm:max-w-3xl overflow-hidden glass max-h-[90vh] flex flex-col">

        {/* Close — back to main menu */}
        <button
          onClick={handleClose}
          aria-label="Close and return to main menu"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Progress Header */}
        <div className="bg-muted/30 border-b border-border p-3 pr-12 sm:p-6 sm:pr-16 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max sm:min-w-0">
            {STEPS.map((label, index) => {
              const currentNum = index + 1;
              const isActive = currentNum === step;
              const isPast = currentNum < step;
              return (
                <div key={label} className="flex flex-col items-center flex-1 relative">
                  {index < STEPS.length - 1 && (
                    <div className={`absolute top-3 sm:top-4 left-1/2 w-full h-[2px] -translate-y-1/2 z-0 ${isPast ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm z-10 transition-colors duration-300 ${(
                    isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                    isPast ? 'bg-primary text-primary-foreground' :
                    'bg-card border border-border text-muted-foreground'
                  )}`}>
                    {currentNum}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mt-1 sm:mt-2 transition-colors duration-300 whitespace-nowrap px-1 ${(
                    isActive || isPast ? 'text-foreground' : 'text-muted-foreground'
                  )}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Area */}
        <div className="p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] flex flex-col justify-center relative bg-background/50 overflow-y-auto">
          {step === 1 && <Step1Template next={next} setTemplate={setTemplate} />}
          {step === 2 && (
            <Step2Resources
              next={next}
              back={back}
              setContextText={setContextText}
              resources={onboardingResources}
              setResources={setOnboardingResources}
            />
          )}
          {step === 3 && <Step3Availability next={next} back={back} availability={availability} setAvailability={setAvailability} />}
          {step === 4 && <Step4Milestones next={next} back={back} milestones={milestones} setMilestones={setMilestones} />}
          {step === 5 && <Step6Done finish={handleFinish} template={template} />}
        </div>

      </div>
    </div>
  );
}
