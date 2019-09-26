// @flow

export type ArrayLike<T> =
  | $ReadOnlyArray<T>
  | {
      +length: number,
      +[n: number]: T
    }

export type DiskletListing = { [path: string]: 'file' | 'folder' }

export type Disklet = {
  // Like `rm -r path`:
  delete(path: string): Promise<mixed>,

  // Like `cat path`:
  getData(path: string): Promise<Uint8Array>,
  getText(path: string): Promise<string>,

  // Like `ls -l path`:
  list(path?: string): Promise<DiskletListing>,

  // Like `mkdir -p $(dirname path); echo data > path`:
  setData(path: string, data: ArrayLike<number>): Promise<mixed>,
  setText(path: string, text: string): Promise<mixed>
}
