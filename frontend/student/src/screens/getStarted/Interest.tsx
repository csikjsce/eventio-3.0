import React from 'react';
import Quote from '../../components/Quote';
import { useFormContext } from 'react-hook-form';
import { PersonalDetailsSchema } from './validation'; // Ensure this is correctly imported
import Spinner from '../../components/Spinner'; // Import the Spinner component

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

export default function Interest({ setCurrentStep, onSubmit }: Props) {
  const { setValue, watch, getValues } =
    useFormContext<PersonalDetailsSchema>();

  const selectedChips = watch('interests') || []; // Watch the interests value for real-time updates
  const allChips = getValues('interests') || []; // Get the current value of interests

  const handleChipClick = (label: string) => {
    const updatedChips = selectedChips.includes(label)
      ? selectedChips.filter((chip) => chip !== label)
      : [...selectedChips, label];
    setValue('interests', updatedChips);
  };

  const [continueLoading, setContinueLoading] = React.useState(false);

  const handleClickBack = () => {
    setCurrentStep('EducationalDetails');
  };

  const handleClickForward = () => {
    setContinueLoading(true);
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
        <p className="mb-4 text-2xl font-bold text-foreground ">
          Career Interest
        </p>
        <p className="mb-4 text-xl text-foreground ">
          Choose your point of interests
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`${
                allChips.includes(chip)
                  ? 'bg-vitality shadow-lg'
                  : 'bg-gray-200'
              } p-3 rounded-full cursor-pointer`}
            >
              <p
                className={`bg-transparent ${
                  allChips.includes(chip) ? 'text-white' : 'text-gray-800'
                }`}
              >
                {chip}
              </p>
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <p
            className="cursor-pointer ml-2 bg-mute rounded-full px-4 py-3 text-center text-white"
            onClick={handleClickBack}
          >
            Back
          </p>
          <button
            className="btn btn-primary border-2 p-2 rounded-full ${continueLoading text-vitality border-vitality"
            onClick={handleClickForward}
            disabled={continueLoading}
          >
            {continueLoading ? <Spinner /> : 'Continue'}
          </button>
        </div>
      </div>
      <div>
        <Quote />
      </div>
    </div>
  );
}
