import ArtifactCard from "./ArtifactCard";

export default function ArtifactGrid({ artifacts, columns = 3 }) {
  const gridClass = columns === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {artifacts.map((artifact) => (
        <ArtifactCard key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
}