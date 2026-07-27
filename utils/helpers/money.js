function parseTurkishMoney(text) {
  if (!text) throw new Error('Fiyat metni boş olamaz.');

  const normalized = text
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');
  const value = Number.parseFloat(normalized);

  if (!Number.isFinite(value)) {
    throw new Error(`Fiyat sayıya çevrilemedi: "${text}"`);
  }
  return value;
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

module.exports = { parseTurkishMoney, roundCurrency };
