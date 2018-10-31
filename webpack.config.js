var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');

var config = {
  entry: {
    dist: './src/entries/digibook.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader'
      },
      {
        test:/\.scss$/,
        include: path.resolve(__dirname, 'src/styles'),
        use:['style-loader','css-loader', 'sass-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'url-loader?limit=100000'
      }
    ]
  }
};

if (isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
