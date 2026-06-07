"use client";

import { use } from "react";
import ProposalBuilder from "@/components/proposal-builder/ProposalBuilder";

export default function ProposalBuilderPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  return <ProposalBuilder key={eventId} eventId={eventId} />;
}
