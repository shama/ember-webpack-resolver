const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
    return {
        entry: {
            index: [path.resolve(__dirname, "test/app.js")],
        },
        module: {
            rules: [
                { test: /\.hbs$/, loader: "ember-templates-loader" }
            ]
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                "ember-testing": path.resolve(__dirname, "node_modules/ember-source/dist/ember-testing.js")
            }
        },
        mode: 'development',
        devServer: {
            historyApiFallback: {
                index: '/index.html'
            },
            index: 'index.html'
        },
        node: {
            __filename: true,
            __dirname: true
        },
        plugins: [
            new webpack.ProgressPlugin({ profile: false }),
            new webpack.LoaderOptionsPlugin({
                options: {
                    emberTemplatesLoader: {
                        compiler: require.resolve("ember-source/dist/ember-template-compiler.js")
                    }
                }
            }),
            // Ember 2.10.2 adds a package vertx that doesnt exist nor needs to, so we ignore it
            new webpack.IgnorePlugin(/vertx/),
            new HtmlWebpackPlugin({
                template: "index.html"
            })
        ]
    };
};
