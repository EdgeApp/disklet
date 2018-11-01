// @flow

/**
 * Verifies that a name contains no slashes.
 */
export function checkName (name: string) {
  if (typeof name !== 'string' || !name.length || /[/]/.test(name)) {
    throw new Error(`Invalid file name "${name}"`)
  }
}
