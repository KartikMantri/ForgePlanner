import type { NotePageWithBlocks } from '../types';

export function exportNotesToMarkdown(page: NotePageWithBlocks) {
  let md = `# ${page.title}\n\n`;

  const blocks = [...(page.blocks || [])].sort((a, b) => a.sort_order - b.sort_order);

  for (const block of blocks) {
    if (!block.content?.text) continue;

    switch (block.type) {
      case 'heading':
        md += `## ${block.content.text}\n\n`;
        break;
      case 'text':
        md += `${block.content.text}\n\n`;
        break;
      case 'code':
        md += `\`\`\`\n${block.content.text}\n\`\`\`\n\n`;
        break;
      default:
        md += `${block.content.text}\n\n`;
    }
  }

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${page.title.replace(/\s+/g, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
