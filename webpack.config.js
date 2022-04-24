const defaultConfig = require('./node_modules/@wordpress/scripts/config/webpack.config');
const path = require('path');
const { merge } = require('webpack-merge');

module.exports = merge({}, defaultConfig, {
  // enables absolute urls, see https://stackoverflow.com/a/41684002
  // ONLY IN JS FILES, just directly use alias object key to start import
  resolve: {
    alias: {
      assets: path.resolve(process.cwd(), 'assets'),
      src: path.resolve(process.cwd(), 'src'),
      tests: path.resolve(process.cwd(), 'tests'),
    },
  },
  entry: {
    editor: path.resolve(process.cwd(), 'src', 'editor.js'),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        exclude: /node_modules/,
        use: ['url-loader'],
      },
    ],
  },
});
