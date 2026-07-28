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
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }
}

module.exports = { BasePage };
