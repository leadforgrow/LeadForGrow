(function() {
  // Global state to prevent duplicate initialization
  if (window.__LFG_WIDGET_INIT__) return;
  window.__LFG_WIDGET_INIT__ = true;

  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const BASE_URL = scriptTag?.src ? new URL(scriptTag.src).origin : 'http://localhost:3000';
  
  async function init() {
    const containers = document.querySelectorAll('[data-lfg-token]');
    for (const container of containers) {
      const token = container.getAttribute('data-lfg-token');
      if (!token) continue;

      try {
        const response = await fetch(`${BASE_URL}/api/forms/config?token=${token}`);
        const result = await response.json();
        
        if (result.success) {
          renderWidget(container, result.data, BASE_URL);
        } else {
          console.error('[LFG Widget] Failed to load config:', result.error);
        }
      } catch (err) {
        console.error('[LFG Widget] Error:', err);
      }
    }
  }

  function renderWidget(container, config, baseUrl) {
    const formId = config.id;
    const primaryColor = config.styling?.primaryColor || '#4F46E5';
    const theme = config.styling?.theme || 'light';
    
    // Inject Styles
    const style = document.createElement('style');
    style.textContent = `
      .lfg-badge { position: fixed; bottom: 20px; right: 20px; background: ${primaryColor}; color: white; width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .lfg-badge:hover { transform: scale(1.1); }
      .lfg-badge svg { width: 32px; height: 32px; fill: white; }
      
      .lfg-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9998; opacity: 0; visibility: hidden; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
      .lfg-modal-overlay.open { opacity: 1; visibility: visible; }
      
      .lfg-form-card { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: ${theme === 'dark' ? '#1e293b' : '#ffffff'}; border-radius: 20px; padding: 32px; width: 90%; max-width: 450px; position: relative; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 20px 60px -12px rgba(0,0,0,0.15); color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'}; max-height: 90vh; overflow-y: auto; text-align: left; }
      .lfg-modal-overlay.open .lfg-form-card { transform: translateY(0); }
      
      .lfg-close { position: absolute; top: 16px; right: 16px; cursor: pointer; opacity: 0.5; padding: 4px; font-size: 24px; line-height: 1; }
      .lfg-close:hover { opacity: 1; }

      .lfg-form-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
      .lfg-form-desc { font-size: 14px; opacity: 0.7; margin-bottom: 24px; }
      .lfg-field { margin-bottom: 16px; }
      .lfg-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
      .lfg-input { width: 100%; background: ${theme === 'dark' ? '#334155' : '#f1f5f9'}; border: 1px solid transparent; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: inherit; transition: all 0.2s; box-sizing: border-box; }
      .lfg-input:focus { outline: none; border-color: ${primaryColor}; box-shadow: 0 0 0 3px ${primaryColor}20; }
      .lfg-submit { width: 100%; background: ${primaryColor}; color: white; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
      .lfg-submit:hover { opacity: 0.9; }
      .lfg-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // Create Badge
    const badge = document.createElement('div');
    badge.className = 'lfg-badge';
    badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
    container.appendChild(badge);

    // Create Modal
    const overlay = document.createElement('div');
    overlay.className = 'lfg-modal-overlay';
    
    let fieldsHtml = '';
    config.fields.forEach(field => {
      fieldsHtml += `
        <div class="lfg-field">
          <label class="lfg-label">${field.label}${field.required ? '*' : ''}</label>
          ${field.type === 'textarea' 
            ? `<textarea name="${field.name}" class="lfg-input" rows="3" ${field.required ? 'required' : ''}></textarea>`
            : `<input type="${field.type}" name="${field.name}" class="lfg-input" ${field.required ? 'required' : ''} />`
          }
        </div>
      `;
    });

    overlay.innerHTML = `
      <div class="lfg-form-card">
        <div class="lfg-close">&times;</div>
        <div class="lfg-body">
          <div class="lfg-form-title">Contact Us</div>
          <div class="lfg-form-desc">Share your details and we'll get in touch!</div>
          <form class="lfg-form-el">
            ${fieldsHtml}
            <button type="submit" class="lfg-submit">${config.styling?.buttonText || 'Submit'}</button>
          </form>
          <div style="text-align: center; font-size: 10px; opacity: 0.4; margin-top: 16px;">Powered by LeadForGrow</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Logic
    const closeBtn = overlay.querySelector('.lfg-close');
    const formEl = overlay.querySelector('.lfg-form-el');
    const submitBtn = overlay.querySelector('.lfg-submit');
    const bodyEl = overlay.querySelector('.lfg-body');
    
    let isSubmitted = false;
    let popupTimer;

    const openModal = () => {
      if (!isSubmitted && !overlay.classList.contains('open')) {
        overlay.classList.add('open');
      }
    };

    const startPopupTimer = (delay) => {
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = setTimeout(openModal, delay);
    };

    // Auto-popups
    startPopupTimer(30000); // 30s initial

    badge.addEventListener('click', openModal);
    
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('open');
      if (!isSubmitted) startPopupTimer(45000); // 45s recurring
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        if (!isSubmitted) startPopupTimer(45000);
      }
    });

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending...';

      const data = { token: config.token };
      new FormData(formEl).forEach((value, key) => data[key] = value);

      try {
        const resp = await fetch(`${baseUrl}/api/forms/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const res = await resp.json();
        if (res.success) {
          isSubmitted = true;
          if (popupTimer) clearTimeout(popupTimer);
          bodyEl.innerHTML = `<div style="text-align:center;padding:40px 0;"><h3>✅ Success!</h3><p style="margin-top:10px;">${config.successMessage}</p></div>`;
          setTimeout(() => {
            overlay.classList.remove('open');
          }, 3000);
        } else {
          alert(res.error || 'Submission failed');
          submitBtn.disabled = false;
          submitBtn.innerText = config.styling?.buttonText || 'Submit';
        }
      } catch (err) {
        alert('Error connecting to server');
        submitBtn.disabled = false;
        submitBtn.innerText = config.styling?.buttonText || 'Submit';
      }
    });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
