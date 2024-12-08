import { Call, Send2 } from 'iconsax-react';

export default function CouncilCard({ council }: { council: User }) {
  return (
    <div className="bg-card rounded-lg p-3">
      <div className="flex gap-3 items-center">
        <img
          src={council.photo_url}
          alt="council image"
          className="h-12 w-12 my-auto aspect-square object-cover rounded-full outline outline-1 outline-primary"
        />
        <p className="font-fira font-medium text-lg text-foreground tracking-wide">
          {council.name}
        </p>
      </div>
      <div className="mt-2 flex gap-1.5 items-center">
        <Call color="currentColor" size="20" className="text-vitality" />
        <a
          href={`tel:+91${council.phone_number}`}
          className="font-fira text-md text-mute dark:text-gray-300"
        >
          +91 {council.phone_number}
        </a>
      </div>
      <div className="flex flex-row gap-1.5 items-center mt-1">
        <Send2 color="currentColor" size="20" className="text-vitality" />
        <a
          href={`mailto:${council.email}`}
          className="font-fira text-md text-wrap text-mute dark:text-gray-300"
        >
          {council.email}
        </a>
      </div>
    </div>
  );
}
