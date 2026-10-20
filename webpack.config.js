const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 👉 importa plugin federato
const moduleFederationPlugin = require("./webpack.mf.js");
const defineEnvPlugin = new webpack.DefinePlugin({
  "process.env.__APP_VERSION__": JSON.stringify(process.env.REACT_APP_VERSION),

  "process.env.PUBLIC_URL": JSON.stringify(process.env.PUBLIC_URL),
  "process.env.REACT_APP_VERSION": JSON.stringify(
    process.env.REACT_APP_VERSION
  ),
  "process.env.SSW_ROOT": JSON.stringify(process.env.SSW_ROOT),
  "process.env.REACT_APP_MOCK_DATA": JSON.stringify(
    process.env.REACT_APP_MOCK_DATA
  )
});
module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  const isDev = mode === "development";
  console.log("Running in mode:", mode); // debug
  return {
    entry: path.resolve(__dirname, "src", "index.tsx"),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "index.bundle.js", //`index.[contenthash].bundle.js?v=${process.env.REACT_APP_VERSION}`,
      publicPath: isDev ? "/" : "auto",
      clean: true,
      // chunkFormat: false,
      uniqueName: "item-manager-light",
      chunkFilename: "[name].bundle.js" //"[name].[contenthash].bundle.js" // 🔧 aggiungi questa linea
    },

    mode: mode,
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /(node_modules)/,
          use: {
            loader: "swc-loader",
            options: {
              parseMap: true
            }
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|mp3|wav)$/,
          type: "asset"
        },

        // {
        //   test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|mp3|wav)(\?[a-z0-9=.]+)?$/,
        //   use: "url-loader?limit=3000000",
        // },

        // {
        //   test: /\.svg$/i,

        //   oneOf: [
        //     {
        //       issuer: /\.[jt]sx?$/, // se importato da TS/JS/JSX
        //       use: ["@svgr/webpack"],
        //     },
        //     {
        //       type: "asset/resource", // se usato altrove (CSS, url())
        //       generator: {
        //         filename: "assets/[name][ext]",
        //       },
        //     },
        //   ],
        // },
        {
          test: /\.svg$/,
          include: path.resolve(__dirname, "src/assets/flags"),
          use: [
            {
              loader: "@svgr/webpack",
              options: { svgo: false } // ❌ disattiva SVGO
            }
          ]
        }

        // {
        //   test: /\.svg$/,
        //   include: path.resolve(__dirname, "src/assets/flags"),
        //   use: [
        //     {
        //       loader: "@svgr/webpack",
        //       options: {
        //         icon: true,
        //       },
        //     },
        //   ],
        // },
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      alias: {
        "@assets": path.resolve(__dirname, "src/assets"),
        "react-redux": require.resolve("react-redux"),
        react: path.resolve("./node_modules/react"),
        "@": path.resolve(__dirname, "src"), // 👈 alias per la cartella src/
        "@testUtils": path.resolve(__dirname, "testUtils"), // 👈 aggiungi questo
        "@mocks": path.resolve(__dirname, "mocks") // 👈 aggiungi questo
      }
    },
    // externals: {
    //   "ssw-navigation": "ssw_navigation",
    // },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        inject: true,
        templateParameters: {
          version: process.env.REACT_APP_VERSION || Date.now()
        }
      }),

      defineEnvPlugin,
      // new webpack.optimize.LimitChunkCountPlugin({
      //   maxChunks: 1
      // }),
      moduleFederationPlugin
    ],
    optimization: {
      minimize: mode === "production"
    },
    devServer: {
      static: [
        {
          directory: path.join(__dirname, "src")
        },
        {
          directory: path.join(__dirname, "mocks"), // 👈 aggiungi questa riga
          publicPath: "/mocks" // opzionale ma consigliato
        }
      ],
      compress: true,
      historyApiFallback: true
      // proxy: [
      //   {
      //     context: ["/idealo"],
      //     target: "https://www.idealo.de",
      //     changeOrigin: true,
      //     secure: true,
      //     pathRewrite: {
      //       "^/idealo": ""
      //     }
      //   }
      // ]
    }
  };
};
