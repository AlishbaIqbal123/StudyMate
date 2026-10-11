import React from 'react';
import { StudyMateHero } from '../StudyMateHero.js';

interface LandingPageViewProps {
  onOpenDashboard?: () => void;
  onOpenVoice?: () => void;
  onOpenPlanner?: () => void;
  onOpenTelemetry?: () => void;
  onOpenAssignments?: () => void;
  onStudentChanged?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenDashboard,
  onOpenVoice,
  onOpenPlanner,
  onOpenTelemetry,
  onOpenAssignments,
}) => {
  return (
    <StudyMateHero
      onOpenDashboard={onOpenDashboard}
      onOpenVoice={onOpenVoice}
      onOpenPlanner={onOpenPlanner}
      onOpenTelemetry={onOpenTelemetry}
      onOpenAssignments={onOpenAssignments}
    />
  );
};

export default LandingPageView;
