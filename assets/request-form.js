// Prepares a mailto draft from the custom-app request form.
// The page never sends mail. A successful click only opens the visitor's
// email app; they still have to send the message themselves.
import { buildRequestMailto, isReplyEmail } from './request-mailto.js';

const form = document.getElementById('request-form');
const configNode = document.getElementById('request-copy');
if (form && configNode) {
  let config;
  try {
    config = JSON.parse(configNode.textContent);
  } catch (error) {
    config = null;
  }

  const status = document.getElementById('request-status');
  const overflow = document.getElementById('request-overflow');
  const draftText = document.getElementById('request-draft-text');
  const fields = {
    name: document.getElementById('req-name'),
    email: document.getElementById('req-email'),
    idea: document.getElementById('req-idea'),
    requirements: document.getElementById('req-requirements'),
  };

  function errorNode(key) {
    return document.getElementById('req-' + key + '-error');
  }

  function showError(key, message) {
    const field = fields[key];
    const node = errorNode(key);
    if (!field || !node) return;
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      node.textContent = message;
    } else {
      field.removeAttribute('aria-invalid');
      node.textContent = '';
    }
  }

  function fieldText(field) {
    return field && field.value ? field.value.trim() : '';
  }

  function validate() {
    const mins = config.mins || {};
    const errors = config.errors || {};
    const checks = [
      ['name', fieldText(fields.name).length >= (mins.name || 2), errors.name],
      ['email', isReplyEmail(fields.email && fields.email.value), errors.email],
      ['idea', fieldText(fields.idea).length >= (mins.idea || 24), errors.idea],
      ['requirements', fieldText(fields.requirements).length >= (mins.requirements || 12), errors.requirements],
    ];
    let first = null;
    checks.forEach(function (check) {
      const key = check[0];
      const ok = check[1];
      showError(key, ok ? '' : check[2]);
      if (!ok && !first) first = fields[key];
    });
    return first;
  }

  function clearStatus() {
    if (status) status.textContent = '';
    if (overflow) overflow.hidden = true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!config) return;
    const firstInvalid = validate();
    if (firstInvalid) {
      clearStatus();
      firstInvalid.focus();
      return;
    }

    const built = buildRequestMailto({
      name: fields.name.value,
      email: fields.email.value,
      idea: fields.idea.value,
      requirements: fields.requirements.value,
      subjectPrefix: config.subject,
      heading: config.heading,
      disclaimer: config.disclaimer,
      labels: config.labels,
      pageUrl: config.pageUrl,
      languageName: config.languageName,
    });

    if (!built.ok) {
      if (status) status.textContent = config.tooLong || '';
      if (overflow && draftText && built.text) {
        overflow.hidden = false;
        draftText.value = built.text;
      }
      if (status) status.focus();
      return;
    }

    if (overflow) overflow.hidden = true;
    if (draftText) draftText.value = '';
    if (status) status.textContent = config.opened || '';
    if (status) status.focus();
    const navigate = window.__requestNavigate;
    if (typeof navigate === 'function') navigate(built.href);
    else window.location.href = built.href;
  });
}
