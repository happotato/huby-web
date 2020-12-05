const Path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  name: "release",
  mode: "production",
  output: {
    path: Path.resolve(__dirname, "dist"),
    filename: 'main.[chunkhash].js'
  },
  optimization: {
    usedExports: true
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: {
      ['~']: Path.resolve(__dirname, "src")
    }
  },
  module: {
    rules: [
      {
        test: /\.(s*)css$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: "ts-loader",
          }
        ]
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new Dotenv({
      path: ".production.env"
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/react/umd/react.production.min.js",
          to: "./modules/react.js"
        },
        {
          from: "./node_modules/react-dom/umd/react-dom.production.min.js",
          to: "./modules/react-dom.js"
        },
        {
          from: "./assets/",
          to: "./assets/"
        },
      ]
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
    }),
  ]
};
