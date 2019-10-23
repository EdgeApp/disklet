import { Disklet, DiskletListing } from '../index'

/**
 * Recursively lists a folder.
 */
export function deepList(
  disklet: Disklet,
  path?: string
): Promise<DiskletListing> {
  return disklet.list(path).then(list =>
    // Recurse into subfolders:
    Promise.all(
      Object.keys(list)
        .filter(path => list[path] === 'folder')
        .map(path => deepList(disklet, path))
    ).then(children => Object.assign(list, ...children))
  )
}
