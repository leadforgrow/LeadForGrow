export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lfg-open-cookie-settings'));
  }
}

export function openEnquiryForm() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lfg-open-enquiry'));
  }
}

export function openBookDemo() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lfg-open-book-demo'));
  }
}
