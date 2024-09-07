import { Call } from 'iconsax-react';

const tagHighlights: { [key: string]: string } = {
  Tech: 'bg-blue-500/10 border border-1 border-blue-700 text-blue-700',
  Registered: 'bg-green-500 border border-1 border-green-500 text-white',
};

export default function CouncilCard({
  council,
}: {
  council: {
    name: string;
    phoneNumber: string;
    image: string;
    tag: string;
  };
}) {
  return (
    <div className="flex flex-row gap-2 justify-around bg-card  rounded-lg p-2">
      {/* TODO: imporve sizing and styling */}
      <img
        src={council.image}
        alt="council image"
        className="h-28 w-28 my-auto aspect-square object-cover rounded-lg"
      />
      <div className="flex flex-col flex-1 max-w-96 gap-1 justify-around">
        <div className="flex flex-row gap-2 items-center">
          <div className="flex flex-col flex-1 text-left">
            <p className="font-fira font-medium text-md sm:text-lg text-foreground ">
              {council.name}
            </p>
            <p className="font-fira text-xs text-vitality">{council.name}</p>
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-start">
          <div className="flex flex-row gap-1">
            <Call color="#57585A" size="16" /> {/* TODO: use Tailwind theme */}
            <p className="font-fira text-xs text-mute dark:text-gray-300">
              +91 {council.phoneNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <span
            className={`font-fira font-semibold text-xs px-2 py-1 rounded-lg ${tagHighlights[council.tag]}`}
          >
            {council.tag}
          </span>
        </div>
      </div>
    </div>
  );
}
