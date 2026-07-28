const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class SearchPage extends BasePage {
  constructor(page) {
    super(page);

    const searchResults = page.locator(
      'cx-page-layout.SearchResultsListPageTemplate',
    );
    this.elements = {
      'arama alanı': page.locator('#txtSearchBox'),
      'arama ürünleri': page.locator('eb-product-list-item').filter({ visible: true }),
      'boş sonuç ürünleri': searchResults.locator('eb-product-list-item'),
      'boş arama mesajı': page.getByText('Aradığınız kelimeye / kritere uygun bir sonuç bulunamamıştır.',{ exact: true },),
      'sepet kapatma butonu': page.locator('.close-button[aria-label="Close"]',),
    };
  }

  async mockEmptyResults(term) {
    await this.page.route('**/products/search?**', async (route) => {
      const requestTerm = this.getQueryTerm(route.request().url());
      if (requestTerm !== term) return route.continue();

      const response = await route.fetch();
      const body = await response.json();
      body.products = [];

      if (body.pagination) {
        body.pagination.totalResults = 0;
        body.pagination.totalPages = 0;
      }

      await route.fulfill({ response, json: body });
    });
  }

  async search(term) {
    const searchInput = this.element('arama alanı');
    await searchInput.fill(term);
    await this.page
      .locator('.header__menu-search-content-suggestion')
      .waitFor({ state: 'attached' });
    await searchInput.press('Enter');
    await this.page.waitForURL((url) => url.pathname !== '/');
  }

  async verifyResultsRelatedTo(term) {
    const products = this.element('arama ürünleri');
    await expect(products.first()).toBeVisible({ timeout: 30_000 });
    const productTexts = (await products.allTextContents())
      .slice(0, 10)
      .map((text) => text.toLocaleLowerCase('tr-TR'));
    const searchWords = term.toLocaleLowerCase('tr-TR').split(/\s+/);
    await expect(
      productTexts.every((text) =>
        searchWords.some((word) => text.includes(word)),
      ),
      `İlk ürün sonuçlarının tamamı "${term}" ile ilişkili olmalıdır`,
    ).toBeTruthy();
  }

  async verifyEmptyResults() {
    await expect(this.element('boş arama mesajı')).toBeVisible();
    await expect(this.element('boş sonuç ürünleri')).toHaveCount(0);
  }

  async addFirstProductsToCart(count) {
    const products = this.element('arama ürünleri');
    await expect(products.nth(count - 1)).toBeVisible({ timeout: 30_000 });
    const addedProducts = [];

    for (let index = 0; index < count; index += 1) {
      const productCard = products.nth(index);
      const productInfo = await this.getProductInfo(productCard);
      await productCard.locator('#addToCartBtn').click();
      await this.closeAddedToCartModal();
      addedProducts.push(productInfo);
    }
    return addedProducts;
  }

  async closeAddedToCartModal() {
    const closeButton = this.element('sepet kapatma butonu').last();
    await expect(closeButton).toBeVisible({ timeout: 10_000 });
    await closeButton.click();
    await expect(closeButton).toBeHidden();
  }

  getQueryTerm(url) {
    return new URL(url).searchParams.get('query');
  }

  async getProductInfo(productCard) {
    const name = (await productCard.getByRole('heading').first().innerText()).trim();
    const title = (
      await productCard.locator('.description.plist-desc').innerText()
    ).trim();
    const unitPriceText = ( await productCard.locator('.original-price').innerText() ).trim();
    const href = await productCard
      .locator('a.product-item-anchor')
      .getAttribute('href');

    return { name, title, href, unitPriceText };
  }
}

module.exports = { SearchPage };
