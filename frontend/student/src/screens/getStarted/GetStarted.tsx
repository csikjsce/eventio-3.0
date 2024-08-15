import { useState } from 'react';
import Quote from '../../components/Quote';

interface GetStartedProps {
  continueWithGoogle: () => void;
}

function GetStarted({ continueWithGoogle }: GetStartedProps) {
  const [buttonClicked, setButtonClicked] = useState<'yes' | 'no' | null>(null);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);

  const handleYesClick = () => {
    setButtonClicked('yes');
    setShowGoogleSignIn(true);
  };

  const handleNoClick = () => {
    setButtonClicked('no');
    setShowGoogleSignIn(false);
  };

  return (
    <div className="flex flex-col min-h-screen font-fira box-border">
      <div className="flex-grow flex flex-col space-y-6 ">
        <div className="text-xl font-bold text-left">Get Started</div>
        <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-left">
          Are you from <br /> Somaiya Vidyavihar University
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-row sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handleYesClick}
              className={`w-full sm:w-48 md:w-56 lg:w-64 px-4 py-2 ${buttonClicked === 'yes' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-black'} font-semibold rounded-lg  border border-black `}
              style={{ borderRadius: '30em' }}
            >
              Yes
            </button>
            <button
              onClick={handleNoClick}
              className={`w-full sm:w-48 md:w-56 lg:w-64 px-4 py-2 ${buttonClicked === 'no' ? 'bg-red-500 text-white' : 'bg-white text-black'} font-semibold rounded-lg  border border-black`}
              style={{ borderRadius: '30em' }}
            >
              No
            </button>
          </div>
          {showGoogleSignIn && (
            <button
              onClick={continueWithGoogle}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg shadow-md border border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75 transition mt-4"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
      <footer>
        <Quote />
      </footer>
    </div>
  );
}

export default GetStarted;
