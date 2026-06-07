/** Dedicated proposal builder for faculty approval workflow. */
export function proposalBuilderPath(eventId: number | string): string {
  return `/proposal/${eventId}`;
}
