const path = require('path')

module.exports = {
  entry:  path.resolve(__dirname, './index.js'),
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}