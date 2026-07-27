const { When, Then } = require('@cucumber/cucumber');
const { getSearchValue } = require('../fixtures/search-data');

When('müşteri {string} test verisiyle arama yapar', async function (dataKey) {
  const term = getSearchValue(dataKey);
  this.scenarioState.searchTerm = term;

  if (dataKey === 'sonucsuzArama') {
    await this.pages.search.mockEmptyResults(term);
  }
  await this.pages.search.search(term);
});

Then('ürün sonuçları arama terimiyle ilişkili olmalıdır', async function () {
  await this.pages.search.verifyResultsRelatedTo(this.scenarioState.searchTerm);
});

Then('boş arama sonucu gösterilmelidir', async function () {
  await this.pages.search.verifyEmptyResults();
});
