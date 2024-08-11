module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": ["error", {
      "semi": true,
      "singleQuote": true
    }]
  }
};
