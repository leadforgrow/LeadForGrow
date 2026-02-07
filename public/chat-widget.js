(function() {
  if (window.__LFG_CHAT_INIT__) return;
  window.__LFG_CHAT_INIT__ = true;

  console.log('[LFG Chat] Initializing...');

  const config = window.LFG_CHAT_CONFIG || {};
  if (!config.businessId) {
    console.warn('[LFG Chat] businessId not found. Please set window.LFG_CHAT_CONFIG.businessId');
    return;
  }

  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Use the script's origin as BASE_URL, or fallback to production
  let BASE_URL = 'https://www.leadforgrow.com';
  try {
    if (scriptTag && scriptTag.src) {
      BASE_URL = new URL(scriptTag.src).origin;
    }
  } catch (e) {
    console.error('[LFG Chat] Failed to parse script source origin', e);
  }

  console.log('[LFG Chat] BASE_URL:', BASE_URL);

  const pos = config.position || 'right';

  // Create Container
  const container = document.createElement('div');
  container.id = 'lfg-chat-container';
  container.style.cssText = 'position: fixed; bottom: 0px; ' + pos + ': 0px; width: 100px; height: 150px; z-index: 2147483647; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; overflow: visible;';

  // Create Iframe
  const iframe = document.createElement('iframe');
  const widgetUrl = BASE_URL + '/chatbot-iframe?bizId=' + config.businessId + '&pos=' + pos;
  
  console.log('[LFG Chat] Widget URL:', widgetUrl);

  iframe.src = widgetUrl;
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; background: transparent; pointer-events: all; display: block;';
  iframe.setAttribute('allow', 'clipboard-read; clipboard-write');

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    // Only accept messages from our own origin or localhost
    const isLocal = event.origin.includes('localhost') || BASE_URL.includes('localhost');
    if (event.origin !== BASE_URL && !isLocal) return;

    if (event.data && event.data.type === 'LFG_CHAT_MSG') {
      console.log('[LFG Chat] Received message:', event.data);
      if (event.data.action === 'open') {
        container.style.width = '420px';
        container.style.height = '720px';
        container.style.bottom = '20px';
        container.style[pos] = '20px';
      } else if (event.data.action === 'close') {
        container.style.width = '100px';
        container.style.height = '150px';
        container.style.bottom = '0px';
        container.style[pos] = '0px';
      }
    }
  });
})();
