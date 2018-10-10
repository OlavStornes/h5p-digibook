var path = require('path');
var nodeEnv = process.env.NODE_ENV || 'development';
var isDev = (nodeEnv !== 'production');

var config = {
  entry: {
    dist: './src/entries/dist.js'
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
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'),
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        include: path.resolve(__dirname, 'src/fonts'),
        use: 'file-loader?name=sites/default/files/h5p/development/H5P.DigiBook/src/fonts/[name].[ext]'
        // loader: 'file-loader'
      }
    ]
  }
};

if (isDev) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
