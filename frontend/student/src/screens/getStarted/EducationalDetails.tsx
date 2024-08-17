import { Option, Select, Typography } from '@material-tailwind/react';
interface Props {
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}
export default function Education({ setCurrentStep }: Props) {
  const handleclickback = () => {
    setCurrentStep('PersonalDetails');
  };
  const handleclickforward = () => {
    setCurrentStep('Interest');
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
        Educational Details
      </Typography>
      <Typography
        variant="h5"
        color="black"
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        className="mb-4 "
      >
        Fill out your Educational details
      </Typography>
      <div className="mb-6 flex flex-col gap-4">
        <Select
          label="Select Department"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Option value="Comps">Comps</Option>
          <Option value="IT">IT</Option>
        </Select>
        <Select
          label="Select Graduation Year"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Option value="2025">2025</Option>
          <Option value="2026">2026</Option>
          <Option value="2027">2027</Option>
          <Option value="2028">2028</Option>
        </Select>
      </div>
      <div className="flex justify-between">
        <Typography
          className="cursor-pointer ml-2"
          variant="paragraph"
          color="red"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onClick={handleclickback}
        >
          back
        </Typography>
        <button
          className="btn btn-primary border-2 border-red-500 p-2 rounded-full text-red-500"
          onClick={handleclickforward}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
