import type { Council } from "@/lib/dummy-data";
import { ArrowRight2 } from "iconsax-react";
import Link from "next/link";

export default function CouncilCard({ council }: { council: Council }) {
  return (
    <Link
      href={`/council-details/${council.id}`}
      className="bg-card rounded-2xl p-4 border border-border flex gap-4 items-center active:scale-[0.98] transition-transform"
    >
      <img
        src={council.photo_url}
        alt={council.name}
        className="h-14 w-14 aspect-square object-cover rounded-full ring-2 ring-primary/40 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-poppins font-semibold text-base text-foreground truncate">
          {council.name}
        </p>
        <p className="font-poppins text-xs text-mute mt-0.5 line-clamp-1">
          {council.tagline}
        </p>
      </div>
      <ArrowRight2 size={18} color="#8a8a8a" className="flex-shrink-0" />
    </Link>
  );
}
