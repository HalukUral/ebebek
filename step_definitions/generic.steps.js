const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { getTestValue, loginData } = require('../fixtures/login-data');

Given('{string} açılır', async function (pageName) {
  await this.pages.open(pageName);
});

When('müşteri {string} elementinin üzerine gelir', async function (elementName) {
  await this.pages.element(elementName).hover();
});

When('müşteri {string} elementine tıklar', async function (elementName) {
  await this.pages.element(elementName).click({ noWaitAfter: true });
});

When(
  'müşteri {string} elementini {string} test verisiyle doldurur',
  async function (elementName, dataKey) {
    await this.pages.element(elementName).fill(getTestValue(dataKey));
  },
);

Then('{string} görünür olmalıdır', async function (elementName) {
  await expect(this.pages.element(elementName)).toBeVisible();
});

Then('güncel URL {string} içermelidir', async function (urlPart) {
  await expect(this.page).toHaveURL(new RegExp(urlPart));
});

Then('{string} test mesajı görünür olmalıdır', async function (messageKey) {
  const message = loginData.messages[messageKey];
  if (!message) throw new Error(`Test mesajı bulunamadı: ${messageKey}`);
  await this.pages.login.verifyMessage(message);
});
