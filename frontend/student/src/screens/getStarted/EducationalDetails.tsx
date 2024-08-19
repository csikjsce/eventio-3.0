import React, { useState } from 'react';
import { Option, Select, Typography } from '@material-tailwind/react';
import Quote from '../../components/Quote';
import { branchOptions } from '../../constants/values';
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
    getValues,
  } = useFormContext<PersonalDetailsSchema>();

  const [selectedYear, setSelectedYear] = useState<number | null>(
    getValues('year') || null,
  );
  const [availableBranchs, setAvailableBranchs] = useState<string[]>(
    branchOptions[selectedYear!] || [],
  );

  const handleYearChange = (year: string) => {
    const yearAsNumber = Number(year);
    setSelectedYear(yearAsNumber);
    setAvailableBranchs(branchOptions[yearAsNumber] || []);
    setValue('year', yearAsNumber);
  };

  const handleBranchChange = (branch: string) => {
    setValue('branch', branch);
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
          className="mb-4"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Fill out your Educational details
        </Typography>
        <div className="mb-6 flex flex-col gap-4">
          <Select
            label="Select Graduation Year"
            onChange={(value) => handleYearChange(value as string)}
            value={getValues('year')?.toString() || ''}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <Option value="2025">2025</Option>
            <Option value="2026">2026</Option>
            <Option value="2027">2027</Option>
            <Option value="2028">2028</Option>
          </Select>
          {errors.year && (
            <p className="text-red-500">{errors.year?.message}</p>
          )}

          <Select
            label="Select Branch"
            disabled={!selectedYear}
            onChange={(value) => handleBranchChange(value!)}
            value={getValues('branch')}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            {availableBranchs.map((branch, index) => (
              <Option key={index} value={branch.replace(" ", "_")}>
                {branch}
              </Option>
            ))}
          </Select>
          {errors.branch && (
            <p className="text-red-500">{errors.branch?.message}</p>
          )}
        </div>
        <div className="flex justify-between">
          <Typography
            className="cursor-pointer ml-2"
            variant="paragraph"
            color="gray"
            onClick={handleClickBack}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
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
