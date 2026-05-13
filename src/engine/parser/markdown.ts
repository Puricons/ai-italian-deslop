import type { Segment } from "../../types.js";

export function segmentText(text: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;

  // Frontmatter YAML (solo se inizia il file con ---)
  if (text.startsWith("---\n") || text.startsWith("---\r\n")) {
    const end = text.indexOf("\n---", 4);
    if (end !== -1) {
      const fmEnd = end + 4;
      segments.push({ text: text.slice(0, fmEnd), start: 0, isCode: true });
      pos = fmEnd;
    }
  }

  while (pos < text.length) {
    // Fenced code block: ``` or ~~~
    const fenceMatch = /^(`{3,}|~{3,})[^\n]*\n/m.exec(text.slice(pos));
    if (fenceMatch && text.slice(pos).indexOf("\n" + fenceMatch[1].slice(0, 3)) !== -1) {
      const fenceStart = pos + fenceMatch.index;
      const fenceChar = fenceMatch[1].slice(0, 3);
      const closeIdx = text.indexOf("\n" + fenceChar, fenceStart + fenceMatch[0].length);
      if (closeIdx !== -1) {
        // Testo prima del fence
        if (fenceStart > pos) {
          pushProseWithInlineCode(text.slice(pos, fenceStart), pos, segments);
        }
        const blockEnd = closeIdx + fenceChar.length + 1;
        segments.push({
          text: text.slice(fenceStart, blockEnd),
          start: fenceStart,
          isCode: true,
        });
        pos = blockEnd;
        continue;
      }
    }
    // Nessun fence trovato: tutto il resto è prosa (con inline code gestito)
    pushProseWithInlineCode(text.slice(pos), pos, segments);
    break;
  }

  return segments;
}

function pushProseWithInlineCode(text: string, offset: number, segments: Segment[]): void {
  const re = /`[^`\n]+`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segments.push({ text: text.slice(last, m.index), start: offset + last, isCode: false });
    }
    segments.push({ text: m[0], start: offset + m.index, isCode: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), start: offset + last, isCode: false });
  }
}
