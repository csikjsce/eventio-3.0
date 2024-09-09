import { useNavigate } from 'react-router-dom';

export default function AllDone() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <h1 className="text-vitality font-marcellus text-4xl">
          You are all done
        </h1>
        <p className="mt-4 text-lg font-fira text-foreground ">
          Start your new journey and experience now
        </p>
      </div>
      <button
        className=" w-56 px-4 py-2 mt-8 rounded-full border-2 border-primary font-poppins text-foreground "
        onClick={() => {
          navigate('/');
        }}
      >
        Start Exploring &#8594;
      </button>
    </div>
  );
}
