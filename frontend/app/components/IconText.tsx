import { Icon as IconType } from "iconsax-react";

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
    <div className="flex flex-col items-center gap-1">
      <Icon size={24} color="#b61f2d" variant="Bold" />
      <p className="font-poppins text-foreground text-xs font-semibold text-center">{line1}</p>
      <p className="font-poppins text-mute text-xs text-center">{line2}</p>
    </div>
  );
}
