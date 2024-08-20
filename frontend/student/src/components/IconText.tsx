import { Icon as IconType } from 'iconsax-react';

export default function IconText({
  Icon,
  line1,
  line2,
}: {
  Icon: IconType;
  line1: string;
  line2: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <Icon size={30} color="#B61F2D" variant="Bold" />
      <p className="font-fira text-gray-1 text-sm mt-2">{line1}</p>
      <p className="font-fira text-gray-1 text-sm">{line2}</p>
    </div>
  );
}
