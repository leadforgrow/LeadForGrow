/**
 * Password policy — single source of truth for what a "strong enough"
 * password looks like across the app. Used server-side to reject weak
 * passwords at /api/auth/register and /api/auth/reset-password, and
 * client-side to power the live strength meter + requirements checklist.
 *
 * Design notes:
 *   - 12 char minimum. NIST SP 800-63B allows 8, but 12 is the modern
 *     baseline that resists offline brute-force against a bcrypt hash for
 *     the lifetime of an average business SaaS engagement.
 *   - Three of four character classes required (upper, lower, digit,
 *     symbol). Requiring all four raises abandonment sharply for little
 *     real security gain vs. length; three is the common enterprise middle
 *     ground.
 *   - Common-password list is a small hand-curated set of the passwords
 *     that actually show up in every leak. Not a full breach-database
 *     check (that needs an outbound API call to Have-I-Been-Pwned) — a
 *     good follow-up when we're ready to pay the latency + dependency.
 *   - Never trust the client. Every endpoint that accepts a password must
 *     re-run this validator before hashing.
 */

export const PASSWORD_POLICY = {
  minLength: 12,
  recommendedLength: 16,
  maxLength: 128, // bcrypt truncates at 72; anything past 128 is nonsense
  requiredClasses: 3, // of 4 (upper, lower, digit, symbol)
};

// Top passwords from HIBP breach corpora — the specific strings that make up
// the vast majority of guessed-successfully attempts. Curated (not scraped)
// so we can stay honest about what's here and not blow up the bundle.
const COMMON_PASSWORDS = new Set([
  '123456', '12345678', '123456789', '1234567890', '12345', '1234567', '111111',
  'password', 'password1', 'password123', 'passw0rd', 'admin', 'admin123',
  'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'letmein', 'welcome', 'welcome1', 'monkey', 'dragon', 'iloveyou', 'sunshine',
  'princess', 'football', 'baseball', 'starwars', 'master', 'trustno1',
  'abc123', 'abcd1234', 'abcdef', 'test123', 'test1234', 'temp1234',
  '000000', '11111111', '00000000', 'aaaaaa', 'aaaaaaaa',
  'leadforgrow', 'leadforgrow123', 'india123', 'mumbai123',
]);

const RX_UPPER = /[A-Z]/;
const RX_LOWER = /[a-z]/;
const RX_DIGIT = /[0-9]/;
const RX_SYMBOL = /[^A-Za-z0-9]/;

/**
 * Evaluate a password. Returns:
 *   {
 *     ok:       true if the password meets ALL required rules,
 *     strength: 'weak' | 'fair' | 'strong' | 'excellent' (informational),
 *     score:    0..4 (informational, drives the meter fill),
 *     failures: [{ rule, message }] — rules that failed (empty when ok),
 *     checks:   { minLength, classesMet, notCommon, notTrivialRepeat } — for the checklist UI
 *   }
 *
 * `context` lets callers pass user-identifying strings (email, business name)
 * so we can block "Password contains your email prefix" attempts without
 * making the caller assemble those themselves.
 */
export function evaluatePassword(password, context = {}) {
  const pw = String(password || '');
  const lower = pw.toLowerCase();
  const { email, name } = context;

  const classesMet = [RX_UPPER, RX_LOWER, RX_DIGIT, RX_SYMBOL].filter((rx) => rx.test(pw)).length;

  const checks = {
    minLength: pw.length >= PASSWORD_POLICY.minLength,
    maxLength: pw.length <= PASSWORD_POLICY.maxLength,
    classesMet: classesMet >= PASSWORD_POLICY.requiredClasses,
    notCommon: !COMMON_PASSWORDS.has(lower),
    notTrivialRepeat: !/^(.)\1+$/.test(pw) && !/^(?:0123456789|1234567890|abcdefghij|qwertyuiop)/.test(lower),
    notContainingIdentity: (() => {
      if (!pw) return false;
      const prefix = String(email || '').split('@')[0]?.toLowerCase();
      if (prefix && prefix.length >= 4 && lower.includes(prefix)) return false;
      const nm = String(name || '').toLowerCase().replace(/\s+/g, '');
      if (nm && nm.length >= 4 && lower.includes(nm)) return false;
      return true;
    })(),
  };

  const failures = [];
  if (!checks.minLength) {
    failures.push({ rule: 'minLength', message: `At least ${PASSWORD_POLICY.minLength} characters.` });
  }
  if (!checks.maxLength) {
    failures.push({ rule: 'maxLength', message: `At most ${PASSWORD_POLICY.maxLength} characters.` });
  }
  if (!checks.classesMet) {
    failures.push({
      rule: 'classesMet',
      message: `Include at least ${PASSWORD_POLICY.requiredClasses} of: uppercase, lowercase, number, symbol.`,
    });
  }
  if (!checks.notCommon) {
    failures.push({ rule: 'notCommon', message: 'That password appears in known breach lists. Pick something less common.' });
  }
  if (!checks.notTrivialRepeat) {
    failures.push({ rule: 'notTrivialRepeat', message: 'Avoid trivial patterns like aaaaaa or 123456789.' });
  }
  if (!checks.notContainingIdentity) {
    failures.push({ rule: 'notContainingIdentity', message: 'Password should not contain your email or name.' });
  }

  // Score is informational — even ok:true passwords get a "fair vs strong"
  // read so we can encourage stronger ones without blocking submission.
  let score = 0;
  if (pw.length >= PASSWORD_POLICY.minLength) score++;
  if (pw.length >= PASSWORD_POLICY.recommendedLength) score++;
  if (classesMet >= 3) score++;
  if (classesMet === 4) score++;
  const strength = score <= 1 ? 'weak' : score === 2 ? 'fair' : score === 3 ? 'strong' : 'excellent';

  return {
    ok: failures.length === 0,
    strength,
    score,
    failures,
    checks,
  };
}

export function passwordPolicyDescription() {
  return `Passwords must be at least ${PASSWORD_POLICY.minLength} characters and mix any ${PASSWORD_POLICY.requiredClasses} of: uppercase, lowercase, number, symbol. We block common breach-list passwords too.`;
}
