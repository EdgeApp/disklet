import packageJson from '../package.json'
import config from '../rollup.config.js'

export default {
  external: [
    'fs',
    'path',
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.devDependencies),
    '@babel/runtime/regenerator'
  ],
  input: 'test/index.js',
  output: [{ file: 'build/tests.js', format: 'cjs', sourcemap: true }],
  plugins: [...config[0].plugins]
}
