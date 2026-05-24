"use client";

import { useEffect, useState } from "react";
import CouncilCard from "@/components/CouncilCard";
import { type Council } from "@/lib/dummy-data";
import { fetchCouncils } from "@/lib/api";
import { CouncilsScreenSkeleton } from "@/components/Skeletons";

export default function CouncilsScreen() {
  const [councils, setCouncils] = useState<Council[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchCouncils();
        if (data?.length) {
          const mapped: Council[] = data.map((c: Council & { CouncilProfile?: Record<string, unknown> }) => ({
            ...c,
            about: (c.CouncilProfile?.about as string) ?? "",
            banner_url: (c.CouncilProfile?.banner_url as string) ?? "",
            tagline: (c.CouncilProfile?.tagline as string) ?? "",
            instagram: (c.CouncilProfile?.instagram as string) ?? undefined,
            website: (c.CouncilProfile?.website as string) ?? undefined,
          }));
          setCouncils(mapped);
        }
      } catch { /* handled by interceptor */ }
    }
    load();
  }, []);

  if (councils === null) return <CouncilsScreenSkeleton />;

  return (
    <div className="pb-36">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Councils</h1>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {councils.map((council) => (
          <CouncilCard key={council.id} council={council} />
        ))}
      </div>
    </div>
  );
}
