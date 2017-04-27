/**
 * Interprets a path as a series of folder lookups,
 * handling special components like `.` and `..`.
 */
function followPath (folder, parts) {
  let i = 0 // Read index
  let j = 0 // Write index

  // Shift down good elements, dropping bad ones:
  while (i < parts.length) {
    const part = parts[i++]
    if (part === '..') j--
    else if (part !== '.' && part !== '') parts[j++] = part

    if (j < 0) throw new Error('Path would escape folder')
  }

  // Navigate the folder:
  for (i = 0; i < j; ++i) {
    folder = folder.folder(parts[i])
  }
  return folder
}

/**
 * Navigates down to the file indicated by the path.
 */
export function locateFile (folder, path) {
  const parts = path.split('/')
  const filename = parts.pop()
  return followPath(folder, parts).file(filename)
}

/**
 * Navigates down to the sub-folder indicated by the path.
 */
export function locateFolder (folder, path) {
  const parts = path.split('/')
  return followPath(folder, parts)
}

/**
 * Applies an async function to all the files in a folder.
 */
export function mapFiles (folder, f) {
  return folder
    .listFiles()
    .then(names =>
      Promise.all(names.map(name => f(folder.file(name), name, folder)))
    )
}

/**
 * Applies an async function to all the sub-folders in a folder.
 */
export function mapFolders (folder, f) {
  return folder
    .listFolders()
    .then(names =>
      Promise.all(names.map(name => f(folder.folder(name), name, folder)))
    )
}

/**
 * Recursively applies an async function to all the files in a folder tree.
 * The file names and expanded into paths, and the result is a flat array.
 * The result order is nondeterministic, since everything runs in parallel.
 */
export function mapAllFiles (folder, f) {
  function recurse (folder, prefix, f) {
    return Promise.all([
      mapFiles(folder, (file, name) => f(file, prefix + name, folder)),
      mapFolders(folder, (folder, name) =>
        recurse(folder, prefix + name + '/', f)
      )
    ]).then(([files, folders]) => files.concat(...folders))
  }

  return recurse(folder, '', f)
}
