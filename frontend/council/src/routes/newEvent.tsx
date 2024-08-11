import { Input as MTInput } from '@material-tailwind/react';

const Input = ({
  label,
  width,
  type = 'text',
}: {
  label: string;
  width?: string;
  type?: string;
}) => {
  return (
    <div className={`${width || 'max-w-96'}`}>
      <MTInput
        type={type}
        color="blue"
        label={label}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        crossOrigin={undefined}
      />
    </div>
  );
};

export default function AddEvent() {
  return (
    <div className="flex flex-col p-4 gap-4">
      <div>
        <h1 className="text-4xl font-bold font-fira text-red-600">New Event</h1>
        <p className="text-gray-600 font-fira">Create a new event</p>
      </div>
      <form className="grid grid-cols-2">
        <Input label="Event Name" />
        <Input label="Event Name" />
      </form>
    </div>
  );
}
