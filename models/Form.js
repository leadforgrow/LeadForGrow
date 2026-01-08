import mongoose from 'mongoose';

const FormFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }], // For select, radio, checkbox
  validation: {
    pattern: String,
    minLength: Number,
    maxLength: Number,
    message: String
  }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  // Business Context
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  
  // Form Identity
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Secure Token for Submissions
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Form Configuration
  fields: {
    type: [FormFieldSchema],
    default: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'phone', label: 'Phone Number', type: 'phone', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: false },
      { name: 'message', label: 'Message', type: 'textarea', required: false }
    ]
  },
  
  // Embed Code (generated)
  embedCode: {
    type: String
  },
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  submissionCount: {
    type: Number,
    default: 0
  },
  lastSubmissionAt: {
    type: Date
  },
  
  // Customization
  styling: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'custom'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#4F46E5' // Indigo
    },
    buttonText: {
      type: String,
      default: 'Submit'
    }
  },
  
  // Success Configuration
  successMessage: {
    type: String,
    default: 'Thank you! We will get back to you soon.'
  },
  redirectUrl: {
    type: String,
    trim: true
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
FormSchema.index({ businessId: 1, active: 1 });

// Auto-generate embed code before saving
FormSchema.pre('save', async function() {
  if (this.isNew || this.isModified('token') || this.isModified('fields')) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formId = this._id.toString();
    const config = JSON.stringify({
      token: this.token,
      fields: this.fields,
      styling: this.styling,
      successMessage: this.successMessage,
      redirectUrl: this.redirectUrl
    });

    const scriptContent = `
(function() {
  const config = ${config};
  const container = document.getElementById('lfg-form-${formId}');
  if (!container) return;

  // Create Shadow DOM or isolated scope styles
  const style = document.createElement('style');
  style.textContent = \`
    .lfg-badge { position: fixed; bottom: 20px; right: 20px; background: \${config.styling.primaryColor}; color: white; width: 60px; height: 60px; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 9999; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .lfg-badge:hover { transform: scale(1.1); }
    .lfg-badge svg { width: 32px; height: 32px; fill: white; display: flex; align-items: center; justify-content: center; }
    
    .lfg-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 9998; opacity: 0; visibility: hidden; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
    .lfg-modal-overlay.open { opacity: 1; visibility: visible; }
    
    .lfg-form-card { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: \${config.styling.theme === 'dark' ? '#1e293b' : '#ffffff'}; border-radius: 20px; padding: 32px; width: 90%; max-width: 450px; position: relative; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 20px 60px -12px rgba(0,0,0,0.15); color: \${config.styling.theme === 'dark' ? '#f8fafc' : '#000000'}; max-height: 90vh; overflow-y: auto; text-align: left; }
    .lfg-modal-overlay.open .lfg-form-card { transform: translateY(0); }
    
    .lfg-close { position: absolute; top: 16px; right: 16px; cursor: pointer; opacity: 0.5; padding: 4px; font-size: 20px; line-height: 1; }
    .lfg-close:hover { opacity: 1; }

    .lfg-form-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .lfg-form-desc { font-size: 14px; opacity: 0.7; margin-bottom: 24px; }
    .lfg-field { margin-bottom: 16px; text-align: left; }
    .lfg-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .lfg-input { width: 100%; background: \${config.styling.theme === 'dark' ? '#334155' : '#f1f5f9'}; border: 1px solid transparent; border-radius: 10px; padding: 12px 16px; font-size: 14px; color: inherit; transition: all 0.2s; box-sizing: border-box; }
    .lfg-input:focus { outline: none; border-color: \${config.styling.primaryColor}; box-shadow: 0 0 0 3px \${config.styling.primaryColor}20; }
    .lfg-submit { width: 100%; background: \${config.styling.primaryColor}; color: white; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
    .lfg-submit:hover { opacity: 0.9; }
  \`;
  document.head.appendChild(style);

  // Floating Badge
  const badge = document.createElement('div');
  badge.className = 'lfg-badge';
  badge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M11.07,12.85c0.77-1.39,2.25-2.21,3.11-3.44c0.91-1.29,0.4-3.7-2.18-3.7c-1.69,0-2.52,1.28-2.87,2.34L6.54,6.96 C7.25,4.83,9.18,3,12.19,3c4.1,0,6.21,3.12,4.84,6.03l-0.01,0.01c-0.6,1.28-2.1,2.42-2.98,3.41c-0.84,0.93-0.92,1.65-1.02,2.55 h-3C11.02,14.28,11.07,13.62,11.07,12.85z M13.84,19.33c0,1.29-1.05,2.34-2.34,2.34s-2.34-1.05-2.34-2.34s1.05-2.34,2.34-2.34 S13.84,18.04,13.84,19.33z"/></svg>';
  container.appendChild(badge);

  // Modal Structure
  const overlay = document.createElement('div');
  overlay.className = 'lfg-modal-overlay';
  
  let fieldsHtml = '';
  config.fields.forEach(field => {
    fieldsHtml += \`
      <div class="lfg-field">
        <label class="lfg-label">\${field.label}\${field.required ? '*' : ''}</label>
        \${field.type === 'textarea' 
          ? '<textarea name="'+field.name+'" class="lfg-input" rows="3" required></textarea>'
          : '<input type="'+field.type+'" name="'+field.name+'" class="lfg-input" ' + (field.required ? 'required' : '') + ' />'
        }
      </div>
    \`;
  });

  overlay.innerHTML = \`
    <div class="lfg-form-card">
      <div class="lfg-close">&times;</div>
      <div id="lfg-body-${formId}">
        <div class="lfg-form-title">Contact Us</div>
        <div class="lfg-form-desc">Share your details and we\\'ll get in touch!</div>
        <form id="lfg-form-el-${formId}">
          \${fieldsHtml}
          <button type="submit" class="lfg-submit" id="lfg-btn-${formId}">\${config.styling.buttonText || 'Submit'}</button>
        </form>
        <div style="text-align: center; font-size: 10px; opacity: 0.4; margin-top: 16px;">Powered by LeadForGrow</div>
      </div>
    </div>
  \`;
  document.body.appendChild(overlay);

  // Interaction Logic
  const closeBtn = overlay.querySelector('.lfg-close');
  
  badge.addEventListener('click', () => {
    overlay.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('open');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  // Submission Logic
  const form = document.getElementById('lfg-form-el-${formId}');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('lfg-btn-${formId}');
    btn.disabled = true;
    btn.innerText = 'Sending...';

    const data = { token: config.token };
    new FormData(form).forEach((value, key) => data[key] = value);

    try {
      const resp = await fetch('${baseUrl}/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await resp.json();
      if (res.success) {
        document.getElementById('lfg-body-${formId}').innerHTML = '<div style="text-align:center;padding:40px 0;"><h3>✅ Success!</h3><p style="margin-top:10px;">' + (config.successMessage || 'Sent successfully!') + '</p></div>';
        setTimeout(() => {
           overlay.classList.remove('open');
           // Reset form logic if needed, or keep success message
        }, 3000);
      } else {
        alert(res.error || 'Failed to send');
        btn.disabled = false;
        btn.innerText = config.styling.buttonText || 'Submit';
      }
    } catch (e) {
      alert('Error connecting to server');
      btn.disabled = false;
      btn.innerText = config.styling.buttonText || 'Submit';
    }
  });
})();`;

    this.embedCode = `<!-- LeadForGrow Widget -->
<div id="lfg-form-${formId}"></div>
<script>${scriptContent}<\/script>`;
  }
});

// Method to increment submission count
FormSchema.methods.recordSubmission = async function() {
  this.submissionCount += 1;
  this.lastSubmissionAt = new Date();
  await this.save();
};

export default mongoose.models.Form || mongoose.model('Form', FormSchema);
