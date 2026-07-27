const { When, Then } = require('@cucumber/cucumber');

When('müşteri iki farklı ürünü sepete ekler', async function () {
  this.scenarioState.cartProducts =
    await this.pages.search.addFirstProductsToCart(2);
});

When('müşteri misafir olarak ilk ürünü sepete ekler', async function () {
  const [product] = await this.pages.search.addFirstProductsToCart(1);
  this.scenarioState.guestCart = {
    product,
    quantity: 1,
  };
});

Then('iki ürün de sepette görünmelidir', async function () {
  await this.pages.cart.verifyProducts(this.scenarioState.cartProducts);
});

When('müşteri ilk ürünün adedini artırır', async function () {
  await this.pages.cart.increaseQuantity(this.scenarioState.cartProducts[0]);
});

When('müşteri ikinci ürünü sepetten siler', async function () {
  await this.pages.cart.removeProduct(this.scenarioState.cartProducts[1]);
});

Then(
  'sepet ara toplamı adet ile birim fiyat çarpımına eşit olmalıdır',
  async function () {
    const remainingProducts = [this.scenarioState.cartProducts[0]];
    await this.pages.cart.verifyNumericSubtotal(remainingProducts);
  },
);

Then(
  'giriş sonrasında misafir sepetindeki ürün korunmuş olmalıdır',
  async function () {
    await this.pages.cart.verifyGuestCartPreserved(this.scenarioState.guestCart);
  },
);
