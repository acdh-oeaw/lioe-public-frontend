
const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const {GitRevisionPlugin} = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin({
  lightweightTags: true
})
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const _ = require('lodash')

module.exports = {
  entry: "./src/index.ts",
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "./static"),
        to: "./static",
        ignore: [".*"]
      }
    ], [
      {
        from: path.resolve(__dirname, "./index.html"),
        to: "index.html"
      }
    ], [
      {
        from: path.resolve(__dirname, "./parser-xml"),
        to: "./dist/static/parser-xml"
      }
    ]),
  ],
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "/dist/",
    filename: "build.js"
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        loader: 'arraybuffer-loader',
      },
      {
        test: /\.js$/,
        // Exclude transpiling `node_modules`, except `bootstrap-vue/src`
        exclude: /node_modules\/(?!bootstrap-vue\/src\/)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          preserveWhitespace: false,
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            scss: "vue-style-loader!css-loader!sass-loader",
            sass: "vue-style-loader!css-loader!sass-loader?indentedSyntax"
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.worker\.ts$/,
        use: {
          loader: 'worker-loader',
          options: { inline: true }
        }
      },
      {
        test: /\.css$/,
        loader: "css-loader"
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.svg$/,
        loader: "svg-sprite-loader",
        options: {
          prefixize: true,
          name: "[name]_[hash]"
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "file-loader",
        options: {
          name: "[name].[ext]?[hash]"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".vue", ".json"],
    alias: {
      vue$: "vue/dist/vue.esm.js",
      "@components": path.resolve(__dirname, "src/components/"),
      "@store": path.resolve(__dirname, "src/store/"),
      "@src": path.resolve(__dirname, "src/"),
      styles: path.resolve(__dirname, "src/styles"),
      "@util": path.resolve(__dirname, "src/util/")
    }
  },
  devServer: {
    // hot: true,
    open: 'Google Chrome',
    quiet: false,
    contentBase: "./dist",
    historyApiFallback: true,
    // noInfo: true,
    host: "localhost",
    port: "8080",
    public: "localhost:8080",
    publicPath: "http://localhost:8080/"
  },
  performance: {
    hints: false
  },
  devtool: "#eval-source-map"
};
// process.env.NODE_ENV = 'development'
console.log('process.env.NODE_ENV',process.env.NODE_ENV)
console.log('process.env.API_HOST',process.env.API_HOST)
process.env['VUE_APP_VERSION'] = gitRevisionPlugin.version()
console.log(process.env.VUE_APP_VERSION, 'process.env.VUE_APP_VERSION')
process.env['VUE_APP_COMMIT_HASH'] = gitRevisionPlugin.commithash()
process.env['VUE_APP_BRANCH'] = gitRevisionPlugin.branch()  
if(process.env.NODE_ENV === 'development'){
  require('dotenv').config({ path : './env-dev.env' })
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env' : _(process.env).mapValues((v) => {
        return JSON.stringify(v)
      }).value()
    }),
    new BundleAnalyzerPlugin({
      defaultSizes: 'gzip'
    })
  ])
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  require('dotenv').config({ path: './env-production.env' })
  // http://vue-loader.vuejs.org/en/workflow/production.html
  console.log(process.env.API_HOST, 'process.env.API_HOST')
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': _(process.env).mapValues((v) => {
        return JSON.stringify(v)
      }).value()
    }),
    new UglifyJsPlugin({
      sourceMap: false
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    // new BundleAnalyzerPlugin({

    // })
  ])
}
