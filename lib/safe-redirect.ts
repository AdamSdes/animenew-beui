/** Only same-site paths are allowed as post-login destinations. */
export function safeRedirect(target: string | string[] | undefined | null, fallback = "/") {
  const value = Array.isArray(target) ? target[0] : target;
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
