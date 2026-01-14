# 📧 Multi-Tenant Email System - Implementation Guide

## Overview
LeadForGrow now has a **production-ready, multi-tenant email system** where each business uses their **own verified Hostinger email** to send emails to their customers.

### ✅ Key Features
- **Per-Business Email**: Each business sends from their own Hostinger email
- **Nodemailer + Hostinger SMTP**: Direct SMTP connection (no third-party bridges)
- **Encrypted Passwords**: AES-256-CBC encryption for all SMTP passwords
- **Comprehensive Logging**: Step-by-step logs for debugging
- **Zero Mock/Test Files**: Production-only logic
- **Scalable**: Supports unlimited businesses, each with their own credentials

---

## 🏗️ Architecture

### Database Structure

Each business has email credentials stored in MongoDB:

```javascript
{
  integrationCredentials: {
    email: {
      enabled: true,
      provider: 'smtp',
      host: 'smtp.hostinger.com',
      port: 465,
      username: 'sales@yourbusiness.com',
      password: 'encrypted:iv:encryptedData', // AES-256 encrypted
      fromEmail: 'sales@yourbusiness.com',
      fromName: 'Your Business Name',
      lastVerified: Date
    }
  },
  integrationHealth: {
    email: {
      status: 'healthy' | 'degraded' | 'failing' | 'unknown',
      lastSuccessAt: Date,
      lastError: String
    }
  }
}
```

### File Structure

```
lib/
├── encryption.js          # AES-256 encryption/decryption utilities
├── businessMailer.js      # Nodemailer transporter factory
├── integrations/
│   └── email.js          # Email sending logic with templates
└── leadProcessor.js      # Lead ingestion (triggers emails)

app/api/
├── forms/submit/route.js              # Form submission endpoint
├── business/settings/route.js         # Save email credentials
└── business/settings/test-email/route.js  # Test SMTP connection
```

---

## 🔐 Security

### Password Encryption

All SMTP passwords are encrypted using **AES-256-CBC** before storage:

1. **Encryption Key**: 32-byte key stored in `ENCRYPTION_KEY` environment variable
2. **Format**: `iv:encryptedData` (IV is randomly generated per encryption)
3. **Automatic**: Passwords are encrypted on save, decrypted on use

### Environment Variables

Add to `.env.local`:

```bash
# Encryption Key (32 bytes for AES-256)
ENCRYPTION_KEY=your_64_character_hex_string_here
```

Generate a new key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Implementation Flow

### 1. Business Setup (One-Time)

**UI**: `/automation/settings/integrations`

1. Business owner enters:
   - Hostinger email address
   - Hostinger email password
   - Display name (optional)

2. Click "Test Hostinger Connect"
   - System validates SMTP credentials
   - Sends test email to verify
   - Encrypts and saves credentials

### 2. Form Submission Flow

```
POST /api/forms/submit
  ↓
[FORM] Submission received
[FORM] Business ID: xxx
[FORM] Lead saved to DB
  ↓
Lead Processor (lib/leadProcessor.js)
  ↓
Automation Engine (lib/automationEngine.js)
  ↓
[EMAIL] Fetching business SMTP credentials
[EMAIL] Creating Nodemailer transporter
  ↓
Business Mailer (lib/businessMailer.js)
  - Decrypts password
  - Creates SMTP connection to smtp.hostinger.com:465
  ↓
[EMAIL] Sending email to lead
  ↓
[EMAIL] ✅ Sent successfully (Message ID: xxx)
```

### 3. Logging Example

When a lead is submitted, you'll see:

