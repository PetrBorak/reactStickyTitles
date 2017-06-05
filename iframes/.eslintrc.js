module.exports = {
  extends: [
    'eslint-config-dcg/es6'
  ].map(require.resolve),
  rules: {},
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  }
};
