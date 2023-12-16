const path = require('path');

module.exports = {
  mode: 'production',
  cache: false,
  entry: {
    app: './src/App.js'
  },
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'fhirBrowser.js',
    clean: false
  },
  devServer: {
    static: {
      directory: __dirname
    },
    compress: true,
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }
      }
    ]
  }
};