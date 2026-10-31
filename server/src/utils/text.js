import * as cheerio from 'cheerio';

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  minus: '−',
};

export function decodeEntities(value = '') {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

export function normalizeText(value = '') {
  return String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function htmlToText(html = '') {
  if (!html) return '';
  const $ = cheerio.load(html);
  $('script, style, noscript, svg, iframe, form, nav, footer, header, aside, button').remove();
  const article = $('article').first();
  const main = article.length ? article : $('main').first().length ? $('main').first() : $('body');
  main.find('br').replaceWith('\n');
  main.find('p, h1, h2, h3, h4, h5, h6, li, tr, blockquote, figcaption, caption').each((_, el) => {
    $(el).append('\n');
  });
  return normalizeText(main.text());
}

export function extractHtmlTitle(html = '') {
  if (!html) return '';
  const $ = cheerio.load(html);
  const og = $('meta[property="og:title"]').attr('content');
  const twitter = $('meta[name="twitter:title"]').attr('content');
  const title = $('title').first().text() || $('h1').first().text();
  return normalizeText(og || twitter || title || '');
}

/** Chuyển JATS/XML full text (Europe PMC) thành text dễ đọc, giữ tiêu đề mục và bảng. */
export function xmlToText(xml = '') {
  if (!xml) return '';
  const body = xml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = body ? body[1] : xml;
  content = content
    .replace(/<ref-list[\s\S]*?<\/ref-list>/gi, '')
    .replace(/<back[\s\S]*?<\/back>/gi, '')
    .replace(/<table-wrap[^>]*>/gi, '\n[Bảng]\n')
    .replace(/<\/table-wrap>/gi, '\n')
    .replace(/<caption[^>]*>/gi, '\n')
    .replace(/<\/(p|title|sec|td|th|tr|caption|list-item|label|article-title)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return normalizeText(decodeEntities(content));
}

/** Cắt văn bản quá dài để tránh nhồi quá nhiều token vào một request. */
export function truncateText(text = '', maxChars = 60000) {
  const value = normalizeText(text);
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n\n[…văn bản đã được rút gọn do quá dài…]`;
}

/**
 * Chia text thành các đoạn <= maxChars, ưu tiên ranh giới đoạn văn.
 */
export function splitIntoChunks(text = '', maxChars = 24000) {
  const value = normalizeText(text);
  if (!value) return [];
  if (value.length <= maxChars) return [value];

  const paragraphs = value.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  const pushLongParagraph = (paragraph) => {
    const sentences = paragraph.split(/(?<=[.!?;])\s+/);
    for (const sentence of sentences) {
      if ((current + ' ' + sentence).length > maxChars) {
        if (current) chunks.push(current.trim());
        current = '';
      }
      if (sentence.length > maxChars) {
        for (let i = 0; i < sentence.length; i += maxChars) {
          chunks.push(sentence.slice(i, i + maxChars));
        }
      } else {
        current += (current ? ' ' : '') + sentence;
      }
    }
  };

  for (const paragraph of paragraphs) {
    if (!paragraph) continue;
    if (paragraph.length > maxChars) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      pushLongParagraph(paragraph);
    } else if ((current + '\n\n' + paragraph).length > maxChars) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current += (current ? '\n\n' : '') + paragraph;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/** Ước lượng token thô để hiển thị chi phí (không dùng để thanh toán). */
export function estimateTokens(text = '') {
  return Math.ceil(String(text).length / 4);
}
