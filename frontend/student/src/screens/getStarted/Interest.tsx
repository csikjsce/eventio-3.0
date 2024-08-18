import { Chip, Typography } from '@material-tailwind/react';
import React from 'react';
import Quote from '../../components/Quote';
import { useFormContext } from 'react-hook-form';
import { PersonalDetailsSchema } from './validation'; // Ensure this is correctly imported

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

export default function Interest({ setCurrentStep, onSubmit }: Props) {
  const { setValue, watch } = useFormContext<PersonalDetailsSchema>(); // Access form methods via useFormContext

  const selectedChips = watch('interests') || []; // Watch the interests value from the form state

  const handleChipClick = (label: string) => {
    const updatedChips = selectedChips.includes(label)
      ? selectedChips.filter((chip) => chip !== label)
      : [...selectedChips, label];
    setValue('interests', updatedChips); // Update the interests in form state
  };

  const handleClickBack = () => {
    setCurrentStep('EducationalDetails');
  };

  const handleClickForward = () => {
    onSubmit(); // Trigger the final form submission
  };

  const chips = [
    'Web Development',
    'Cybersecurity',
    'AI/ML',
    'Competitive Programming',
    'Data Science',
    'Data Analytics',
    'WEB3',
    'Networking',
  ];

  return (
    <div className="flex flex-col justify-between min-h-screen p-6">
      <div>
        <Typography
          variant="h4"
          color="black"
          className="mb-4 font-bold"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Career Interest
        </Typography>
        <Typography
          variant="h5"
          color="black"
          className="mb-4 "
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          Choose your point of interests
        </Typography>
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`${
                selectedChips.includes(chip)
                  ? 'bg-red-600 shadow-lg'
                  : 'bg-gray-200'
              } p-3 rounded-full cursor-pointer`}
            >
              <Chip
                value={chip}
                className={`bg-transparent ${
                  selectedChips.includes(chip) ? 'text-white' : 'text-gray-800'
                }`}
              />
            </button>
          ))}
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
            onClick={handleClickForward}
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
