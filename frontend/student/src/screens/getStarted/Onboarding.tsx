import React, { useState } from 'react';
import GetStarted from './GetStarted';
import PersonalDetails from './PersonalDetails';
import EducationalDetails from './EducationalDetails';
import Interest from './Interest';
import AllDone from './AllDone';

type OnboardingStep = 'GetStarted' | 'PersonalDetails' | 'EducationalDetails' | 'Interest' | 'AllDone';

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('GetStarted');

  const nextStep = () => {
    switch (currentStep) {
      case 'GetStarted':
        setCurrentStep('PersonalDetails');
        break;
      case 'PersonalDetails':
        setCurrentStep('EducationalDetails');
        break;
      case 'EducationalDetails':
        setCurrentStep('Interest');
        break;
      case 'Interest':
        setCurrentStep('AllDone');
        break;
      default:
        break;
    }
  };

  const previousStep = () => {
    switch (currentStep) {
      case 'PersonalDetails':
        setCurrentStep('GetStarted');
        break;
      case 'EducationalDetails':
        setCurrentStep('PersonalDetails');
        break;
      case 'Interest':
        setCurrentStep('EducationalDetails');
        break;
      case 'AllDone':
        setCurrentStep('Interest');
        break;
      default:
        break;
    }
  };

  return (
    <div>
      {currentStep === 'GetStarted' && <GetStarted continueWithGoogle={nextStep} />}
      {currentStep === 'PersonalDetails' && (
        <PersonalDetails nextStep={nextStep} previousStep={previousStep} />
      )}
      {currentStep === 'EducationalDetails' && (
        <EducationalDetails nextStep={nextStep} previousStep={previousStep} />
      )}
      {currentStep === 'Interest' && (
        <Interest nextStep={nextStep} previousStep={previousStep} />
      )}
      {currentStep === 'AllDone' && <AllDone previousStep={previousStep} />}
    </div>
  );
};

export default Onboarding;
