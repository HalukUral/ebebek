module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['support/**/*.js', 'step_definitions/**/*.js'],
    format: ['progress', 'summary', 'allure-cucumberjs/reporter'],
    formatOptions: { resultsDir: 'allure-results' },
    parallel: 2,
    retry: 0,
  },
};
