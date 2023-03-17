const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
	plugins: [new CleanWebpackPlugin()],
	resolve: {
		plugins: [new TsConfigPathsPlugin()],
		extensions: ['.vue', '.ts', 'tsx', '.js'],
		alias: {
			'@~crazy/watcher': path.resolve(__dirname, 'src'),
		},
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				use: 'vue-loader',
			},
			{
				test: /\.m?[tj]s$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env']],
						},
					},
					{
						loader: 'ts-loader',
						options: {
							appendTsSuffixTo: [/\.vue$/],
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.s[ac]ss$/,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
		],
	},
};
