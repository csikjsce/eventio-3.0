import React, { useEffect, useState, useContext } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import PersonalDetails from './PersonalDetails';
import EducationalDetails from './EducationalDetails';
import Interest from './Interest';
import AllDone from './AllDone';
import { yupResolver } from '@hookform/resolvers/yup';
import { PersonalDetailsSchema, personalDetailsSchema } from './validation';
import { axiosCall } from '../../utils/api';
import { UserDataContext } from '../../contexts/userContext';
import Loader from '../../components/Loader';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type errorType = {
  message?: string;
};

export default function GetStarted() {
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { userData } = useContext(UserDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      userData &&
      (userData.phone_number != null || userData.roll_number != null)
    ) {
      navigate('/');
    } else {
      setLoading(false);
    }
  }, [userData]);

  const [currentStep, setCurrentStep] =
    React.useState<string>('PersonalDetails');

  const methods = useForm<PersonalDetailsSchema>({
    resolver: yupResolver(personalDetailsSchema(currentStep)),
    mode: 'onTouched',
    context: { currentStep },
    defaultValues: {
      roll_number: '',
      gender: 'Male',
      interests: [],
    },
  });

  const onSubmit = async () => {
    const formValues = methods.getValues();
    const user = userData;

    if (!user || !user.id) {
      setSnackbarMessage('User ID not found.');
      setSnackbarVisible(true);
      setTimeout(() => setSnackbarVisible(false), 3000); // Hide after 3 seconds
      return;
    }

    const submissionData = {
      ...formValues,
      degree: 'B.tech',
      college: 'KJSCE',
      id: user.id,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: errorType | any) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setSnackbarMessage(error.message);
        setSnackbarVisible(true);
        setTimeout(() => setSnackbarVisible(false), 3000); // Hide after 3 seconds
      } else {
        console.error('Error updating user profile:', String(error));
      }
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <FormProvider {...methods}>
          <div className="">
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
      )}

      {snackbarVisible && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-primary text-white p-4 rounded-md z-40">
          {snackbarMessage}
        </div>
      )}
    </>
  );
}
