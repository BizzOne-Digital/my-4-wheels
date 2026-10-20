/** Minimal safe text renderer: blank-line paragraphs, "## " headings and "- " bullet lists. No HTML injection. */
export function RichText({ text, className = "prose-m4w" }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
        const lines = b.split("\n");
        if (lines.every((x) => x.trim().startsWith("- ")))
          return (
            <ul key={i}>
              {lines.map((x, j) => (
                <li key={j}>{x.trim().slice(2)}</li>
              ))}
            </ul>
          );
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}
