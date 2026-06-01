import React, { useState } from 'react';
import { Step1Template, Step2Resources, Step3Availability, Step4Milestones, Step5AIAnalyzer, Step6Done } from './WizardSteps';
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

export default function OnboardingWizard({ onComplete }: { onComplete: (id: string, type: string) => void }) {
  const [step, setStep] = useState(1);

  const next = () => setStep(s => Math.min(6, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const [template, setTemplate] = useState<GoalTemplate>(DEFAULT_TEMPLATE);
  const [contextText, setContextText] = useState<string>('');
  // Track what resource was uploaded/scraped so we can save it after goal creation
  const [onboardingResource, setOnboardingResource] = useState<OnboardingResource | null>(null);
  const [availability, setAvailability] = useState({ hoursPerDay: 2, days: 5 });
  const [milestones, setMilestones] = useState<any[]>([
    { title: '', target_date: '' },
    { title: '', target_date: '' },
    { title: '', target_date: '' },
  ]);
  const [analysis, setAnalysis] = useState<any>(null);

  const STEPS = ['Template', 'Resources', 'Availability', 'Milestones', 'AI Analyzer', 'Done'];

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

      // Save the onboarding resource to the resources table so it appears in the Resources tab
      if (onboardingResource) {
        try {
          await resourcesApi.createResource(
            goalId,
            onboardingResource.filename,
            onboardingResource.url,
            onboardingResource.fileType,
          );
        } catch (e) {
          console.warn('Could not save onboarding resource:', e);
          // Non-fatal — goal is already created
        }
      }

      onComplete(goalId, template.type);
    } catch (err) {
      console.error(err);
      alert('Failed to create goal! Check the browser console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-background border border-border shadow-2xl rounded-2xl w-full max-w-3xl overflow-hidden glass">

        {/* Progress Header */}
        <div className="bg-muted/30 border-b border-border p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((label, index) => {
              const currentNum = index + 1;
              const isActive = currentNum === step;
              const isPast = currentNum < step;
              return (
                <div key={label} className="flex flex-col items-center flex-1 relative">
                  {index < STEPS.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-[2px] -translate-y-1/2 z-0 ${isPast ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors duration-300 ${
                    isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                    isPast ? 'bg-primary text-primary-foreground' :
                    'bg-card border border-border text-muted-foreground'
                  }`}>
                    {currentNum}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold mt-2 transition-colors duration-300 ${
                    isActive || isPast ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Area */}
        <div className="p-8 min-h-[400px] flex flex-col justify-center relative bg-background/50">
          {step === 1 && <Step1Template next={next} setTemplate={setTemplate} />}
          {step === 2 && (
            <Step2Resources
              next={next}
              back={back}
              setContextText={setContextText}
              setOnboardingResource={setOnboardingResource}
            />
          )}
          {step === 3 && <Step3Availability next={next} back={back} availability={availability} setAvailability={setAvailability} />}
          {step === 4 && <Step4Milestones next={next} back={back} milestones={milestones} setMilestones={setMilestones} />}
          {step === 5 && <Step5AIAnalyzer next={next} back={back} contextText={contextText} milestones={milestones} availability={availability} setAnalysis={setAnalysis} />}
          {step === 6 && <Step6Done finish={handleFinish} template={template} />}
        </div>

      </div>
    </div>
  );
}
