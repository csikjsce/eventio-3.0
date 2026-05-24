"use client";

import { useEffect, useState } from "react";
import CouncilCard from "@/components/CouncilCard";
import { councilList, type Council } from "@/lib/dummy-data";
import { fetchCouncils } from "@/lib/api";

export default function CouncilsScreen() {
  const [councils, setCouncils] = useState<Council[]>(councilList);

  useEffect(() => {
    async function load() {
      try {
        const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
        if (!server || !localStorage.getItem("accessToken")) return;
        const data = await fetchCouncils();
        if (data?.length) {
          // Flatten CouncilProfile fields onto the user object
          const mapped: Council[] = data.map((c: Council & { CouncilProfile?: Record<string, unknown> }) => ({
            ...c,
            about: (c.CouncilProfile?.about as string) ?? c.about ?? "",
            banner_url: (c.CouncilProfile?.banner_url as string) ?? c.banner_url ?? "",
            tagline: (c.CouncilProfile?.tagline as string) ?? c.tagline ?? "",
            instagram: (c.CouncilProfile?.instagram as string) ?? c.instagram,
            website: (c.CouncilProfile?.website as string) ?? c.website,
          }));
          setCouncils(mapped);
        }
      } catch {
        // Keep dummy data on failure
      }
    }
    load();
  }, []);

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
