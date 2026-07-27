const { When, Then } = require('@cucumber/cucumber');
const { getTestValue } = require('../fixtures/login-data');

When(
  'müşteri geçersiz {string} ve {string} ile giriş yapamamalıdır',
  async function (emailValue, passwordValue) {
    await this.pages.login.attemptLogin(
      getTestValue(emailValue),
      getTestValue(passwordValue),
    );
  },
);

When('müşteri geçerli kullanıcı bilgileriyle giriş yapar', async function () {
  await this.pages.login.login(
    getTestValue('geçerliEposta'),
    getTestValue('geçerliSifre'),
  );
});

Then('müşterinin giriş yaptığı doğrulanmalıdır', async function () {
  await this.pages.login.verifyLogin();
});

When('müşteri hesabından çıkış yapar', async function () {
  this.scenarioState.protectedAccountUrl = await this.pages.login.logout();
});

Then('müşteri oturumunun sonlandığı doğrulanmalıdır', async function () {
  await this.pages.login.verifyLogout(this.scenarioState.protectedAccountUrl);
});
