import { Icon as IconType } from 'iconsax-react';
import { useState } from 'react';

export default function SearchBar({
  Icon,
  className,
}: {
  Icon: IconType;
  className?: string;
}) {

  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    setDarkMode(event.matches);
  });

  return (
    <div
      className={
        'h-14 p-4 relative flex items-center gap-4 rounded-xl outline-1 border-gray-400 focus:outline-none border-2 ' +
        className
      }
    >
      {Icon && (
        <div className="">
          <Icon aria-label="Search Icon" className="w-5 h-5" color={darkMode ? '#FFFFFF' : '#231F20'}/>
        </div>
      )}
      <input
        placeholder={'What event are you looking for...'}
        className="border-0 outline-none w-full h-10 dark:bg-background-dark"
        type="text"
      />
    </div>
  );
}
