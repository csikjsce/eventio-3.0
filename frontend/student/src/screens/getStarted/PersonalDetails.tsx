import { Input, Option, Select, Typography } from '@material-tailwind/react';
import Quote from '../../components/Quote';

interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

export default function PersonalDetails({ setCurrentStep }: Props) {
  const handleclick = () => {
    setCurrentStep('EducationalDetails');
  };
  return (
    <div className="flex flex-col justify-between min-h-screen p-6 ">
      <div className="font-fira">
        <Typography
          variant="h4"
          color="black"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="mb-4 font-bold font-fira"
        >
          Personal Details
        </Typography>
        <Typography
          variant="h5"
          color="black"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="mb-4 font-fira"
        >
          Fill out your personal details
        </Typography>
        <div className="mb-6 space-y-6">
          <Input
            className="min-h-10 border border-black"
            label="Mobile Number"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
          />

          <Input
            className="min-h-min border border-black"
            label="Student Id"
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            crossOrigin={undefined}
          />
          <Select
            label="Select Gender"
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            className=""
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
      <div>
        <Quote />
      </div>
    </div>
  );
}
