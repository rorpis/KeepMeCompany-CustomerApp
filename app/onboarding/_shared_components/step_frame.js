import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import styles from './step_frame.module.css';

export default function StepFrame({ 
  title,
  children,
  onNext,
  onBack,
  showSkip = false
}) {
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
            <ActiveButton onClick={onNext}>
              Next
            </ActiveButton>
          </div>
        </div>
      </div>
    </div>
  );
}