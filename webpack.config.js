var _ = require('lodash');
var minimist = require('minimist');
var chalk = require('chalk');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var OpenBrowserWebpackPlugin = require('open-browser-webpack-plugin');

var DEFAULT_TARGET = 'BUILD';

var DEFAULT_PARAMS = {
    resolve: {
        extensions: ['', '.ts', '.tsx', '.js']
    },
    entry: {
        main: './client/app/main.tsx'
    },
    output: {
        publicPath: '/',
        filename: '[name].[chunkhash].js',
        sourceMapFilename: '[name].[chunkhash].map'
    },

    module: {
        loaders: [
            {test: /\.tsx?$/, loader: 'react-hot!ts-loader?jsx=true', exclude: /(\.test.ts$|node_modules)/},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.tpl.html/, loader: 'html'},
            {test: /\.(ico|png|jpg|gif|svg|eot|ttf|woff|woff2)(\?.+)?$/, loader: 'url?limit=50000'}
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './client/app/index.html',
            inject: 'body'
        }),
        new webpack.optimize.DedupePlugin()
    ],
    debug: true,
    progress: true,
    colors: true
};

var PARAMS_PER_TARGET = {


    BUILD: {
        output: {
            path: './build'
        },
        devtool: 'source-map',
        plugins: [
            new CleanWebpackPlugin(['build'])
        ]
    },

    DIST: {
        debug: false,
        output: {
            path: './dist'
        },

        eval: 'cheap-source-map',
        plugins: [
            new CleanWebpackPlugin(['dist']),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                },
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    }

};

var target = _resolveBuildTarget(DEFAULT_TARGET);
var params = _.merge(DEFAULT_PARAMS, PARAMS_PER_TARGET[target], _mergeArraysCustomizer);

_printBuildInfo(target, params);

module.exports = params;

function _resolveBuildTarget(defaultTarget) {
    var target = minimist(process.argv.slice(2)).TARGET;
    if (!target) {
        console.log('No build target provided, using default target instead\n\n');
        target = defaultTarget;
    }
    return target;
}

function _printBuildInfo(target, params) {
    console.log('\nStarting ' + chalk.bold.green('"' + target + '"') + ' build');
    if (target === 'DEV') {
        console.log('Dev server: ' + chalk.bold.yellow('http://localhost:' + params.devServer.port) + '\n\n');
    } else {
        console.log('\n\n');
    }
}

function _mergeArraysCustomizer(a, b) {
    if (_.isArray(a)) {
        return a.concat(b);
    }
}