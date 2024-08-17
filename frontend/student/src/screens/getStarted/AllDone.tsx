import { ArrowRight } from 'iconsax-react';

export default function AllDone() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <h1 className="text-red-500 font-marcellus text-4xl">
          You are all done
        </h1>
        <p className="mt-4 text-lg font-fira text-gray-700">
          Start your new journey and experience now
        </p>
      </div>
      <button
        className=" w-56 px-4 py-2 mt-8 rounded-full border-2 border-red-200 font-poppins"
        onClick={() => {
          window.location.href = '/home';
        }}
      >
        Start Exploring &#8594;
      </button>
    </div>
  );
}
