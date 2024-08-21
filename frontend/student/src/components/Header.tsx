import { Link } from "react-router-dom";

export default function Header({
  name,
  photo_url,
}: {
  name: string;
  photo_url: string;
}) {
  return (
    <div className="flex flex-row justify-between items-center">
      {/* header */}
      <div className="flex flex-row gap-3 items-center">
        {/* namaste name pfp*/}
        <Link to="/profile">
        <img
          src={photo_url}
          alt={'profile'}
          referrerPolicy="no-referrer"
          className="w-12 h-12 aspect-square rounded-full object-cover"
        />
        </Link>
        <div className="flex flex-col text-left">
          <p className="font-marcellus text-gray-1">Namaste</p>
          <p className="font-marcellus text-xl text-foreground-light dark:text-foreground-dark">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
