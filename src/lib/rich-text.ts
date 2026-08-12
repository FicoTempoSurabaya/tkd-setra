const ALLOWED_TAGS: Record<string, string> = {
  P: 'p',
  DIV: 'p',
  BR: 'br',
  STRONG: 'strong',
  B: 'strong',
  EM: 'em',
  I: 'em',
  U: 'u',
  S: 's',
  STRIKE: 's',
  DEL: 'del',
  UL: 'ul',
  OL: 'ol',
  LI: 'li',
  SPAN: 'span',
  MARK: 'mark',
  FONT: 'span',
  A: 'a',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  BLOCKQUOTE: 'blockquote',
  PRE: 'pre',
  CODE: 'code',
  HR: 'hr',
  IMG: 'img',
  SUP: 'sup',
  SUB: 'sub',
};

const FONT_SIZES: Record<string, string> = {
  '1': '12px',
  '2': '14px',
  '3': '16px',
  '4': '18px',
  '5': '24px',
  '6': '32px',
  '7': '40px',
};

const ALLOWED_FONT_FAMILIES = new Set(['Arial', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana']);
const ALLOWED_TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify']);

/** Validates URI scheme to avoid javascript: etc. when persisting links. */
function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed, window.location.href);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export interface ParticipantTagData {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  nik: string;
  address: string;
  whatsapp: string;
  email: string;
}

/** Removes unsupported markup before content is saved or displayed. */
export function sanitizeRichHtml(html: string): string {
  const source = new DOMParser().parseFromString(html, 'text/html');
  const output = document.createElement('div');

  function copyNode(node: Node, target: HTMLElement): void {
    if (node.nodeType === Node.TEXT_NODE) {
      target.append(document.createTextNode(node.textContent ?? ''));
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as HTMLElement;
    const tagName = ALLOWED_TAGS[element.tagName];
    if (!tagName) {
      for (const child of Array.from(element.childNodes)) copyNode(child, target);
      return;
    }

const cleanElement = document.createElement(tagName);
    const fontFamily = element.getAttribute('face') ?? element.style.fontFamily;
    const fontSize = element.getAttribute('size') ?? element.style.fontSize;
    const textAlign = element.getAttribute('align') ?? element.style.textAlign;
    const color = element.style.color;
    const backgroundColor = element.style.backgroundColor;

    if (fontFamily && ALLOWED_FONT_FAMILIES.has(fontFamily.replaceAll('"', '').trim())) {
      cleanElement.style.fontFamily = fontFamily.replaceAll('"', '').trim();
    }
    if (fontSize && (FONT_SIZES[fontSize] || /^\d{1,2}(?:px|pt)$/.test(fontSize))) {
      cleanElement.style.fontSize = FONT_SIZES[fontSize] ?? fontSize;
    }
    if (textAlign && ALLOWED_TEXT_ALIGN.has(textAlign)) {
      cleanElement.style.textAlign = textAlign;
    }
    if (color && /^#[0-9a-fA-F]{3,8}$/.test(color?.trim())) {
      cleanElement.style.color = color.trim();
    }
    if (backgroundColor && /^#[0-9a-fA-F]{3,8}$/.test(backgroundColor?.trim())) {
      cleanElement.style.backgroundColor = backgroundColor.trim();
    }

    // Hanya pertahankan <a> dengan href yang aman (http/https/mailto/tel).
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      if (href && isSafeUrl(href)) {
        cleanElement.setAttribute('href', href);
        const target = element.getAttribute('target');
        if (target) cleanElement.setAttribute('target', target);
        const rel = element.getAttribute('rel');
        if (rel) cleanElement.setAttribute('rel', rel);
      } else {
        // Anggap sebagai teks biasa sehingga isi tautan tetap tampil.
        for (const child of Array.from(element.childNodes)) copyNode(child, target);
        return;
      }
    }

    // Hanya pertahankan <img> dengan src yang aman (http/https).
    if (tagName === 'img') {
      const src = element.getAttribute('src');
      if (src && isSafeUrl(src)) {
        cleanElement.setAttribute('src', src);
        const alt = element.getAttribute('alt');
        if (alt) cleanElement.setAttribute('alt', alt);
        const width = element.getAttribute('width');
        if (width) cleanElement.setAttribute('width', width);
        const height = element.getAttribute('height');
        if (height) cleanElement.setAttribute('height', height);
      } else {
        // Gambar tidak aman diabaikan.
        return;
      }
    }

    for (const child of Array.from(element.childNodes)) copyNode(child, cleanElement);
    target.append(cleanElement);
  }

  for (const child of Array.from(source.body.childNodes)) copyNode(child, output);
  return output.innerHTML;
}

/** Supports both the new HTML format and the legacy paragraph-based JSON format. */
export function contentToRichHtml(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const value = data as { type?: string; html?: unknown; content?: unknown[] };

  if (value.type === 'html' && typeof value.html === 'string') {
    return sanitizeRichHtml(value.html);
  }

  if (!Array.isArray(value.content)) return '';
  const legacyHtml = value.content
    .map((block) => {
      const paragraph = block as { type?: string; content?: unknown[] };
      if (paragraph.type !== 'paragraph' || !Array.isArray(paragraph.content)) return '';
      const text = paragraph.content
        .map((part) => (part as { text?: unknown }).text)
        .filter((part): part is string => typeof part === 'string')
        .join('');
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<p>${escaped}</p>`;
    })
    .join('');

  return sanitizeRichHtml(legacyHtml);
}

function formatBirthDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function personalizeRichHtml(content: unknown, participant: ParticipantTagData | null): string {
  const container = document.createElement('div');
  container.innerHTML = contentToRichHtml(content);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const replacements: Record<string, string> = {
    '@participant.nama_lengkap': participant?.fullName.trim() || 'Peserta',
    '@participant.tempat_lahir': participant?.birthPlace.trim() || '-',
    '@participant.tanggal_lahir': participant ? formatBirthDate(participant.birthDate) : '-',
    '@participant.nik': participant?.nik || '-',
    '@participant.alamat': participant?.address.trim() || '-',
    '@participant.whatsapp': participant?.whatsapp || '-',
    '@participant.email': participant?.email || '-',
  };
  const textNodes: Text[] = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const textNode of textNodes) {
    for (const [tag, replacement] of Object.entries(replacements)) {
      textNode.data = textNode.data.replaceAll(tag, replacement);
    }
  }

  return container.innerHTML;
}
