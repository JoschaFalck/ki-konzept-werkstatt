// Minimaler Markdown-Parser für die redaktionellen Inhalte (/content).
// Bewusst kein zusätzliches Paket (CLAUDE.md: keine neuen Abhängigkeiten).
// Unterstützt: Überschriften, Absätze, Listen, Blockzitate, Trennlinien
// sowie inline **fett**, *kursiv* und [Links](…).

export interface FrontmatterResult {
  meta: Record<string, string>;
  body: string;
}

export function parseFrontmatter(raw: string): FrontmatterResult {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { meta, body: raw.slice(match[0].length) };
}

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'link'; value: string; href: string };

export type BlockNode =
  | { type: 'heading'; level: number; inlines: InlineNode[] }
  | { type: 'paragraph'; inlines: InlineNode[] }
  | { type: 'list'; items: InlineNode[][] }
  | { type: 'quote'; inlines: InlineNode[] }
  | { type: 'hr' };

export function parseInlines(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push({ type: 'text', value: text.slice(last, m.index) });
    if (m[1] !== undefined) nodes.push({ type: 'bold', value: m[1] });
    else if (m[2] !== undefined) nodes.push({ type: 'italic', value: m[2] });
    else nodes.push({ type: 'link', value: m[3], href: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push({ type: 'text', value: text.slice(last) });
  return nodes;
}

export function parseMarkdown(body: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  const lines = body.split('\n');
  let paragraph: string[] = [];
  let list: InlineNode[][] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', inlines: parseInlines(paragraph.join(' ')) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: 'list', items: list });
      list = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: heading[1].length, inlines: parseInlines(heading[2]) });
    } else if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'hr' });
    } else if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'quote', inlines: parseInlines(trimmed.slice(2)) });
    } else if (trimmed.startsWith('- ')) {
      flushParagraph();
      list = list ?? [];
      list.push(parseInlines(trimmed.slice(2)));
    } else if (trimmed === '') {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(trimmed);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Inline-Knoten als unformatierter Text (für Exporte). */
export function inlinesToText(inlines: InlineNode[]): string {
  return inlines.map((n) => n.value).join('');
}
