import React, { useState } from 'react';
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
        <p className="mb-4 text-2xl font-bold text-foreground ">
          Educational Details
        </p>
        <p className="mb-4 text-xl text-foreground ">
          Fill out your Educational details
        </p>
        <div className="mb-6 flex flex-col gap-4">
          <select
            onChange={(e) => handleYearChange(e.target.value)}
            className="min-h-10 w-full max-w-80 rounded-xl px-4 bg-card outline outline-1 text-foreground"
          >
            <option disabled selected>
              Select Graduation Year
            </option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          {errors.year && (
            <p className="text-red-500">{errors.year?.message}</p>
          )}

          <select
            disabled={!selectedYear}
            onChange={(e) => handleBranchChange(e.target.value!)}
            className="min-h-10 w-full max-w-80 rounded-xl px-4 bg-card outline outline-1 text-foreground"
          >
            <option disabled selected>
              Select Branch
            </option>
            {availableBranchs.map((branch, index) => (
              <option key={index} value={branch.replace(/ /g, '_')}>
                {branch}
              </option>
            ))}
          </select>
          {errors.branch && (
            <p className="text-red-500">{errors.branch?.message}</p>
          )}
        </div>
        <div className="flex justify-between">
          <p
            className="cursor-pointer ml-2 bg-mute rounded-full px-4 py-3 text-center text-white"
            onClick={handleClickBack}
          >
            Back
          </p>
          <button
            className="btn btn-primary border-2 border-vitality p-2 rounded-full text-vitality"
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
