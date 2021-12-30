import { expect } from 'chai'
import { deepList, Disklet } from 'disklet'

import { expectRejection } from './expectRejection'

export interface DiskletTests {
  [name: string]: (disklet: Disklet) => Promise<void>
}

export const tests: DiskletTests = {
  'Round-trips data': async disklet => {
    const data = [0, 127, 128, 255, Date.now() % 256]
    await disklet.setData('subfolder/file.bin', data)

    expect(Array.from(await disklet.getData('subfolder/file.bin'))).deep.equals(
      data
    )
  },

  'Round-trips text': async disklet => {
    const text = new Date().toISOString()
    await disklet.setText('subfolder/file.txt', text)

    expect(await disklet.getText('subfolder/file.txt')).equals(text)
  },

  'Cannot open missing files': async disklet => {
    await expectRejection(disklet.getData('file.bin'))
    await expectRejection(disklet.getText('file.txt'))
  },

  'Lists missing location': async disklet => {
    expect(await disklet.list('missing.txt')).deep.equals({})
  },

  'Lists file': async disklet => {
    await disklet.setText('file.txt', 'contents')

    expect(await disklet.list('./file.txt')).deep.equals({
      'file.txt': 'file'
    })
  },

  'Lists folder': async disklet => {
    await disklet.setText('file.txt', 'contents')
    await disklet.setText('subfolder/subfile.txt', 'contents')

    expect(await disklet.list('.')).deep.equals({
      'file.txt': 'file',
      subfolder: 'folder'
    })
  },

  'Lists subfolder': async disklet => {
    await disklet.setText('test/file.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    expect(await disklet.list('./test/')).deep.equals({
      'test/file.txt': 'file',
      'test/subfolder': 'folder'
    })
  },

  'Deletes missing location': async disklet => {
    await disklet.delete('file.txt')
    expect(await disklet.list()).deep.equals({})
  },

  'Deletes file': async disklet => {
    await disklet.setText('file.txt', 'contents')
    await disklet.setText('test/keep.txt', 'contents')
    await disklet.setText('test/file.txt', 'contents')

    await disklet.delete('test/file.txt')
    expect(await deepList(disklet)).deep.equals({
      'file.txt': 'file',
      'test/keep.txt': 'file',
      test: 'folder'
    })
    await expectRejection(disklet.getText('test/file.txt'))

    await disklet.delete('./file.txt')
    expect(await deepList(disklet)).deep.equals({
      'test/keep.txt': 'file',
      test: 'folder'
    })
  },

  'Deletes folder': async disklet => {
    await disklet.setText('test/keep.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    await disklet.delete('test/subfolder')
    expect(await disklet.list('test')).deep.equals({
      'test/keep.txt': 'file'
    })
  },

  'Deletes top-level location': async disklet => {
    await disklet.setText('test/file.txt', 'contents')
    await disklet.setText('test/subfolder/file.txt', 'contents')

    await disklet.delete('./')
    expect(await disklet.list()).deep.equals({})
  }
}
