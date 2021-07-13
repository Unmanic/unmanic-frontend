const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssUrlRelativePlugin = require('css-url-relative-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');

const DEVELOPMENT = process.env.NODE_ENV === 'dev';
const config = {
    mode: DEVELOPMENT ? 'development' : 'production',
    devtool: DEVELOPMENT ? 'eval' : 'source-map',
    entry: './src/js/index.js',
    output: {
        filename: 'js/[name].[hash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
                options: {
                    helperDirs: path.join(__dirname, 'src/js/template_helpers'),
                    precompileOptions: {
                        knownHelpersOnly: false,
                    },
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: DEVELOPMENT,
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: '[name].[ext]',
                            fallback: 'file-loader',
                            outputPath: 'public/images',
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65,
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75,
                            },
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new CopyWebpackPlugin([
            {
                from: './src/public',
                to: 'public',
            },
        ]),
        new MiniCssExtractPlugin({
            filename: DEVELOPMENT ? 'css/[name].css' : 'css/[name].[contenthash].css',
            chunkFilename: 'css/[id].css',
        }),
        new webpack.HashedModuleIdsPlugin(),
        new PreloadWebpackPlugin({
            include: 'initial',
        }),
        new CssUrlRelativePlugin(),
    ],
    devServer: {
        historyApiFallback: {
            index: '/index.html'
        },
        compress: true,
        port: 8889,
        proxy: {
            '/api': 'http://localhost:8888',
            '/dashws': {
                target: 'ws://localhost:8888',
                ws: true
            },
        },
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 10,
                    enforce: true,
                },
            },
        },
        minimizer: [],
    },
};

if (!DEVELOPMENT) {
    const TerserPlugin = require('terser-webpack-plugin');
    const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

    config.optimization.minimizer.push(
        new TerserPlugin(),
        new OptimizeCSSAssetsPlugin({})
    );
}

/* Add index template */
config.plugins.push(
    new HtmlWebPackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        favicon: path.resolve(__dirname, './src/public/favicon.ico'),
        minify: !DEVELOPMENT,
    })
);

/* Configure externals */
config.plugins.push(
    new HtmlWebPackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        favicon: path.resolve(__dirname, './src/public/favicon.ico'),
        minify: !DEVELOPMENT,
    })
);

module.exports = config;
