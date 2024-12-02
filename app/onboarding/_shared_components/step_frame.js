import { ActiveButton, SecondaryButton, ConditionalButton } from '@/app/_components/global_components';
import styles from './step_frame.module.css';

export default function StepFrame({ 
  title,
  children,
  onNext,
  onBack,
  showSkip = false,
  data = {},
  requirements = { fields: [], checks: [], customChecks: [] },
  hideNextButton = false
}) {
  const checkRequirements = () => {
    // If using new checks format, prioritize it
    if (requirements.checks?.length > 0) {
      return requirements.checks.every(check => check.check(data));
    }

    // Fall back to legacy format if no checks defined
    const fieldsValid = requirements.fields?.length 
      ? requirements.fields.every(field => {
          const value = data?.[field]?.toString().trim();
          return value !== undefined && value !== '';
        })
      : true;

    const customChecksValid = requirements.customChecks?.length
      ? requirements.customChecks.every(check => check(data))
      : true;

    return fieldsValid && customChecksValid;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-[60vw] flex flex-col">
        {/* Title Section - Keeps animation */}
        <div 
          key={`title-${title}`}
          className={`min-h-[8vh] p-6 flex items-center justify-center ${styles.fadeIn}`}
        >
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        {/* Content Area - No animation, but keeps key for remounting */}
        <div 
          key={`content-${title}`}
          className="flex-1 p-6 min-h-[50vh] max-h-[50vh] overflow-y-auto border border-[var(--gray)] rounded-lg"
        >
          {children}
        </div> 

        {/* Navigation Container */}
        <div className="min-h-[8vh] p-6 flex justify-between items-center">
          <SecondaryButton onClick={onBack}>
            Back
          </SecondaryButton>

          <div className="flex items-center gap-6">
            {showSkip && (
              <div key={`skip-${title}`} className={styles.fadeIn}>
                <SecondaryButton onClick={onNext}>
                  Skip for now
                </SecondaryButton>
              </div>
            )}
            {!hideNextButton && (
              <ConditionalButton
                onClick={onNext}
                conditions={[
                  { 
                    check: checkRequirements(),
                    message: 'Please complete all required fields'
                  }
                ]}
              >
                Next
              </ConditionalButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}