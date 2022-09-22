const path = require('path');

module.exports = {
  watch: true,
  mode: 'production',
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'fhirBrowser.js',
    clean: true
  }
};