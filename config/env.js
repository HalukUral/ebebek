const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true });

function readBoolean(name, defaultValue) {
  const value = process.env[name];
  return value === undefined ? defaultValue : value.toLowerCase() === 'true';
}

function readNumber(name, defaultValue) {
  const value = Number(process.env[name] || defaultValue);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} pozitif bir sayı olmalıdır.`);
  }
  return value;
}

const config = Object.freeze({
  baseUrl: process.env.BASE_URL,
  browser: process.env.BROWSER || 'chromium',
  headless: readBoolean('HEADLESS', true),
  trace: readBoolean('TRACE', true),
  video: readBoolean('VIDEO', false),
  locale: process.env.LOCALE || 'tr-TR',
  timeout: readNumber('TIMEOUT_MS', 30_000),
  credentials: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  },
});

module.exports = { config };
