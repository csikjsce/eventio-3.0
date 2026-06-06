"use client";

import { useData } from "@/contexts/DataContext";
import EventCard from "@/components/EventCard";
import { Inbox } from "lucide-react";

export default function PendingPage() {
  const { pendingEvents, user, loading } = useData();

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Pending Approval</h1>
        <p className="text-muted-foreground text-sm">
          {user?.role === "PRINCIPAL"
            ? "Events forwarded by faculty awaiting your final approval."
            : "Event proposals submitted by councils awaiting faculty review."}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
        </div>
      ) : pendingEvents.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Inbox size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No pending proposals</p>
          <p className="text-muted-foreground text-sm mt-1">Check back when councils submit new events.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingEvents.map((e) => (
            <EventCard key={e.id} event={e} highlight />
          ))}
        </div>
      )}
    </div>
  );
}
