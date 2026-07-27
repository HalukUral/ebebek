const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');
const { parseTurkishMoney, roundCurrency } = require('../support/helpers/money');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.elements = {
      'sepet': page.locator('a[href="/cart"]'),
      'sepet ürünleri': page.locator('eb-cart-item'),
      'silme onay butonu': page.locator('ngb-modal-window .btn-remove'),
      'sepet ara toplamı': page.locator('#txtSubtotal:visible'),
    };
  }

  itemByProduct(product) {
    return this.element('sepet ürünleri')
      .filter({ has: this.page.locator(`a[href="${product.href}"]`) })
      .first();
  }

  async verifyProducts(products) {
    await expect(this.element('sepet ürünleri')).toHaveCount(products.length, {
      timeout: 30_000,
    });
    for (const product of products) {
      await expect(this.itemByProduct(product)).toBeVisible();
    }
  }

  async verifyGuestCartPreserved(guestCart) {
    const preservedItem = this.itemByProduct(guestCart.product);
    await expect(preservedItem).toBeVisible({ timeout: 30_000 });

    const cartProductTitle = ( await preservedItem.getByRole('heading').innerText() ).trim();
    const cartProductHref = await preservedItem
      .locator(`a[href="${guestCart.product.href}"]`)
      .first()
      .getAttribute('href');

    expect(cartProductTitle).toBe(guestCart.product.title);
    expect(cartProductHref).toBe(guestCart.product.href);

    const quantity = Number(await preservedItem.locator('.quantity-text').innerText());
    expect(
      quantity,
      `"${guestCart.product.name}" ürünü giriş sonrasında sepette korunmalıdır`,
    ).toBeGreaterThanOrEqual(guestCart.quantity);
  }

  async increaseQuantity(product) {
    const item = this.itemByProduct(product);
    const quantity = item.locator('.quantity-text');
    const currentQuantity = Number(await quantity.innerText());
    const targetQuantity = currentQuantity + 1;
    await item.locator('.plus-btn').click();
    await expect(quantity).toHaveText(String(targetQuantity), {
      timeout: 30_000,
    });
  }

  async removeProduct(product) {
    const item = this.itemByProduct(product);
    const itemCount = await this.element('sepet ürünleri').count();
    await item.locator('.remove-item').click();
    await expect(this.element('silme onay butonu')).toBeVisible();
    await this.element('silme onay butonu').click();
    await expect(item).toHaveCount(0, { timeout: 30_000 });
    await expect(this.element('sepet ürünleri')).toHaveCount(itemCount - 1, {
      timeout: 30_000,
    });
  }

  async verifyNumericSubtotal(products) {
    let expectedSubtotal = 0;

    for (const product of products) {
      const item = this.itemByProduct(product);
      const quantity = Number(await item.locator('.quantity-text').innerText());
      const unitPrice = parseTurkishMoney(product.unitPriceText);
      expectedSubtotal += quantity * unitPrice;
    }

    const displayedSubtotal = parseTurkishMoney(
      await this.element('sepet ara toplamı').innerText(),
    );
    expect(roundCurrency(displayedSubtotal)).toBe(roundCurrency(expectedSubtotal),
    );
  }
}

module.exports = { CartPage };
