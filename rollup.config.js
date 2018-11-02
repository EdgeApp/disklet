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
  ...Object.keys(packageJson.browser),
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies)
]

export default [
  // Normal build:
  {
    external,
    input: 'src/index.js',
    output: [
      { file: packageJson.main, format: 'cjs' },
      { file: packageJson.module, format: 'es' }
    ],
    plugins: [
      alias({
        './nodeFolder.js': 'src/nodeFolder.js',
        './reactNativeFolder.js': 'src/reactNativeDummy.js'
      }),
      babel(babelOpts),
      flowEntry(),
      filesize()
    ],
    sourcemap: true
  },
  // React Native build:
  {
    external,
    input: 'src/index.js',
    output: [{ file: packageJson['react-native'], format: 'cjs' }],
    plugins: [
      alias({
        './nodeFolder.js': 'src/nodeDummy.js',
        './reactNativeFolder.js': 'src/reactNativeFolder.js'
      }),
      babel(babelOpts),
      flowEntry(),
      filesize()
    ],
    sourcemap: true
  }
]
