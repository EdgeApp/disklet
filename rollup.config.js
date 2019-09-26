import alias from 'rollup-plugin-alias'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import flowEntry from 'rollup-plugin-flow-entry'

import packageJson from './package.json'

const babelOpts = {
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator'],
        loose: true
      }
    ],
    '@babel/preset-flow'
  ],
  plugins: [
    ['@babel/plugin-transform-for-of', { assumeArray: true }],
    '@babel/plugin-transform-object-assign'
  ]
}

const external = [
  'fs',
  'path',
  'react-native',
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies)
]

export default [
  // Normal build:
  {
    external,
    input: 'src/index.js',
    output: [
      { file: packageJson.main, format: 'cjs', sourcemap: true },
      { file: packageJson.module, format: 'es', sourcemap: true }
    ],
    plugins: [
      alias({
        entries: [
          { find: './react-native.js', replacement: 'src/backends/dummy.js' }
        ]
      }),
      babel(babelOpts),
      flowEntry(),
      filesize()
    ]
  },
  // Browser build:
  {
    external,
    input: 'src/index.js',
    output: [{ file: packageJson.browser, format: 'cjs', sourcemap: true }],
    plugins: [
      alias({
        entries: [
          { find: './node.js', replacement: 'src/backends/dummy.js' },
          { find: './react-native.js', replacement: 'src/backends/dummy.js' }
        ]
      }),
      babel(babelOpts),
      flowEntry(),
      filesize()
    ]
  },
  // React Native build:
  {
    external,
    input: 'src/index.js',
    output: [
      { file: packageJson['react-native'], format: 'cjs', sourcemap: true }
    ],
    plugins: [
      alias({
        entries: [{ find: './node.js', replacement: 'src/backends/dummy.js' }]
      }),
      babel(babelOpts),
      flowEntry(),
      filesize()
    ]
  }
]
