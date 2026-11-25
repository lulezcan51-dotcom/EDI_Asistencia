export const MAX_TITLE_BYTES = 200;
export const MAX_DESCRIPTION_BYTES = 10000;

/** Tamaño real en UTF-8: una tilde o un emoji ocupa más de un carácter. */
export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

export function isValidTaskTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && byteLength(trimmed) <= MAX_TITLE_BYTES;
}

export function isValidTaskDescription(description: string): boolean {
  return byteLength(description.trim()) <= MAX_DESCRIPTION_BYTES;
}
