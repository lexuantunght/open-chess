const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { DefinePlugin, ContextReplacementPlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = process.env.NODE_ENV === 'development';

let devPlugins = [];
if (isDev && process.env.PLATFORM === 'web') {
	devPlugins = [
		new CircularDependencyPlugin(),
		new BundleAnalyzerPlugin({ openAnalyzer: false, analyzerPort: 8888 }),
	];
}

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.join(process.cwd(), 'dist'),
		filename: '[name].[contenthash].js',
		clean: true,
	},
	devtool: isDev ? 'source-map' : false,
	mode: process.env.NODE_ENV || 'development',
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		modules: ['src', 'lib', 'node_modules'],
	},
	devServer: {
		historyApiFallback: {
			index: '/index.html',
		},
		port: process.env.PORT || 5173,
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-react',
							'@babel/preset-typescript',
						],
						plugins: ['@babel/plugin-proposal-class-properties'],
					},
				},
			},
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: { noEmit: false },
						},
					},
				],
			},
			{
				test: /\.module\.s(a|c)ss$/,
				use: [
					isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[local]-[hash:base64:5]',
							},
						},
					},
					'sass-loader',
				],
			},
			{
				test: /\.(css|scss|sass)$/,
				use: [
					isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
				exclude: /\.module\.s(a|c)ss$/,
			},
			{
				test: /\.(jpg|jpeg|png|gif|mp3)$/,
				use: ['file-loader'],
			},
			{
				test: /\.svg$/i,
				issuer: /\.[jt]sx?$/,
				use: [{ loader: '@svgr/webpack', options: { icon: true } }],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
		],
	},
	optimization: {
		minimize: !isDev,
		minimizer: [new CssMinimizerPlugin(), new TerserWebpackPlugin({ extractComments: false })],
		removeAvailableModules: true,
		removeEmptyChunks: true,
		mergeDuplicateChunks: true,
		emitOnErrors: false,
		concatenateModules: true,
		splitChunks: {
			chunks: 'all',
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'public/index.html',
			favicon: 'public/favicon.ico',
			filename: 'index.html',
			chunks: 'all',
			inject: true,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
		//new ContextReplacementPlugin(/moment[/\\]locale$/, /vi|en|fr|de|es/),
		new DefinePlugin({
			__DEV__: isDev,
		}),
		...devPlugins,
	],
};
