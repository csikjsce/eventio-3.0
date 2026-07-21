import { markdownToHtml } from "@/lib/markdown";

/** Renders sanitized markdown with app typography. Use only for trusted-ish, sanitized content. */
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="font-poppins text-mute text-sm leading-relaxed break-words [overflow-wrap:anywhere] [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_code]:bg-card [&_code]:px-1 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_strong]:text-foreground"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
}