```
[Email:YourBusiness] ========== EMAIL SEND PROCESS START ==========
[Email:YourBusiness] [FORM] Lead: John Doe (john@example.com)
[Email:YourBusiness] [FORM] Business ID: 507f1f77bcf86cd799439011
[Email:YourBusiness] [EMAIL] Fetching business SMTP credentials
[Email:YourBusiness] [EMAIL]   - Email: sales@yourbusiness.com
[Email:YourBusiness] [EMAIL]   - Display Name: Your Business
[Email:YourBusiness] [EMAIL]   - Host: smtp.hostinger.com
[Email:YourBusiness] [EMAIL]   - Port: 465
[Email:YourBusiness] [EMAIL] Rendering email template...
[Email:YourBusiness] [EMAIL]   - Subject: We received your interest!
[Email:YourBusiness] [EMAIL]   - Content Length: 245 characters
[BusinessMailer:YourBusiness] Creating Nodemailer transporter...
[BusinessMailer:YourBusiness] SMTP Configuration:
[BusinessMailer:YourBusiness]   - Host: smtp.hostinger.com
[BusinessMailer:YourBusiness]   - Port: 465
[BusinessMailer:YourBusiness]   - Secure: true
[BusinessMailer:YourBusiness]   - Username: sales@yourbusiness.com
[BusinessMailer:YourBusiness] Transporter created successfully
[BusinessEmail:YourBusiness] ========== EMAIL SEND START ==========
[BusinessEmail:YourBusiness] Recipient: john@example.com
[BusinessEmail:YourBusiness] Subject: We received your interest!
[BusinessEmail:YourBusiness] Sending email from: Your Business <sales@yourbusiness.com>
[BusinessEmail:YourBusiness] Calling Nodemailer sendMail...
[BusinessEmail:YourBusiness] ✅ EMAIL SENT SUCCESSFULLY
[BusinessEmail:YourBusiness]   - Message ID: <abc123@yourbusiness.com>
[BusinessEmail:YourBusiness]   - Response: 250 Message accepted
[Email:YourBusiness] [EMAIL] ✅ Sent successfully (Message ID: <abc123@yourbusiness.com>)
[Email:YourBusiness] ========== EMAIL SEND PROCESS END ==========
```

---

## 🧪 Testing

### Test SMTP Connection

**Endpoint**: `POST /api/business/settings/test-email`

**Request**:
```json
{
  "emailSettings": {
    "username": "sales@yourbusiness.com",
    "password": "your_password",
    "host": "smtp.hostinger.com",
    "port": 465,
    "fromName": "Your Business"
  },
  "testRecipient": "test@example.com"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Hostinger verified & test email sent successfully!",
  "messageId": "<abc123@yourbusiness.com>"
}
```

**Response** (Failure):
```json
{
  "success": false,
  "error": "AUTHENTICATION FAILED: The server rejected your login..."
}
```

### Manual Test Script

Create `test_business_email.js`:

```javascript
const Business = require('./models/Business');
const { sendBusinessEmail } = require('./lib/businessMailer');
const { dbConnect } = require('./lib/mongodb');

async function testEmail() {
  await dbConnect();
  
  // Find your business
  const business = await Business.findOne({ businessName: 'Your Business' });
  
  // Send test email
  const result = await sendBusinessEmail(business, {
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Hello!</h1><p>This is a test email.</p>',
    text: 'Hello! This is a test email.'
  });
  
  console.log('Result:', result);
}

testEmail();
```

Run:
```bash
node test_business_email.js
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. "AUTHENTICATION FAILED"

**Cause**: Wrong password or SMTP not enabled in Hostinger

**Solution**:
- Log into Hostinger hPanel
- Go to Emails > Business Mail
- Ensure SMTP access is enabled
- Try resetting the email password
- Re-enter credentials in LeadForGrow

#### 2. "CONNECTION TIMEOUT"

**Cause**: Firewall blocking port 465

**Solution**:
- Check if port 465 is open
- Try alternative host: `smtp.titan.email`
- Verify internet connection

#### 3. "Email integration not configured"

**Cause**: Business hasn't set up email credentials

**Solution**:
- Go to `/automation/settings/integrations`
- Enable Hostinger Business Mail
- Enter credentials and test

#### 4. Passwords not encrypting

**Cause**: Missing `ENCRYPTION_KEY` in environment

**Solution**:
```bash
# Generate key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
ENCRYPTION_KEY=your_generated_key_here
```

---

## 📊 Monitoring

### Check Integration Health

```javascript
const business = await Business.findById(businessId);
console.log(business.integrationHealth.email);
// {
//   status: 'healthy',
//   lastSuccessAt: 2026-01-15T03:00:00.000Z,
//   lastError: null
// }
```

### View Email Logs

All email operations are logged with prefixes:
- `[Email:BusinessName]` - Email integration layer
- `[BusinessMailer:BusinessName]` - Transporter creation
- `[BusinessEmail:BusinessName]` - Email sending
- `[TestEmail]` - Test email endpoint

Search logs:
```bash
# In development
npm run dev | grep "\[Email:"

