import man1 from '../assets/man1.jpeg';

import { Notification, Setting } from 'iconsax-react';

export default function Header() {
  return (
    <div className="flex flex-row justify-between items-center">
      {/* header */}
      <div className="flex flex-row gap-1.5">
        {/* namaste name pfp*/}
        <img
          src={man1}
          alt="man1"
          className="w-12 h-12 aspect-square rounded-full object-cover border-2 border-blue-500"
        />
        <div className="flex flex-col text-left">
          <p className="font-marcellus text-gray-1">Namaste</p>
          <p className="font-marcellus text-xl text-foreground-light dark:text-foreground-dark">Kunal Chaturvedi</p>
        </div>
      </div>
      <div className="flex flex-row items-center gap-5">
        {/* bell and cog */}
        <Notification />
        <Setting />
      </div>
    </div>
  );
}
