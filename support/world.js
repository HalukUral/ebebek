const { World, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox, webkit } = require('playwright');
const { config } = require('../config/env');
const { PageManager } = require('../pages/page-manager');

const browserTypes = { chromium, firefox, webkit };
setDefaultTimeout(config.timeout * 2);

class EbebekWorld extends World {
  async start() {
    if (!config.baseUrl) throw new Error('BASE_URL .env içinde tanımlanmalıdır.');

    const browserType = browserTypes[config.browser];
    if (!browserType) {
      throw new Error(`Desteklenmeyen tarayıcı: ${config.browser}`);
    }

    this.browser = await browserType.launch({
      headless: config.headless,
      args: config.headless ? [] : ['--start-maximized'],
    });
    this.context = await this.browser.newContext({
      baseURL: config.baseUrl,
      locale: config.locale,
      viewport: null,
      recordVideo: config.video ? { dir: 'test-results/videos' } : undefined,
    });

    if (config.trace) {
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
    }

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(config.timeout);
    this.pages = new PageManager(this.page);
  }
}

setWorldConstructor(EbebekWorld);
