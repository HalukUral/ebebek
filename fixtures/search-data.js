const searchData = {
  values: {
    sonucluArama: 'bebek bezi',
    sepetUrunleri: 'bebek bezi',
    sonucsuzArama: () => `sonucsuz-arama-${Date.now()}-${process.pid}`,
  },
};

function getSearchValue(key) {
  const value = searchData.values[key];
  if (!value) throw new Error(`Arama test verisi bulunamadı: ${key}`);
  return typeof value === 'function' ? value() : value;
}

module.exports = { searchData, getSearchValue };