# In production (Vercel)
Check function logs in Vercel dashboard
```

---

## 🎯 Best Practices

### For Businesses

1. **Use Professional Email**: `sales@`, `info@`, `support@`
2. **Verify Domain**: Ensure domain is verified in Hostinger
3. **Test Regularly**: Use "Test Hostinger Connect" button monthly
4. **Monitor Health**: Check integration health status

### For Developers

1. **Never Log Passwords**: Passwords are never logged (encrypted only)
2. **Handle Errors Gracefully**: All email failures are caught and logged
3. **Use Comprehensive Logs**: Every step is logged for debugging
4. **Encrypt Before Save**: Always encrypt passwords before storage
5. **Verify Before Send**: Always verify SMTP before sending

---

## 🔄 Migration Guide

### Migrating Existing Businesses

If you have businesses using the old Resend system:

```javascript
// Migration script
const businesses = await Business.find({ 'integrationCredentials.email.enabled': true });

for (const business of businesses) {
  const email = business.integrationCredentials.email;
  
  // If password is not encrypted, encrypt it
  if (email.password && !isEncrypted(email.password)) {
    email.password = encrypt(email.password);
    await business.save();
    console.log(`Encrypted password for ${business.businessName}`);
  }
}
```

---

## 📈 Scalability

### Current Capacity

- **Businesses**: Unlimited
- **Emails per Business**: Limited by Hostinger plan
- **Concurrent Sends**: No limit (each business has own transporter)

### Performance

- **Email Send Time**: ~1-3 seconds
- **SMTP Verification**: ~2-5 seconds
- **Encryption/Decryption**: <1ms

### Optimization Tips

1. **Connection Pooling**: Currently disabled for security (can enable if needed)
2. **Caching**: Consider caching decrypted passwords (with TTL)
3. **Queue System**: For high-volume, implement email queue (Bull/BullMQ)

---

## ✅ Checklist for New Business

- [ ] Business has Hostinger email account
- [ ] SMTP access enabled in Hostinger
- [ ] Credentials entered in LeadForGrow
- [ ] "Test Hostinger Connect" successful
- [ ] Test lead submitted and email received
- [ ] Integration health status is "healthy"

---

## 🆘 Support

### Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `EAUTH` | Authentication failed | Check password, enable SMTP |
| `ETIMEDOUT` | Connection timeout | Check firewall, internet |
| `ECONNECTION` | Cannot connect | Verify host/port |
| `EENVELOPE` | Invalid email address | Check from/to addresses |

### Getting Help

1. Check logs for detailed error messages
2. Verify integration health status
3. Test SMTP connection manually
4. Check Hostinger email settings

---

## 📝 Summary

✅ **What We Built**:
- Multi-tenant email system
- Per-business Hostinger SMTP
- Encrypted password storage
- Comprehensive logging
- Production-ready code

✅ **What We Avoided**:
- Shared sender emails
- Test/mock SMTP
- Hardcoded credentials
- Plaintext passwords
- Third-party email bridges (Resend removed)

✅ **Result**:
- 10 businesses = 10 independent email systems
- Each business sends from their own email
- Fully auditable with detailed logs
- Secure and scalable

---

**Last Updated**: 2026-01-15  
**Version**: 1.0.0  
**Status**: Production Ready ✅
