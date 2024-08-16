import { Icon as IconType, Setting4 } from 'iconsax-react';

export default function SearchBar({
  Icon,
  text,
}: {
  Icon: IconType;
  text: string;
}) {
  return (
    <div className="flex flex-row gap-4 px-4 py-1 rounded-xl items-center outline outline-1 outline-gray-1 focus-within:outline-blue-500">
      <Icon />
      <input placeholder={text} color="blue" 
        className='w-full h-11 outline-none'
      />
      <Setting4 />
    </div>
  );
}
