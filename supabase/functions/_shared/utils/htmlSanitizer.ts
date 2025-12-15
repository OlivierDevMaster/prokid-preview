import {
  escapeAttrValue,
  escapeHtml,
  FilterXSS,
  type IFilterXSSOptions,
} from 'xss';

const xssOptions: IFilterXSSOptions = {
  allowList: {
    style: [/^/],
  },
  onTagAttr: (tag, name, value) => {
    if (tag === 'style' && name === 'type') {
      return name + '="' + escapeAttrValue(value) + '"';
    }
    return undefined;
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'],
  whiteList: {
    a: ['href', 'title', 'target'],
    abbr: ['title'],
    address: [],
    area: ['shape', 'coords', 'href', 'alt'],
    article: [],
    aside: [],
    audio: ['autoplay', 'controls', 'loop', 'preload', 'src'],
    b: [],
    bdi: ['dir'],
    bdo: ['dir'],
    big: [],
    blockquote: ['cite'],
    br: [],
    button: ['disabled', 'type', 'name', 'value'],
    canvas: ['width', 'height'],
    caption: [],
    center: [],
    cite: [],
    code: [],
    col: ['align', 'valign', 'span', 'width'],
    colgroup: ['align', 'valign', 'span', 'width'],
    dd: [],
    del: ['datetime'],
    details: ['open'],
    div: ['style'],
    dl: [],
    dt: [],
    em: [],
    embed: [
      'type',
      'src',
      'width',
      'height',
      'wmode',
      'allowscriptaccess',
      'allowfullscreen',
    ],
    fieldset: ['disabled'],
    figcaption: [],
    figure: [],
    font: ['color', 'size', 'face'],
    footer: [],
    form: [
      'name',
      'action',
      'method',
      'enctype',
      'onsubmit',
      'target',
      'accept',
      'accept-charset',
    ],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style'],
    h5: ['style'],
    h6: ['style'],
    header: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height', 'style'],
    input: [
      'type',
      'name',
      'value',
      'disabled',
      'readonly',
      'checked',
      'alt',
      'src',
      'accept',
      'autocomplete',
      'autofocus',
      'form',
      'formaction',
      'formenctype',
      'formmethod',
      'formnovalidate',
      'formtarget',
      'height',
      'list',
      'max',
      'maxlength',
      'min',
      'multiple',
      'pattern',
      'placeholder',
      'required',
      'size',
      'step',
      'width',
    ],
    ins: ['datetime'],
    kbd: [],
    label: ['for'],
    legend: [],
    li: ['style'],
    main: [],
    mark: [],
    nav: [],
    ol: ['style'],
    p: ['style'],
    pre: ['style'],
    s: [],
    section: [],
    small: [],
    source: ['src', 'type'],
    span: ['style'],
    strong: [],
    style: ['type'],
    sub: [],
    summary: [],
    sup: [],
    table: ['width', 'border', 'align', 'valign', 'style'],
    tbody: ['align', 'valign'],
    td: ['width', 'rowspan', 'colspan', 'align', 'valign', 'style'],
    tfoot: ['align', 'valign'],
    th: ['width', 'rowspan', 'colspan', 'align', 'valign', 'style'],
    thead: ['align', 'valign'],
    tr: ['rowspan', 'align', 'valign', 'style'],
    track: ['kind', 'src', 'srclang', 'label', 'default'],
    u: [],
    ul: ['style'],
    video: [
      'autoplay',
      'controls',
      'loop',
      'preload',
      'src',
      'height',
      'width',
    ],
  },
};

const xssFilter = new FilterXSS(xssOptions);

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return xssFilter.process(html);
}

/**
 * Sanitizes plain text content (escapes HTML entities)
 * @param text - Plain text to sanitize
 * @returns Sanitized text with HTML entities escaped
 */
export function sanitizeText(text: string): string {
  return escapeHtml(text);
}
