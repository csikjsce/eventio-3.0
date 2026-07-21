export default function Passage({
  title,
  content,
}: {
  title: string;
  content: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 items-start">
      <p className="font-poppins font-semibold text-foreground text-base">{title}</p>
      <div className="font-poppins text-mute text-sm leading-relaxed">{content}</div>
    </div>
  );
}
