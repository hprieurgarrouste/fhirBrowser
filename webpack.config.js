const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'fhirBrowser.js',
    clean: false
  },
  devServer: {
    static: '.',
    port: 8080
  }
};