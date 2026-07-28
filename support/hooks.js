const fs = require('fs');
const path = require('path');
const { BeforeAll, Before, After, Status } = require('@cucumber/cucumber');
const { config } = require('../config/env');

BeforeAll(function () {
  fs.mkdirSync('allure-results', { recursive: true });
  const environment = [
    `Base.URL=${config.baseUrl}`,
    `Browser=${config.browser}`,
    `Headless=${config.headless}`,
    `Locale=${config.locale}`,
    `Node.Version=${process.version}`,
  ].join('\n');
  fs.writeFileSync('allure-results/environment.properties', `${environment}\n`);
});

Before(async function () {
  this.scenarioState = {};
  await this.start();
});

After(async function ({ result, pickle }) {
  if (!this.context) return;

  const failed = result?.status === Status.FAILED;
  const safeName = pickle.name.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase();
  const artifactId = `${safeName}-${process.pid}-${Date.now()}`;

  if (failed) {
    console.error(`\nBaşarısız senaryo: ${pickle.name}`);
    console.error(result.message || 'Cucumber hata ayrıntısı üretmedi.');
  }

  if (failed && this.page && !this.page.isClosed()) {
    try {
      const screenshot = await this.page.screenshot({
        fullPage: true,
        timeout: 10_000,
      });
      await this.attach(screenshot, 'image/png');
    } catch (_) {
      // Artifact hatası asıl senaryo hatasını gizlememelidir.
    }
  }

  let tracePath;
  if (config.trace) {
    tracePath = path.join('test-results', 'traces', `${artifactId}.zip`);
    fs.mkdirSync(path.dirname(tracePath), { recursive: true });
    await this.context.tracing.stop({ path: tracePath });
    if (failed) await this.attach(fs.readFileSync(tracePath), 'application/zip');
  }

  const video = this.page?.video();
  await this.context.close();
  await this.browser.close();

  if (failed && video) {
    try {
      await this.attach(fs.readFileSync(await video.path()), 'video/webm');
    } catch (_) {
      // Browser başlangıçta kapanırsa video oluşmayabilir.
    }
  }
});
