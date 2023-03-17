const path = require('path');
const { merge } = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './example'),
		},
	},
	plugins: [
		new VueLoaderPlugin(),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './example/public/index.html'),
		}),
	],
	entry: {
		app: path.resolve(__dirname, './example/index.ts'),
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './demo'),
	},
	devServer: {
		hot: '0.0.0.0',
	},
});
