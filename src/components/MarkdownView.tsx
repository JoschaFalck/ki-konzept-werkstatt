import { dateiUrl } from '../lib/assets';
import { parseMarkdown, type InlineNode } from '../lib/markdown';

function Inlines({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'bold') return <strong key={i}>{node.value}</strong>;
        if (node.type === 'italic') return <em key={i}>{node.value}</em>;
        if (node.type === 'link')
          return (
            <a
              key={i}
              href={node.href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-primaer underline"
            >
              {node.value}
            </a>
          );
        return <span key={i}>{node.value}</span>;
      })}
    </>
  );
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);
  return (
    <div className="max-w-prose space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1)
              return (
                <h2 key={i} className="text-2xl font-semibold text-text">
                  <Inlines nodes={block.inlines} />
                </h2>
              );
            if (block.level === 2)
              return (
                <h3 key={i} className="pt-2 text-xl font-semibold text-text">
                  <Inlines nodes={block.inlines} />
                </h3>
              );
            return (
              <h4 key={i} className="pt-1 text-lg font-semibold text-text">
                <Inlines nodes={block.inlines} />
              </h4>
            );
          }
          case 'paragraph':
            return (
              <p key={i} className="text-text">
                <Inlines nodes={block.inlines} />
              </p>
            );
          case 'list':
            return (
              <ul key={i} className="list-disc space-y-1 pl-6 text-text">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inlines nodes={item} />
                  </li>
                ))}
              </ul>
            );
          case 'quote':
            return (
              <p key={i} className="border-l-4 border-akzent pl-4 text-sm italic text-sekundaer">
                <Inlines nodes={block.inlines} />
              </p>
            );
          case 'image':
            return (
              <figure key={i} className="my-5">
                <a href={dateiUrl(block.src)} target="_blank" rel="noreferrer noopener">
                  <img
                    src={dateiUrl(block.src)}
                    alt={block.alt}
                    loading="lazy"
                    className="w-full rounded-karte shadow-schwebend"
                  />
                </a>
                {block.alt && (
                  <figcaption className="mt-2 text-xs text-sekundaer">{block.alt}</figcaption>
                )}
              </figure>
            );
          case 'hr':
            return <hr key={i} className="border-sekundaer/20" />;
        }
      })}
    </div>
  );
}
