import React from 'react';
import PersonalDetails from './PersonalDetails';
import EducationalDetails from './EducationalDetails';
import Interest from './Interest';
import AllDone from './AllDone';

export default function GetStarted() {
  const [currentStep, setCurrentStep] =
    React.useState<string>('PersonalDetails');
  return (
    <div>
      {currentStep === 'PersonalDetails' && (
        <PersonalDetails setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 'EducationalDetails' && (
        <EducationalDetails setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 'Interest' && (
        <Interest setCurrentStep={setCurrentStep} />
      )}
      {currentStep === 'AllDone' && <AllDone />}
    </div>
  );
}
