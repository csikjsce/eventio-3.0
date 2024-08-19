import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import PersonalDetails from './PersonalDetails';
import EducationalDetails from './EducationalDetails';
import Interest from './Interest';
import AllDone from './AllDone';
import { yupResolver } from '@hookform/resolvers/yup';
import { PersonalDetailsSchema, personalDetailsSchema } from './validation';

export default function GetStarted() {
  const [currentStep, setCurrentStep] =
    React.useState<string>('PersonalDetails');

  const methods = useForm<PersonalDetailsSchema>({
    resolver: yupResolver(personalDetailsSchema(currentStep)),
    mode: 'onBlur',
    context: { currentStep },
    defaultValues: {
      studentId: '',
      gender: 'male',
      department: '',
      interests: [],
    },
  });

  // Retrieve form values using getValues

  const onSubmit = async () => {
    // const formValues = methods.getValues();
    // try {
    //   const response = await axiosCall('POST', '/p/update', true, formValues);
    //   console.log('User profile updated:', response);
    //   setCurrentStep('AllDone');
    // } catch (error) {
    //   console.error('Error updating user profile:', error);
    // }
    console.log('Form submitted');
    setCurrentStep('AllDone');
  };

  return (
    <FormProvider {...methods}>
      <div>
        {currentStep === 'PersonalDetails' && (
          <PersonalDetails setCurrentStep={setCurrentStep} />
        )}
        {currentStep === 'EducationalDetails' && (
          <EducationalDetails setCurrentStep={setCurrentStep} />
        )}
        {currentStep === 'Interest' && (
          <Interest
            setCurrentStep={setCurrentStep}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        )}
        {currentStep === 'AllDone' && <AllDone />}
      </div>
    </FormProvider>
  );
}
