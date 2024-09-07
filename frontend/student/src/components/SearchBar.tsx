import { Icon as IconType } from 'iconsax-react';

export default function SearchBar({
  Icon,
  className,
}: {
  Icon: IconType;
  className?: string;
}) {

  return (
    <div
      className={
        'h-14 p-4 relative flex items-center gap-4 rounded-xl outline-1 border-gray-400 focus:outline-none border-2 ' +
        className
      }
    >
      {Icon && (
        <div className="">
          <Icon
            aria-label="Search Icon"
            className="w-5 h-5 stroke-current text-foreground-light dark:text-foreground-dark"
          />
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
