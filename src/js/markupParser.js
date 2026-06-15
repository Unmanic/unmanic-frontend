//import bbCodeToMD from 'bbcode-to-markdown';
import XBBCODE from 'xbbcode-parser';


import { Remarkable } from "remarkable";
import admonitions from 'remarkable-admonitions';

const enhanceMarkdownHTML = function (renderedHtml) {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return renderedHtml;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div class="markdown-root">${renderedHtml}</div>`, 'text/html');
  const root = doc.body.firstElementChild;

  if (!root) {
    return renderedHtml;
  }

  root.querySelectorAll('a[href]').forEach((link) => {
    link.classList.add('markdown-link');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    const labelHtml = link.innerHTML;
    link.innerHTML = '';

    const leadingIcon = doc.createElement('span');
    leadingIcon.className = 'markdown-link__icon markdown-link__icon--leading material-icons notranslate';
    leadingIcon.setAttribute('aria-hidden', 'true');
    leadingIcon.textContent = 'public';

    const label = doc.createElement('span');
    label.className = 'markdown-link__label';
    label.innerHTML = labelHtml;

    const trailingIcon = doc.createElement('span');
    trailingIcon.className = 'markdown-link__icon markdown-link__icon--trailing material-icons notranslate';
    trailingIcon.setAttribute('aria-hidden', 'true');
    trailingIcon.textContent = 'open_in_new';

    link.appendChild(leadingIcon);
    link.appendChild(label);
    link.appendChild(trailingIcon);
  });

  root.querySelectorAll('table').forEach((table) => {
    table.classList.add('markdown-table');
    if (table.parentElement && table.parentElement.classList.contains('markdown-table-wrap')) {
      return;
    }

    const wrapper = doc.createElement('div');
    wrapper.className = 'markdown-table-wrap';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  return root.innerHTML;
}

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
  return enhanceMarkdownHTML(md.render(strings));
}

export default {
  bbCodeToHTML,
  markdownToHTML
}
