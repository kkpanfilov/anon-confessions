import path from "path";
import { fileURLToPath } from "url";

import { configDotenv } from "dotenv";

import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

import pkg from "webpack";
const { DefinePlugin } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();

const mode = process.env.NODE_ENV;
const isDev = mode === "development";

const plugins = [
    new DefinePlugin({
        "process.env": JSON.stringify(process.env),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        template: "index.html",
        minify: {
            collapseWhitespace: !isDev,
            removeComments: !isDev,
        },
    }),
    new MiniCssExtractPlugin({
        filename: isDev ? "[name].css" : "[name].[contenthash].css",
        chunkFilename: isDev ? "[id].css" : "[id].[contenthash].css",
    }),
];

export default {
    context: path.resolve(__dirname, "src"),
    mode,
    entry: "./index.js",
    output: {
        filename: isDev ? "[name].js" : "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: "public/[name].[contenthash][ext][query]",
    },
    resolve: {
        extensions: [".js"],
        alias: {
            "@": path.resolve(__dirname, "src/"),
        },
    },
    devtool: isDev ? "source-map" : false,
    devServer: {
        port: 4567,
        hot: true,
        static: {
            directory: path.join(__dirname, "public"),
        },
        historyApiFallback: true,
    },
    optimization: {
        minimize: !isDev,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    plugins,
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.js$/i,
                exclude: "/node_modules/",
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
            {
                test: /\.module\.s[ac]ss$/i,
                use: [
                    isDev ? "style-loader" : MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            modules: {
                                localIdentName: "[local]_[hash:base64:7]",
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /^((?!\.module).)*s[ac]ss$/i,
                use: [
                    isDev ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
};
