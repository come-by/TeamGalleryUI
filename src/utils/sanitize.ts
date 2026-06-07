import DOMPurify from 'dompurify'

/**
 * 清洗 HTML 内容，防止 XSS 攻击
 *
 * @param html - 原始 HTML 内容
 * @returns 清洗后的安全 HTML
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'div',
      'span',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'main',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'class',
      'id',
      'target',
      'rel',
      'width',
      'height',
    ],
  })
}
