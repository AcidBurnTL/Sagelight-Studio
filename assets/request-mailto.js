// Builds a single mailto: draft for the custom-app request form.
// Shared by assets/request-form.js and scripts/check-site.mjs.
// The recipient is fixed. User text is never placed in the address or in
// extra headers, and control characters cannot become header breaks.

export const REQUEST_TO = 'contact@sagelight-studio.com';
export const MAILTO_LIMIT = 1900;

const LINE_BREAKS = /[\u0000-\u001F\u007F\u0085\u2028\u2029]/g;
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

export function oneLine(value) {
  return String(value ?? '')
    .replace(INVISIBLE, '')
    .replace(LINE_BREAKS, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .trim();
}

export function bodyBlock(value) {
  return String(value ?? '')
    .replace(INVISIBLE, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u0085\u2028\u2029]/g, '')
    .trim();
}

export function isReplyEmail(value) {
  const email = oneLine(value);
  if (email.length < 6 || email.length > 120) return false;
  if (/[<>(),;:\\/\[\]"\s]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fixedLine(value) {
  return oneLine(value);
}

export function buildRequestMailto(input) {
  const name = oneLine(input.name).slice(0, 80);
  const email = oneLine(input.email).slice(0, 120);
  const idea = bodyBlock(input.idea).slice(0, 700);
  const requirements = bodyBlock(input.requirements).slice(0, 900);
  const subject = oneLine(fixedLine(input.subjectPrefix) + ' — ' + name).slice(0, 140);
  const labels = input.labels || {};
  const body = [
    fixedLine(input.heading),
    fixedLine(input.disclaimer),
    '',
    fixedLine(labels.name) + ': ' + name,
    fixedLine(labels.email) + ': ' + email,
    '',
    fixedLine(labels.idea) + ':',
    idea,
    '',
    fixedLine(labels.requirements) + ':',
    requirements,
    '',
    '---',
    fixedLine(labels.page) + ': ' + fixedLine(input.pageUrl),
    fixedLine(labels.language) + ': ' + fixedLine(input.languageName),
  ].join('\n');

  const href = 'mailto:' + REQUEST_TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  const address = href.slice('mailto:'.length).split('?')[0];
  const query = href.split('?')[1] || '';
  const subjectParam = (query.split('&')[0] || '').replace(/^subject=/, '');
  const keys = query.split('&').map((part) => part.split('=')[0]);

  if (address !== REQUEST_TO || href.includes('\n') || href.includes('\r') || href.includes(' ')) {
    return { ok: false, reason: 'malformed', text: body };
  }
  if (/%0a|%0d/i.test(subjectParam)) {
    return { ok: false, reason: 'unsafe-subject', text: body };
  }
  if (keys.length !== 2 || keys[0] !== 'subject' || keys[1] !== 'body') {
    return { ok: false, reason: 'malformed', text: body };
  }
  if (href.length > MAILTO_LIMIT) {
    return { ok: false, reason: 'too-long', text: body };
  }
  return { ok: true, href, text: body, subject };
}
