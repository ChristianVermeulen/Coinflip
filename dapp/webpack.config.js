var webpack = require('webpack'),
  path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist/js'),
  },
  module: {
      rules: [
        // babel loader, testing for files that have a .js extension
        // (except for files in our node_modules folder!).
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            "style-loader",
            "css-loader",
            "sass-loader",
          ],
        }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
  ]
};
