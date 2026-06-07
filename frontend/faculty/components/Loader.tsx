export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-red-500 rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    </div>
  );
}
