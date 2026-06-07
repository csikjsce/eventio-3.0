"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import type { FacultyAdvisorRow } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  advisors: FacultyAdvisorRow[];
  selected: string[];
  onChange: (emails: string[]) => void;
  compact?: boolean;
}

function norm(email: string) {
  return email.trim().toLowerCase();
}

export default function FacultyReviewerSelect({
  advisors,
  selected,
  onChange,
  compact,
}: Props) {
  if (advisors.length === 0) {
    return (
      <p className="text-xs font-fira text-amber-700 dark:text-amber-400 leading-relaxed">
        Add faculty advisors in{" "}
        <Link href="/settings" className="underline hover:text-red-500">
          Council Settings
        </Link>{" "}
        before submitting a proposal.
      </p>
    );
  }

  function toggle(email: string) {
    const key = norm(email);
    if (selected.some((s) => norm(s) === key)) {
      onChange(selected.filter((s) => norm(s) !== key));
    } else {
      onChange([...selected, email.trim()]);
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-xs font-fira font-semibold text-tx flex items-center gap-1.5">
        <Users size={13} className="text-red-500 shrink-0" />
        Faculty reviewers
      </p>
      <p className="text-[11px] font-fira text-muted-tx leading-relaxed">
        Only selected faculty will receive this proposal for approval.
      </p>
      <div className="space-y-2">
        {advisors.map((a) => {
          const checked = selected.some((s) => norm(s) === norm(a.email));
          return (
            <label
              key={a.id ?? a.email}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                checked
                  ? "border-red-500/40 bg-red-500/5"
                  : "border-border-c hover:border-red-500/20",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(a.email)}
                className="mt-0.5 rounded border-border-c"
              />
              <div className="min-w-0">
                <p className="text-sm font-fira font-semibold text-tx">{a.name}</p>
                <p className="text-xs font-fira text-muted-tx">
                  {a.designation}
                  {a.dept ? ` · ${a.dept}` : ""}
                </p>
                <p className="text-[11px] font-fira text-subtle-tx truncate">{a.email}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
