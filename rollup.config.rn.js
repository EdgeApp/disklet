import buble from 'rollup-plugin-buble'
const packageJson = require('./package.json')

export default {
  entry: 'src/indexDiskletRN.js',
  external: [
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.browser)
  ],
  plugins: [buble()],
  targets: [
    {
      dest: packageJson['react-native'],
      format: 'es',
      sourceMap: true
    }
  ]
}
