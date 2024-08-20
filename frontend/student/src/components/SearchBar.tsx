import { Input } from '@material-tailwind/react';
import { Icon as IconType, Setting4 } from 'iconsax-react';

export default function SearchBar({
  Icon,
  text,
}: {
  Icon: IconType;
  text: string;
}) {
  return (
    <div className="relative flex items-center gap-2 rounded-xl  outline-1 outline-gray-300 focus:outline-none">
      <Input
        variant="outlined"
        label={text}
        placeholder={text}
        className="border-0 focus:outline-none  pr-12 placeholder-padding label-padding-50"
        containerProps={{ className: 'w-full' }}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        crossOrigin={undefined}
      />
      {Icon && (
        <div className="absolute right-11 top-1/2 transform -translate-y-1/2">
          <Icon aria-label="Search Icon" className="w-5 h-5" />
        </div>
      )}
      <Setting4
        aria-label="Settings Icon"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
      />
    </div>
  );
}
