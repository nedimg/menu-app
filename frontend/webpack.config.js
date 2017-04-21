/* global __dirname, require, module */
const path = require('path');;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const parts = require('./webpack/parts');
const pkg = require('./package.json');

const PATHS = {
    app: path.resolve(__dirname, 'src'),
    style: path.join(__dirname, 'less'),
    build: path.resolve(__dirname, './dist'),
};

const common = {
    devtool: 'source-map',
    entry: {
        app: PATHS.app + '/index.js',
        vendor: Object.keys(pkg.dependencies),
     },
    output: {
        path: PATHS.build,
        filename: '[name].js',
        publicPath: '/',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader'],
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css-loader!less-loader'),
            }
        ],
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            title: 'Demo application',
            template: 'src/index.html'
        }),
    ],
};

var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
    case 'build':
        config = merge(
            common,
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.extractBundle({
                name: 'vendor',
            }),
            parts.minify()
        );
        break;
    default:
        config = merge(
        common,
        parts.devServer({
            // Customize host/port here if needed
            host: process.env.HOST,
            port: process.env.PORT || 3000
        })
    );
}

module.exports = config;
