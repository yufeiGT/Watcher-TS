const path = require('path');
const { merge } = require('webpack-merge');
const dev = require('./webpack.dev.js');

module.exports = merge(dev, {
	output: {
		filename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, 'demo'),
	},
});
