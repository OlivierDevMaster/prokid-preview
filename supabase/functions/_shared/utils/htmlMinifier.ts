import { minify } from 'html-minifier-terser';

const minifyOptions = {
  caseSensitive: false,
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: false,
  collapseWhitespace: true,
  conservativeCollapse: false,
  decodeEntities: true,
  html5: true,
  ignoreCustomComments: [],
  ignoreCustomFragments: [/<\?[\s\S]*?\?>/],
  minifyCSS: true,
  minifyJS: false,
  preserveLineBreaks: false,
  preventAttributesEscaping: false,
  processConditionalComments: true,
  processScripts: [],
  quoteCharacter: '"',
  removeAttributeQuotes: false,
  removeComments: true,
  removeEmptyAttributes: true,
  removeEmptyElements: false,
  removeOptionalTags: false,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeTagWhitespace: false,
  sortAttributes: false,
  sortClassName: false,
  trimCustomFragments: true,
  useShortDoctype: true,
};

/**
 * Minifies HTML content
 * @param html - HTML string to minify
 * @returns Minified HTML string
 */
export async function minifyHtml(html: string): Promise<string> {
  try {
    const minified = await minify(html, minifyOptions);
    return minified;
  } catch (error) {
    console.error('Error minifying HTML:', error);
    return html;
  }
}
