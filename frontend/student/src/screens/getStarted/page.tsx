import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import PersonalDetails from './PersonalDetails';
import EducationalDetails from './EducationalDetails';
import Interest from './Interest';
import AllDone from './AllDone';
import { yupResolver } from '@hookform/resolvers/yup';
import { PersonalDetailsSchema, personalDetailsSchema } from './validation';
import { axiosCall } from '../../utils/api';

export default function GetStarted() {
  const [currentStep, setCurrentStep] =
    React.useState<string>('PersonalDetails');

  const methods = useForm<PersonalDetailsSchema>({
    resolver: yupResolver(personalDetailsSchema(currentStep)),
    mode: 'onTouched',
    context: { currentStep },
    defaultValues: {
      roll_number: '',
      gender: 'male',
      interests: [],
    },
  });

  // Retrieve form values using getValues

  const onSubmit = async () => {
    const formValues = methods.getValues();
    const submissionData = {
      ...formValues,
      degree: 'B.tech',
      college: 'KJSCE',
    };
    try {
      const response = await axiosCall(
        'POST',
        '/user/p/update',
        true,
        submissionData,
      );
      console.log('User profile updated:', response);
      setCurrentStep('AllDone');
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
    // console.log(methods.getValues());
    // setCurrentStep('AllDone');
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
