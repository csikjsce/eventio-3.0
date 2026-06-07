"use client";

import Link from "next/link";
import { useData } from "@/contexts/DataContext";
import EventCard from "@/components/EventCard";
import { Inbox, CalendarDays, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, events, pendingEvents, loading } = useData();

  const liveCount = events.filter((e) =>
    ["REGISTRATION_OPEN", "TICKET_OPEN", "ONGOING"].includes(e.state),
  ).length;

  const completedCount = events.filter((e) => e.state === "COMPLETED").length;

  const recentLive = events
    .filter((e) => !["DRAFT", "APPLIED_FOR_APPROVAL", "APPLIED_FOR_PRINCI_APPROVAL"].includes(e.state))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-foreground font-marcellus text-xl sm:text-2xl mb-1">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">
          {user?.role === "PRINCIPAL"
            ? "Review proposals forwarded by faculty advisors."
            : "Review event proposals submitted by student councils."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Needs Action",
            value: pendingEvents.length,
            icon: <Inbox size={16} />,
            cls: pendingEvents.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
            href: "/pending",
          },
          {
            label: "Live Events",
            value: liveCount,
            icon: <TrendingUp size={16} />,
            cls: "text-emerald-600 dark:text-emerald-400",
            href: "/events",
          },
          {
            label: "Completed",
            value: completedCount,
            icon: <CheckCircle2 size={16} />,
            cls: "text-muted-foreground",
            href: "/events",
          },
          {
            label: "Total Tracked",
            value: events.length,
            icon: <CalendarDays size={16} />,
            cls: "text-red-600 dark:text-red-400",
            href: "/events",
          },
        ].map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-card border border-border rounded-xl p-4 hover:border-red-500/30 transition-all">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">{s.icon}
              <span className="text-[10px] uppercase tracking-widest">{s.label}</span>
            </div>
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Pending section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Inbox size={18} className="text-amber-500" />
            Pending Approval
            {pendingEvents.length > 0 && (
              <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                {pendingEvents.length}
              </span>
            )}
          </h2>
          {pendingEvents.length > 0 && (
            <Link href="/pending" className="text-red-600 dark:text-red-400 text-sm hover:underline">
              View all
            </Link>
          )}
        </div>

        {pendingEvents.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-medium">All caught up!</p>
            <p className="text-muted-foreground text-sm mt-1">
              No proposals waiting for your review right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEvents.slice(0, 3).map((e) => (
              <EventCard key={e.id} event={e} highlight />
            ))}
          </div>
        )}
      </section>

      {/* Recent active events */}
      {recentLive.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recently Active</h2>
            <Link href="/events" className="text-red-600 dark:text-red-400 text-sm hover:underline">
              Browse all
            </Link>
          </div>
          <div className="space-y-3">
            {recentLive.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
