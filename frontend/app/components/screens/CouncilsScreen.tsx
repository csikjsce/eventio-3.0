import CouncilCard from "@/components/CouncilCard";
import { councilList } from "@/lib/dummy-data";

export default function CouncilsScreen() {
  return (
    <div className="pb-36">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Councils</h1>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {councilList.map((council) => (
          <CouncilCard key={council.id} council={council} />
        ))}
      </div>
    </div>
  );
}
