//import bbCodeToMD from 'bbcode-to-markdown';
import XBBCODE from 'xbbcode-parser';
import { Remarkable } from 'remarkable';

export const bbCodeToHTML = function (strings) {
  return XBBCODE.process({
    text: strings,
    removeMisalignedTags: false,
    addInLineBreaks: true
  }).html;
}

export const markdownToHTML = function (strings) {
  let md = new Remarkable('full', {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks

    // Enable some language-neutral replacement + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
    quotes: '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed
    highlight: function (/*str, lang*/) { return ''; }
  });
  return md.render(strings);
}

export default {
  bbCodeToHTML,
  markdownToHTML
}
