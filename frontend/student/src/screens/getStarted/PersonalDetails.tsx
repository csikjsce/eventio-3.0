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
    watch,
  } = useFormContext<PersonalDetailsSchema>(); // Use the correct schema type

  console.log(errors);

  const onSubmit = () => {
    setCurrentStep('EducationalDetails');
  };

  const handleGenderChange = (value: string) => {
    setValue('gender', value as 'male' | 'female');
  };

  return (
    <div className="flex flex-col justify-between min-h-screen p-6 ">
      <form onSubmit={handleSubmit(onSubmit)} className="font-fira">
        <Typography
          variant="h4"
          color="black"
          className="mb-4 font-bold font-fira"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Personal Details
        </Typography>
        <Typography
          variant="h5"
          color="black"
          className="mb-4 font-fira"
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
              {...register('mobileNumber')}
              className="min-h-10 border border-black"
              label="Mobile Number"
            />
            {errors.mobileNumber && (
              <p className="text-red-500">{errors.mobileNumber?.message}</p>
            )}
          </div>

          <div>
            <Input
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              crossOrigin={undefined}
              {...register('studentId')}
              className="min-h-min border border-black"
              label="Student Id"
            />
            {errors.studentId && (
              <p className="text-red-500">{errors.studentId?.message}</p>
            )}
          </div>

          <div>
            <Select
              label="Select Gender"
              className=""
              onChange={(e) => handleGenderChange(e as unknown as string)}
              value={watch('gender')}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
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
