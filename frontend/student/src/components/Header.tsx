import { Link } from 'react-router-dom';
// import { Clock } from 'iconsax-react';
// import HistoryIcon from '../assets/HistoryIcon.svg';

export default function Header({
  name,
  photo_url,
}: {
  name?: string;
  photo_url?: string;
}) {
  return (
    <div className="flex gap-3 items-center">
      <Link to="/profile">
        <img
          src={photo_url}
          alt={'profile'}
          referrerPolicy="no-referrer"
          className="w-12 h-12 aspect-square rounded-full object-cover"
        />
      </Link>
      <div className="flex flex-col text-left">
        <p className="font-marcellus text-mute">Namaste</p>
        <p className="font-marcellus text-xl text-foreground ">{name}</p>
      </div>
      <Link to="/profile/myevents" className="ml-auto">
        {/* <Clock size="28" className="text-mute" /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="fill-none stroke-mute"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5m4-1v5l4 2" />
        </svg>
      </Link>
    </div>
  );
}
