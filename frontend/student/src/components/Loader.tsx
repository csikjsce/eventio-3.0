import { Spinner } from '@material-tailwind/react';

const Loader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Spinner
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        color="red"
        scale={2}
      />
    </div>
  );
};

export default Loader;
