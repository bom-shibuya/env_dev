'use strict';
/*
    ██╗    ██╗███████╗██████╗ ██████╗  █████╗  ██████╗██╗  ██╗
    ██║    ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║ ██╔╝
    ██║ █╗ ██║█████╗  ██████╔╝██████╔╝███████║██║     █████╔╝ 
    ██║███╗██║██╔══╝  ██╔══██╗██╔═══╝ ██╔══██║██║     ██╔═██╗ 
    ╚███╔███╔╝███████╗██████╔╝██║     ██║  ██║╚██████╗██║  ██╗
    ╚══╝╚══╝ ╚══════╝╚═════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 */

/**
 * Require dependencies.
 */
const webpack = require('webpack');
const Path = require('path');
const DirectoryManager = require('./DirectoryManager.js');


/**
 * Directory settings.
 */
const DIR = DirectoryManager('./');


/**
 * common config
 */
const commonConfig = {
  entry: {
    script: DIR.src_assets + 'js/script.js'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {

    extensions: ['.js'],
    modules: ['node_modules'],
    alias: {
      modernizr$: Path.resolve(__dirname, '.modernizrrc')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.modernizrrc$/,
        loader: 'modernizr-loader'
      }
    ]
  },
  plugins: [
    // jQueryをグローバルに出す
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ]
};

/**
 * for development Config
 */
const devConfig = {
  ...commonConfig,
  mode: 'development'
};

/**
 * for production Config
 */
const prodConfig = {
  ...commonConfig,
  mode: 'production'
};

module.exports = {
  dev: devConfig,
  prod: prodConfig
};
