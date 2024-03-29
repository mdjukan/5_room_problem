const path = require('path');

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/',
	},
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif)$/i,
				loader: 'file-loader',
				options: {
					outputPath: '/',
					name: '[name].[ext]',
					url: true,
					publicPath: '/',
				}
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	devServer: {
		static: './dist',
		hot: true,
		port: 8080
	},
};

