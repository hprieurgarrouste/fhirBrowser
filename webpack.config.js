const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    app: './src/fhirBrowser.js'
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'fhirBrowser.js',
    clean: false
  }
};