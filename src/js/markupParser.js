//import bbCodeToMD from 'bbcode-to-markdown';
import XBBCODE from 'xbbcode-parser';


import { Remarkable } from "remarkable";
import admonitions from 'remarkable-admonitions';

export const bbCodeToHTML = function (strings) {
  return XBBCODE.process({
    text: strings,
    removeMisalignedTags: false,
    addInLineBreaks: true
  }).html;
}

export const markdownToHTML = function (strings) {
  let md = new Remarkable('full', {
    // Enable HTML tags in source
    html: true,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: 'language-',
    // Enable some language-neutral replacement + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed
    highlight: function (/*str, lang*/) {
      return '';
    }
  });
  md.use(admonitions({ icon: 'svg-inline' }));
  return md.render(strings);
}

export default {
  bbCodeToHTML,
  markdownToHTML
}
