var path = require('path');
var config = {
   entry: {
      index: [path.resolve(__dirname, 'src/js/index.js')]

   },

   output: {
      path: path.resolve(__dirname, 'dist/js'), //打包的路径 不是webpack-dev-server的路径
      publicPath: 'server',
      filename: "[name].js" //[name].[id].[hash].js 加上id和hash可以避免缓存问题 反应较慢
   },
   devServer: {
      inline: true,
      port: 7777
   },

   module: {
      loaders: [{
         test: /\.jsx?$/,
         exclude: /node_modules/,
         loader: 'babel',
         query: {
            presets: ['es2015']
         }
      }]
   }

}

module.exports = config;