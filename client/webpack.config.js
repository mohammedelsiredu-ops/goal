{
  "name": "nicotine-client",
  "version": "2.0.0",
  "description": "Nicotine Client - Frontend Application",
  "private": true,
  "scripts": {
    "start": "webpack serve --mode development --open",
    "build": "webpack --mode production",
    "serve": "http-server dist -p 3001"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "chart.js": "^4.4.1",
    "date-fns": "^3.0.6",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  },
  "devDependencies": {
    "css-loader": "^6.8.1",
    "html-webpack-plugin": "^5.6.0",
    "http-server": "^14.1.1",
    "style-loader": "^3.3.3",
    "webpack-dev-server": "^4.15.1"
  }
}const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
   //   favicon: './public/images/favicon.ico'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3001,
    hot: true,
    historyApiFallback: true
  }
};
