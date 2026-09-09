/**
 * FieldPress Pre-Flight Newsroom Audit Engine
 * Evaluates dispatches for commercial classified pollution and sensitive data leaks.
 */

export interface AuditResult {
  isClassified: boolean;
  classifiedMatches: string[];
  hasSensitiveData: boolean;
  sensitiveTypes: string[];
  recommendation?: string;
}

const CLASSIFIED_KEYWORDS = [
  'for sale', 'selling', 'wts', 'wtb', 'price:', 'obo',
  'will trade', 'trade for', 'looking to buy', 'condition: like new',
  'free to good home', 'room for rent', 'desk for rent', 'hiring fixer',
  'help wanted:', 'shipping available', 'paypal only', 'venmo only',
];

const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
const API_TOKEN_REGEX = /(?:ghp_[a-zA-Z0-9]{36}|sk_live_[a-zA-Z0-9]{24}|bearer\s+[a-zA-Z0-9_.-]{20,})/gi;

export function scanPressieDraft(title: string, note?: string): AuditResult {
  const fullText = `${title} ${note || ''}`.toLowerCase();

  // 1. Check Commercial Classified Intent
  const classifiedMatches = CLASSIFIED_KEYWORDS.filter((kw) => fullText.includes(kw));
  // Price dollar matching (e.g. $50, $200)
  if (/\$\d+/.test(fullText)) {
    classifiedMatches.push('price tag ($)');
  }

  // 2. Check Sensitive Data Leaks
  const sensitiveTypes: string[] = [];
  if (PHONE_REGEX.test(fullText)) sensitiveTypes.push('phone number');
  if (SSN_REGEX.test(fullText)) sensitiveTypes.push('national ID / SSN');
  if (API_TOKEN_REGEX.test(fullText)) sensitiveTypes.push('API credential / secret token');

  return {
    isClassified: classifiedMatches.length > 0,
    classifiedMatches,
    hasSensitiveData: sensitiveTypes.length > 0,
    sensitiveTypes,
  };
}

export function autoRedactSensitiveData(text: string): string {
  return text
    .replace(PHONE_REGEX, '[REDACTED PHONE: ████████]')
    .replace(SSN_REGEX, '[REDACTED ID: ████████]')
    .replace(API_TOKEN_REGEX, '[REDACTED CREDENTIAL: ████████]');
}
