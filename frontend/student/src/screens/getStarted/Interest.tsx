import { Chip, Typography } from '@material-tailwind/react';
import React from 'react';
import Quote from '../../components/Quote';

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function Interest({ setCurrentStep }: Props) {
  const [selectedChips, setSelectedChips] = React.useState<string[]>([]);

  const handleChipClick = (label: string) => {
    setSelectedChips((prevSelectedChips) =>
      prevSelectedChips.includes(label)
        ? prevSelectedChips.filter((chip) => chip !== label)
        : [...prevSelectedChips, label],
    );
  };

  const handleclickback = () => {
    setCurrentStep('EducationalDetails');
  };
  const handleclickforward = () => {
    setCurrentStep('AllDone');
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
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="mb-4 font-bold"
        >
          Career Interest
        </Typography>
        <Typography
          variant="h5"
          color="black"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="mb-4 "
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
                  : 'bg-gray-200 '
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
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            onClick={handleclickback}
          >
            Back
          </Typography>
          <button
            className="btn btn-primary border-2 border-red-500 p-2 rounded-full text-red-500"
            onClick={handleclickforward}
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
