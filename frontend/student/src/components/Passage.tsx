export default function Passage({
  title,
  content,
}: {
  title: string;
  content: string | JSX.Element;
}) {
  return (
    <div className="flex flex-col gap-2 items-start text-left">
      <p className="font-fira text-foreground-light dark:text-foreground-dark text-lg">
        {title}
      </p>
      <p className="font-fira text-gray-1 dark:text-foreground-dark text-xs">
        {content}
      </p>
    </div>
  );
}
