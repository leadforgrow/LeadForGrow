(function () {
  if (window.__LFG_WIDGET_INIT__) return;
  window.__LFG_WIDGET_INIT__ = true;

  const scriptTag = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  function resolveBaseUrl(container) {
    const override = container?.getAttribute('data-lfg-base-url');
    if (override) return override.replace(/\/$/, '');
    if (scriptTag?.src) return new URL(scriptTag.src).origin;
    return window.location.origin;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function inputType(field) {
    if (field.type === 'email') return 'email';
    if (field.type === 'phone') return 'tel';
    if (field.type === 'date') return 'date';
    return 'text';
  }

  function renderFieldHtml(field) {
    const req = field.required ? ' required' : '';
    const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
    const label = escapeHtml(field.label);
    const help = field.helpText
      ? `<p class="lfg-help">${escapeHtml(field.helpText)}</p>`
      : '';

    if (field.type === 'checkbox') {
      return `
        <div class="lfg-field">
          <label class="lfg-checkbox">
            <input type="checkbox" name="${escapeHtml(field.name)}"${req} />
            <span>${label}${field.required ? ' *' : ''}</span>
          </label>
          ${help}
        </div>`;
    }

    if (field.type === 'textarea' || field.type === 'address') {
      return `
        <div class="lfg-field">
          <label class="lfg-label">${label}${field.required ? ' *' : ''}</label>
          ${help}
          <textarea name="${escapeHtml(field.name)}" class="lfg-input" rows="3"${placeholder}${req}></textarea>
        </div>`;
    }

    if (field.type === 'select') {
      const options = (field.options || [])
        .map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`)
        .join('');
      return `
        <div class="lfg-field">
          <label class="lfg-label">${label}${field.required ? ' *' : ''}</label>
          ${help}
          <select name="${escapeHtml(field.name)}" class="lfg-input"${req}>
            <option value="">${escapeHtml(field.placeholder || 'Select…')}</option>
            ${options}
          </select>
        </div>`;
    }

    if (field.type === 'radio') {
      const opts = field.options || ['Yes', 'No'];
      const radios = opts
        .map((o, i) => `
          <label class="lfg-radio">
            <input type="radio" name="${escapeHtml(field.name)}" value="${escapeHtml(o)}"${field.required && i === 0 ? ' required' : ''} />
            <span>${escapeHtml(o)}</span>
          </label>`)
        .join('');
      return `
        <div class="lfg-field">
          <label class="lfg-label">${label}${field.required ? ' *' : ''}</label>
          ${help}
          <div class="lfg-radio-group">${radios}</div>
        </div>`;
    }

    if (field.type === 'file') {
      return `
        <div class="lfg-field">
          <label class="lfg-label">${label}${field.required ? ' *' : ''}</label>
          ${help}
          <input type="file" name="${escapeHtml(field.name)}" class="lfg-input"${req} />
        </div>`;
    }

    const defaultVal = field.defaultValue ? ` value="${escapeHtml(field.defaultValue)}"` : '';
    return `
      <div class="lfg-field">
        <label class="lfg-label">${label}${field.required ? ' *' : ''}</label>
        ${help}
        <input type="${inputType(field)}" name="${escapeHtml(field.name)}" class="lfg-input"${placeholder}${defaultVal}${req} />
      </div>`;
  }

  function injectStyles(config) {
    const primaryColor = config.styling?.primaryColor || '#2563eb';
    const theme = config.styling?.theme || 'light';
    const isDark = theme === 'dark';
    const styleId = 'lfg-widget-styles';

    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .lfg-badge { position: fixed; bottom: 20px; right: 20px; background: ${primaryColor}; color: white; width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: none; }
      .lfg-badge:hover { transform: scale(1.1); }
      .lfg-badge svg { width: 32px; height: 32px; fill: white; }

      .lfg-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9998; opacity: 0; visibility: hidden; transition: all 0.3s; display: flex; align-items: center; justify-content: center; padding: 16px; }
      .lfg-modal-overlay.open { opacity: 1; visibility: visible; }

      .lfg-form-card { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${isDark ? '#1e293b' : '#ffffff'}; border-radius: ${config.styling?.borderRadius ?? 16}px; padding: 32px; width: 100%; max-width: 480px; position: relative; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 20px 60px -12px rgba(0,0,0,0.15); color: ${isDark ? '#f8fafc' : '#0f172a'}; max-height: 90vh; overflow-y: auto; text-align: left; box-sizing: border-box; }
      .lfg-modal-overlay.open .lfg-form-card { transform: translateY(0); }
      .lfg-inline-wrap .lfg-form-card { transform: none; box-shadow: 0 8px 40px rgba(15, 23, 42, 0.08); max-width: 100%; }

      .lfg-close { position: absolute; top: 16px; right: 16px; cursor: pointer; opacity: 0.5; padding: 4px; font-size: 24px; line-height: 1; background: none; border: none; color: inherit; }
      .lfg-close:hover { opacity: 1; }

      .lfg-form-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .lfg-form-desc { font-size: 14px; opacity: 0.7; margin-bottom: 24px; line-height: 1.5; }
      .lfg-field { margin-bottom: 16px; }
      .lfg-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
      .lfg-help { font-size: 11px; opacity: 0.6; margin: 0 0 6px; }
      .lfg-input { width: 100%; background: ${isDark ? '#334155' : '#f8fafc'}; border: 1px solid ${isDark ? '#475569' : '#e2e8f0'}; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: inherit; transition: all 0.2s; box-sizing: border-box; font-family: inherit; }
      .lfg-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}20; }
      .lfg-checkbox, .lfg-radio { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
      .lfg-radio-group { display: flex; flex-direction: column; gap: 8px; }
      .lfg-submit { width: 100%; background: ${primaryColor}; color: white; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; font-family: inherit; }
      .lfg-submit:hover { opacity: 0.92; }
      .lfg-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      .lfg-logo { height: 32px; margin-bottom: 16px; object-fit: contain; display: block; }
      .lfg-alert { padding: 12px 14px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; display: none; }
      .lfg-alert.success { display: block; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
      .lfg-alert.error { display: block; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
      .lfg-powered { text-align: center; font-size: 10px; opacity: 0.4; margin-top: 16px; }
    `;
    document.head.appendChild(style);
  }

  function buildFormBody(config) {
    const fieldsHtml = (config.fields || []).map(renderFieldHtml).join('');
    const title = escapeHtml(config.name || 'Contact us');
    const desc = config.description
      ? `<div class="lfg-form-desc">${escapeHtml(config.description)}</div>`
      : '';
    const logo = config.styling?.logoUrl
      ? `<img class="lfg-logo" src="${escapeHtml(config.styling.logoUrl)}" alt="" />`
      : '';
    const buttonText = escapeHtml(config.styling?.buttonText || 'Submit');

    return `
      ${logo}
      <div class="lfg-form-title">${title}</div>
      ${desc}
      <div class="lfg-alert" data-lfg-alert></div>
      <form class="lfg-form-el">
        ${fieldsHtml}
        <button type="submit" class="lfg-submit">${buttonText}</button>
      </form>
      <div class="lfg-powered">Powered by LeadForGrow</div>`;
  }

  async function submitForm(formEl, config, baseUrl, ui) {
    const submitBtn = formEl.querySelector('.lfg-submit');
    const alertEl = ui.querySelector('[data-lfg-alert]');
    const buttonText = config.styling?.buttonText || 'Submit';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    if (alertEl) {
      alertEl.className = 'lfg-alert';
      alertEl.textContent = '';
    }

    const data = { token: config.token };
    new FormData(formEl).forEach((value, key) => {
      data[key] = value;
    });

    try {
      const resp = await fetch(`${baseUrl}/api/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const res = await resp.json();

      if (res.success) {
        const msg = res.message || config.successMessage || 'Thank you! We will be in touch soon.';
        if (alertEl) {
          alertEl.className = 'lfg-alert success';
          alertEl.textContent = msg;
        } else {
          ui.innerHTML = `<div style="text-align:center;padding:40px 0;"><h3>Success</h3><p style="margin-top:10px;">${escapeHtml(msg)}</p></div>`;
        }
        formEl.reset();

        if (res.redirectUrl) {
          setTimeout(() => { window.location.href = res.redirectUrl; }, 1500);
        }
      } else if (alertEl) {
        alertEl.className = 'lfg-alert error';
        alertEl.textContent = res.error || 'Submission failed. Please try again.';
      } else {
        alert(res.error || 'Submission failed');
      }
    } catch (err) {
      if (alertEl) {
        alertEl.className = 'lfg-alert error';
        alertEl.textContent = 'Network error. Please check your connection.';
      } else {
        alert('Error connecting to server');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = buttonText;
    }
  }

  function renderInline(container, config, baseUrl) {
    injectStyles(config);
    container.classList.add('lfg-inline-wrap');
    container.innerHTML = `<div class="lfg-form-card">${buildFormBody(config)}</div>`;

    const card = container.querySelector('.lfg-form-card');
    const formEl = card.querySelector('.lfg-form-el');
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(formEl, config, baseUrl, card);
    });
  }

  function renderFloating(container, config, baseUrl) {
    injectStyles(config);

    const formType = config.styling?.formType || 'floating';
    const mode = container.getAttribute('data-lfg-mode');
    const isInline = mode === 'inline' || formType === 'inline' || formType === 'fullpage';

    if (isInline) {
      renderInline(container, config, baseUrl);
      return;
    }

    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'lfg-badge';
    badge.setAttribute('aria-label', config.name || 'Open form');
    badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.07,12.85c0.77-1.39,2.25-2.21,3.11-3.44c0.91-1.29,0.4-3.7-2.18-3.7c-1.69,0-2.52,1.28-2.87,2.34L6.54,6.96 C7.25,4.83,9.18,3,12.19,3c4.1,0,6.21,3.12,4.84,6.03l-0.01,0.01c-0.6,1.28-2.1,2.42-2.98,3.41c-0.84,0.93-0.92,1.65-1.02,2.55 h-3C11.02,14.28,11.07,13.62,11.07,12.85z M13.84,19.33c0,1.29-1.05,2.34-2.34,2.34s-2.34-1.05-2.34-2.34s1.05-2.34,2.34-2.34 S13.84,18.04,13.84,19.33z"/></svg>';
    container.appendChild(badge);

    const overlay = document.createElement('div');
    overlay.className = 'lfg-modal-overlay';
    overlay.innerHTML = `
      <div class="lfg-form-card">
        <button type="button" class="lfg-close" aria-label="Close">&times;</button>
        ${buildFormBody(config)}
      </div>`;
    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('.lfg-close');
    const formEl = overlay.querySelector('.lfg-form-el');
    const card = overlay.querySelector('.lfg-form-card');

    const openModal = () => overlay.classList.add('open');
    const closeModal = () => overlay.classList.remove('open');

    badge.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    const popupDelay = parseInt(container.getAttribute('data-lfg-popup-delay') || '0', 10);
    if (popupDelay > 0) {
      setTimeout(openModal, popupDelay);
    }

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(formEl, config, baseUrl, card);
    });
  }

  async function init() {
    const containers = document.querySelectorAll('[data-lfg-token]');
    for (const container of containers) {
      const token = container.getAttribute('data-lfg-token');
      if (!token || container.getAttribute('data-lfg-loaded') === 'true') continue;

      const baseUrl = resolveBaseUrl(container);

      try {
        const response = await fetch(`${baseUrl}/api/forms/config?token=${encodeURIComponent(token)}`);
        const result = await response.json();

        if (result.success) {
          container.setAttribute('data-lfg-loaded', 'true');
          renderFloating(container, result.data, baseUrl);
        } else {
          console.error('[LFG Widget] Failed to load config:', result.error);
        }
      } catch (err) {
        console.error('[LFG Widget] Error:', err);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
