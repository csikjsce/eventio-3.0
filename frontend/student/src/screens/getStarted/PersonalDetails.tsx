import React from 'react';
import { Input, Option, Select, Typography } from '@material-tailwind/react';
import Quote from '../../components/Quote';
import { useFormContext } from 'react-hook-form';
import { PersonalDetailsSchema } from './validation'; // Ensure this is correctly imported

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function PersonalDetails({ setCurrentStep }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues, // Use getValues instead of watch
  } = useFormContext<PersonalDetailsSchema>(); // Use the correct schema type

  console.log(errors);

  const onSubmit = () => {
    setCurrentStep('EducationalDetails');
  };

  const handleGenderChange = (value: string) => {
    setValue('gender', value as 'male' | 'female');
  };

  const [darkMode, setDarkMode] = React.useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      setDarkMode(event.matches);
    });

  return (
    <div className="flex flex-col justify-between min-h-screen p-6 ">
      <form onSubmit={handleSubmit(onSubmit)} className="font-fira">
        <Typography
          variant="h4"
          className="mb-4 font-bold font-fira text-foreground-light dark:text-foreground-dark"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Personal Details
        </Typography>
        <Typography
          variant="h5"
          className="mb-4 font-fira text-foreground-light dark:text-foreground-dark"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Fill out your personal details
        </Typography>
        <div className="mb-6 space-y-6">
          <div>
            <Input
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              {...register('phone_number')}
              className="min-h-10"
              color={darkMode ? 'white' : undefined}
              label="Mobile Number"
              type="number"
            />
            {errors.phone_number && (
              <p className="text-red-500">{errors.phone_number?.message}</p>
            )}
          </div>

          <div>
            <Input
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              {...register('roll_number')}
              className="min-h-min"
              color={darkMode ? 'white' : undefined}
              label="Student Id"
              type="number"
            />
            {errors.roll_number && (
              <p className="text-red-500">{errors.roll_number?.message}</p>
            )}
          </div>

          <div>
            <Select
              label="Select Gender"
              className="dark:bg-background-dark"
              onChange={(e) => handleGenderChange(e as unknown as string)}
              value={getValues('gender')} // Use getValues instead of watch
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              color="blue"
            >
              <Option value="MALE">Male</Option>
              <Option value="FEMALE">Female</Option>
            </Select>
            {errors.gender && (
              <p className="text-red-500">{errors.gender?.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary border-2 border-red-500 p-2 rounded-full text-red-500"
          >
            Continue
          </button>
        </div>
      </form>
      <div>
        <Quote />
      </div>
    </div>
  );
}
