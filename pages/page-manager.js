const { LoginPage } = require('./login-page');
const { SearchPage } = require('./search-page');
const { CartPage } = require('./cart-page');

class PageManager {
  constructor(page) {
    this.login = new LoginPage(page);
    this.search = new SearchPage(page);
    this.cart = new CartPage(page);

    this.pageObjects = [this.login, this.search, this.cart];
    this.pageRoutes = {
      'ana sayfa': this.login,
    };
  }

  element(name) {
    const pageObject = this.pageObjects.find((item) => item.elements[name]);
    if (pageObject) return pageObject.element(name);
    throw new Error(`Tanımsız element: ${name}`);
  }

  async open(pageName) {
    const pageObject = this.pageRoutes[pageName];
    if (!pageObject) throw new Error(`Tanımsız sayfa: ${pageName}`);
    await pageObject.open();
  }
}

module.exports = { PageManager };
