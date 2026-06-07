/**
 * All skeleton loading states for the student app.
 * Uses Tailwind's animate-pulse with theme-aware surface colour.
 */

// ── Base shimmer block ────────────────────────────────────────────────────────

function Sh({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-surface animate-pulse ${rounded} ${className}`}
    />
  );
}

// ── Card-level skeletons ──────────────────────────────────────────────────────

/** Matches <EventCard /> */
export function EventCardSkeleton() {
  return (
    <div className="flex gap-3 items-center bg-card rounded-2xl p-3">
      <Sh className="w-16 h-16 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Sh className="h-3.5 w-3/4" rounded="rounded-full" />
        <Sh className="h-3 w-1/2" rounded="rounded-full" />
        <Sh className="h-3 w-2/3" rounded="rounded-full" />
      </div>
    </div>
  );
}

/** Matches <TrendingCard /> */
export function TrendingCardSkeleton() {
  return (
    <div className="min-w-[72vw] max-w-xs flex-shrink-0 bg-card rounded-3xl overflow-hidden">
      <Sh className="w-full h-44" rounded="rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Sh className="h-3.5 w-3/4" rounded="rounded-full" />
        <Sh className="h-3 w-1/2" rounded="rounded-full" />
        <Sh className="h-8 w-full rounded-full" rounded="rounded-full" />
      </div>
    </div>
  );
}

/** Matches <CouncilCard /> */
export function CouncilCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border flex gap-4 items-center">
      <Sh className="h-14 w-14 rounded-full flex-shrink-0" rounded="rounded-full" />
      <div className="flex-1 flex flex-col gap-2">
        <Sh className="h-3.5 w-1/2" rounded="rounded-full" />
        <Sh className="h-3 w-3/4" rounded="rounded-full" />
      </div>
    </div>
  );
}

// ── Screen-level skeletons ────────────────────────────────────────────────────

/** Home / discover page */
export function HomeScreenSkeleton() {
  return (
    <div className="flex flex-col gap-7 pb-36">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Sh className="h-9 w-32 rounded-full" />
        <Sh className="h-11 w-11 rounded-full" rounded="rounded-full" />
      </div>

      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <Sh className="h-3 w-40" rounded="rounded-full" />
        <Sh className="h-7 w-56" rounded="rounded-full" />
      </div>

      {/* Search */}
      <Sh className="h-12 w-full rounded-2xl" />

      {/* Section: Your Tickets */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Sh className="h-4 w-28" rounded="rounded-full" />
          <Sh className="h-4 w-14" rounded="rounded-full" />
        </div>
        <EventCardSkeleton />
        <EventCardSkeleton />
      </section>

      {/* Section: Trending (horizontal scroll) */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Sh className="h-4 w-32" rounded="rounded-full" />
          <Sh className="h-4 w-14" rounded="rounded-full" />
        </div>
        <div className="flex gap-4 overflow-hidden -mx-4 px-4">
          <TrendingCardSkeleton />
          <TrendingCardSkeleton />
        </div>
      </section>

      {/* Section: Upcoming */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between">
          <Sh className="h-4 w-36" rounded="rounded-full" />
          <Sh className="h-4 w-14" rounded="rounded-full" />
        </div>
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </section>
    </div>
  );
}

/** Event detail page */
export function EventDetailsSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <Sh className="w-full aspect-square" rounded="rounded-none" />

      <div className="px-5 pt-6 pb-32 flex flex-col gap-6">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <Sh className="h-6 w-3/4" rounded="rounded-full" />
          <Sh className="h-4 w-1/2" rounded="rounded-full" />
        </div>

        {/* Info row */}
        <div className="bg-card rounded-2xl p-4 flex justify-between border border-border gap-4">
          <Sh className="flex-1 h-12 rounded-xl" />
          <Sh className="flex-1 h-12 rounded-xl" />
          <Sh className="flex-1 h-12 rounded-xl" />
        </div>

        {/* About */}
        <div className="flex flex-col gap-2">
          <Sh className="h-4 w-32" rounded="rounded-full" />
          <Sh className="h-3 w-full" rounded="rounded-full" />
          <Sh className="h-3 w-5/6" rounded="rounded-full" />
          <Sh className="h-3 w-4/6" rounded="rounded-full" />
        </div>

        {/* Fee card */}
        <div className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
          <Sh className="h-4 w-20" rounded="rounded-full" />
          <Sh className="h-4 w-12" rounded="rounded-full" />
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <Sh className="w-full h-14 rounded-full" rounded="rounded-full" />
      </div>
    </div>
  );
}

/** Council list page */
export function CouncilsScreenSkeleton() {
  return (
    <div className="pb-36 flex flex-col gap-3">
      <Sh className="h-7 w-28 mb-3" rounded="rounded-full" />
      {[...Array(5)].map((_, i) => <CouncilCardSkeleton key={i} />)}
    </div>
  );
}

/** Council detail page */
export function CouncilDetailsSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* Banner */}
      <Sh className="w-full h-56" rounded="rounded-none" />

      <div className="relative -mt-14 px-5 flex items-end gap-4 mb-4">
        <Sh className="w-24 h-24 rounded-2xl flex-shrink-0" />
        <div className="pb-1 flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Sh key={i} className="w-9 h-9 rounded-full" rounded="rounded-full" />
          ))}
        </div>
      </div>

      <div className="px-5 pb-36 flex flex-col gap-5">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <Sh className="h-6 w-2/3" rounded="rounded-full" />
          <Sh className="h-4 w-1/2" rounded="rounded-full" />
        </div>

        {/* About */}
        <div className="bg-card rounded-2xl p-4 border border-border flex flex-col gap-2">
          <Sh className="h-3 w-12" rounded="rounded-full" />
          <Sh className="h-3 w-full" rounded="rounded-full" />
          <Sh className="h-3 w-5/6" rounded="rounded-full" />
          <Sh className="h-3 w-4/6" rounded="rounded-full" />
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <Sh className="flex-1 h-24 rounded-2xl" />
          <Sh className="flex-1 h-24 rounded-2xl" />
        </div>

        {/* Tab bar */}
        <Sh className="h-12 w-full rounded-2xl" />

        {/* Events */}
        <EventCardSkeleton />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </div>
    </div>
  );
}

/** My events page */
export function MyEventsScreenSkeleton() {
  return (
    <div className="pb-36 flex flex-col gap-3 mt-4">
      <Sh className="h-7 w-32 mb-1" rounded="rounded-full" />
      {[...Array(4)].map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  );
}

/** Team register / team details page */
export function TeamPageSkeleton({ variant = "register" }: { variant?: "register" | "details" }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Sh className="w-9 h-9 rounded-full shrink-0" />
        <Sh className="h-5 w-28" rounded="rounded-full" />
      </div>
      <div className="px-5 pt-5 flex flex-col gap-5">
        <Sh className="h-[4.5rem] w-full rounded-2xl" />
        {variant === "details" ? (
          <>
            <Sh className="h-28 w-full rounded-2xl" />
            <Sh className="h-24 w-full rounded-2xl" />
            <Sh className="h-16 w-full rounded-xl" />
            <Sh className="h-16 w-full rounded-xl" />
          </>
        ) : (
          <>
            <Sh className="h-16 w-full rounded-2xl" />
            <Sh className="h-16 w-full rounded-2xl" />
          </>
        )}
      </div>
    </div>
  );
}
