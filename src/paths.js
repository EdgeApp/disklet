// @flow

/**
 * Interprets a path as a series of folder lookups,
 * handling special components like `.` and `..`.
 * @param prefix Returned paths look like `a/b/` when true,
 * or `/a/b` otherwise.
 */
export function normalizePath (path: string, prefix?: boolean): string {
  if (/^\//.test(path)) throw new Error('Absolute paths are not supported')
  const parts = path.split('/')

  // Shift down good elements, dropping bad ones:
  let i = 0 // Read index
  let j = 0 // Write index
  while (i < parts.length) {
    const part = parts[i++]
    if (part === '..') j--
    else if (part !== '.' && part !== '') parts[j++] = part

    if (j < 0) throw new Error('Path would escape folder')
  }

  // Array items from 0 to j are the path:
  let out = ''
  for (i = 0; i < j; ++i) out += prefix ? parts[i] + '/' : '/' + parts[i]
  return out
}
