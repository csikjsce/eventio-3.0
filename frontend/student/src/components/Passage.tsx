export default function Passage({
  title,
  content,
}: {
  title: string;
  content: string | JSX.Element;
}) {
  return (
    <div className="flex flex-col gap-2 items-start text-left">
      <p className="font-fira text-foreground  text-lg">{title}</p>
      <p className="font-fira text-mute  text-xs">{content}</p>
    </div>
  );
}
