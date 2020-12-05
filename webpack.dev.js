const Path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  name: "dev",
  mode: "development",
  devtool: "source-map",
  watch: false,
  watchOptions: {
    aggregateTimeout: 500,
    ignored: ["node_modules"]
  },
  output: {
    path: Path.resolve(__dirname, "dist"),
    filename: 'main.js'
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
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM"
  },
  plugins: [
    new Dotenv({
      path: ".development.env",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./node_modules/react/umd/react.development.js",
          to: "./modules/react.js"
        },
        {
          from: "./node_modules/react-dom/umd/react-dom.development.js",
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
