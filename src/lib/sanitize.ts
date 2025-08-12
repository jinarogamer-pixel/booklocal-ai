export function sanitizeInput(str: string): string {
  // Remove script/style tags and trim whitespace
  return str.replace(/<script.*?>.*?<\/script>/gi, "").replace(/<style.*?>.*?<\/style>/gi, "").trim();
}
