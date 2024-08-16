import { Option, Select, Textarea, Typography } from '@material-tailwind/react';

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function PersonalDetails({ setCurrentStep }: Props) {
  const handleclick = () => {
    setCurrentStep('EducationalDetails');
  };
  return (
    <div className="p-6">
      <Typography
        variant="h4"
        color="black"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        className="mb-4 font-bold"
      >
        Personal Details
      </Typography>
      <Typography
        variant="h5"
        color="black"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        className="mb-4 "
      >
        Fill out your personal details
      </Typography>
      <div className="mb-6">
        <Textarea
          className="min-h-10"
          label="Mobile Number"
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />

        <Textarea
          resize={true}
          className="min-h-min"
          label="Student Id"
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
        <Select
          label="Select Gender"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </Select>
      </div>
      <div className="flex justify-end">
        <button
          className="btn btn-primary border-2 border-red-500 p-2 rounded-full text-red-500"
          onClick={handleclick}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
