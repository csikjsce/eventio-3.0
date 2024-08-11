export default function Divider({ text }: { text: string }) {
  return (
    <div className="flex flex-row items-center gap-4 text-gray-500">
      &lt;
      <div className="flex-1 border-b-2 border-gray-500"></div>
      <p className="text-md font-fira">{text}</p>
      <div className="flex-1 border-b-2 border-gray-500"></div>
      &gt;
    </div>
  );
}
