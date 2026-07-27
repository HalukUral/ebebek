class BasePage {
  constructor(page) {
    this.page = page;
    this.elements = {};
  }

  element(name) {
    const locator = this.elements[name];
    if (!locator) {
      throw new Error(`${this.constructor.name} içinde "${name}" elementi tanımlı değil.`);
    }
    return locator;
  }

  async openHome() {
    const appReady = this.page.waitForResponse(
      (response) =>
        response.url().includes('/version-info') && response.status() === 200,
      { timeout: 30_000 },
    );
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await appReady;
  }
}

module.exports = { BasePage };
