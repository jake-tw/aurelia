/**
 * 截斷字串
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 移除多餘空白
 */
export function normalizeWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * 轉換為 kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 轉換為 camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

/**
 * 遮罩敏感資訊
 */
export function maskSensitive(str: string, visibleChars = 4): string {
  if (str.length <= visibleChars) return '*'.repeat(str.length);
  return str.slice(0, visibleChars) + '*'.repeat(str.length - visibleChars);
}
