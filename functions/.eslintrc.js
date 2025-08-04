module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  extends: ["google"],
  rules: {
    "quotes": ["error", "double"],
    "max-len": ["error", {"code": 100}],
    "comma-dangle": ["error", "never"],
    "no-unused-vars": ["warn"],
    "no-multi-spaces": ["error"]
  }
};
