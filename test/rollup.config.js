import packageJson from '../package.json'
import config from '../rollup.config.js'

export default {
  external: [
    ...Object.keys(packageJson.browser),
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.devDependencies),
    '@babel/runtime/regenerator'
  ],
  input: 'test/index.js',
  output: [{ file: 'build/tests.js', format: 'cjs' }],
  plugins: [...config[0].plugins],
  sourcemap: true
}
