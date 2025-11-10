// No-op replacement for postcss-minify-gradients to avoid Tailwind v4 bug
module.exports = () => {
  return {
    postcssPlugin: 'postcss-minify-gradients-noop',
    Once() {
      // Do nothing - skip gradient minification
    }
  }
}
module.exports.postcss = true
