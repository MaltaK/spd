/* eslint-disable */
let { HotModuleReplacementPlugin } = require('webpack');
let MiniCssExtractPlugin = require("mini-css-extract-plugin");
let TerserPlugin = require('terser-webpack-plugin');
let { CleanWebpackPlugin } = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let path = require('path');

let debug = process.env.NODE_ENV !== 'production';
let www = path.resolve(__dirname, 'www');
let dist = path.resolve(__dirname, 'dist');
let assets = path.resolve(__dirname, 'assets');

module.exports = {

	mode: debug ? 'development' : 'production',
    devtool: debug ? 'source-map' : undefined,
    target: 'web',

	entry: ['core-js/stable', 'whatwg-fetch', path.join(www, 'entry.js')],

	output: {
		path: dist,
		filename: 'bundle.js',
		publicPath: '/',
    },

    resolve: {
        alias: {
            www,
            utils: path.resolve(__dirname, 'www/utils'),
            ui: path.resolve(__dirname, 'www/ui'),
            hooks: path.resolve(__dirname, 'www/hooks'),
        }
    },

    optimization: {
        usedExports: true,
        runtimeChunk: false,
        minimize: !debug,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: false,
                terserOptions: {
                    warnings: false,
                    output: {
                      comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },

	plugins: [
        new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new CopyWebpackPlugin([
            { from: assets, to: dist },
        ]),
	].concat(debug ? [
        new HotModuleReplacementPlugin(),
    ] : []),

	module: {
		rules: [
			{
				test: /.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						compact: false,
						presets: [
							'@babel/react',
							['@babel/env',{
								debug: false,
                                useBuiltIns: 'usage',
                                corejs: '3.4',
                            }],
						],
						plugins: [
							['@babel/plugin-transform-runtime', {
                                helpers: false,
								regenerator: true,
                            }],
							'@babel/plugin-proposal-object-rest-spread',
                            '@babel/plugin-proposal-class-properties',
						],
					},
				},
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'singletonStyleTag',
                        }
                    },
                    {
                        loader: "css-loader",
                        options: {
                            modules: false,
                        }
                    }
                ],
                include: [
                    /node_modules/,
                ]
            },
			{
				test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: debug,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                mode: 'local',
                                localIdentName: '[local]-[path][name]',
                            },
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')(),
                            ]
                        },
                    },
                ],
                exclude: [
                    /node_modules/,
                ],
            },
			{
				test: /\.(png|gif)$/,
				use: [
                    {
                        loader: 'url-loader',
                    }
                ],
			},
		],
    },

    devServer: {
        overlay: true,
        contentBase: assets,
        hot: true,
        inline: true,
        watchContentBase: true,
        disableHostCheck: true,
        compress: true,
        host: '0.0.0.0',
        port: 11080,
    },

}