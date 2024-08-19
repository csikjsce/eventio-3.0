import React, { useState } from 'react';
import { Option, Select, Typography } from '@material-tailwind/react';
import Quote from '../../components/Quote';
import { departmentOptions } from '../../constants/values';
import { useFormContext } from 'react-hook-form';
import { PersonalDetailsSchema } from './validation'; // Import the correct schema type

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function EducationalDetails({ setCurrentStep }: Props) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useFormContext<PersonalDetailsSchema>(); // Access form methods via useFormContext

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>(
    [],
  );
  console.log(getValues());
  const handleYearChange = (year: string) => {
    const yearAsNumber = Number(year);
    setSelectedYear(yearAsNumber);
    setAvailableDepartments(departmentOptions[yearAsNumber] || []);
    setValue('graduationYear', yearAsNumber);
  };

  const handleDepartmentChange = (department: string) => {
    setValue('department', department);
  };

  const handleClickBack = () => {
    setCurrentStep('PersonalDetails');
  };

  const onSubmit = () => {
    setCurrentStep('Interest');
  };

  return (
    <div className="flex flex-col justify-between min-h-screen p-6">
      <div className="font-fira">
        <Typography
          variant="h4"
          color="black"
          className="mb-4 font-bold"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Educational Details
        </Typography>
        <Typography
          variant="h5"
          color="black"
          className="mb-4 "
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Fill out your Educational details
        </Typography>
        <div className="mb-6 flex flex-col gap-4">
          <Select
            label="Select Graduation Year"
            onChange={(value) => handleYearChange(value as string)} // Handle value as string first, then convert to number
            value={watch('graduationYear')?.toString() || ''}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
            <Option value="2028">2028</Option>
          </Select>
          {errors.graduationYear && (
            <p className="text-red-500">{errors.graduationYear?.message}</p>
          )}

          <Select
            label="Select Department"
            disabled={!selectedYear} // Disable if no year is selected
            onChange={(value) => handleDepartmentChange(value as string)}
            value={watch('department')}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {availableDepartments.map((department, index) => (
              <Option key={index} value={department}>
                {department}
              </Option>
            ))}
          </Select>
          {errors.department && (
            <p className="text-red-500">{errors.department?.message}</p>
          )}
        </div>
        <div className="flex justify-between">
          <Typography
            className="cursor-pointer ml-2"
            variant="paragraph"
            color="gray"
            onClick={handleClickBack}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            placeholder={undefined}
          >
            Back
          </Typography>
          <button
            className="btn btn-primary border-2 border-red-500 p-2 rounded-full text-red-500"
            onClick={handleSubmit(onSubmit)}
          >
            Continue
          </button>
        </div>
      </div>
      <div>
        <Quote />
      </div>
    </div>
  );
}
