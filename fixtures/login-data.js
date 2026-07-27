const { config } = require('../config/env');

const loginData = {
  values: {
    geçerliEposta: () => config.credentials.email,
    geçerliSifre: () => config.credentials.password,
    hatalıSifre: () => 'testpassword!',
    kayitsizEposta: () => `test-${Date.now()}-${process.pid}@example.com`,
    bos: () => '',
  },
  messages: {
    geçersizKullanici: 'Kullanıcı adı veya parolanız hatalıdır',
    hesapOlustur: 'Hesap Oluştur',
    zorunluAlan: 'Bu alan gereklidir',
  },
};

function getTestValue(key) {
  const factory = loginData.values[key];
  if (!factory) throw new Error(`Test verisi bulunamadı: ${key}`);
  const value = factory();
  if (value === undefined) throw new Error(`${key} için .env değeri tanımlanmalıdır.`);
  return value;
}

module.exports = { loginData, getTestValue };
