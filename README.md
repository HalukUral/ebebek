# e-bebek Web Test Otomasyonu

e-bebek web uygulamasındaki login, logout, ürün arama, sepet ve oturum
devamlılığı akışlarını test eden JavaScript tabanlı E2E otomasyon projesidir.

## Kullanılan teknolojiler

- Node.js 20+
- Playwright
- Cucumber / Gherkin
- Allure Report
- GitHub Actions

## Proje yapısı

```text
config/             Ortam konfigürasyonu
features/           Gherkin senaryoları
fixtures/           Merkezi ve dinamik test verileri
pages/              Page Object sınıfları ve locator'lar
step_definitions/   Generic ve senaryoya özel Cucumber step'leri
support/            World, hooks ve yardımcı metotlar
cucumber.js         Cucumber, reporter ve paralel koşum ayarları
```

## Ön gereksinimler

- Node.js 20 veya üzeri
- npm
- Allure raporunu görüntülemek için Java

Sürüm kontrolü:

```bash
node --version
npm --version
java --version
```

## Kurulum

Bağımlılıkları yükleyin:

```bash
npm install
```

Chromium tarayıcısını yükleyin:

```bash
npx playwright install chromium
```

Linux veya CI ortamında tarayıcıyla birlikte sistem bağımlılıklarını yüklemek
için:

```bash
npx playwright install --with-deps chromium
```

Örnek ortam dosyasını kopyalayın:

```bash
cp .env.example .env
```

`.env` içindeki değerleri test ortamınıza göre düzenleyin:

```env
BASE_URL=https://www.e-bebek.com
TEST_USER_EMAIL=test-kullanicisi@example.com
TEST_USER_PASSWORD=test-sifresi
BROWSER=chromium
HEADLESS=true
TRACE=true
VIDEO=false
LOCALE=tr-TR
TIMEOUT_MS=30000
```

Base URL ve kullanıcı bilgileri kaynak kodda tutulmaz. Lokal çalışmada `.env`,
CI çalışmasında environment variable veya repository secret kullanılır.

## Testleri çalıştırma

Tüm testler:

```bash
npm test
```

Smoke testleri:

```bash
npm run test:smoke
```

Pozitif login:

```bash
npm run test:login
```

Negatif login:

```bash
npm run test:negative-login
```

Arama testleri:

```bash
npm run test:search
```

Sepet ve oturum devamlılığı testleri:

```bash
npm run test:cart
```

Logout testi:

```bash
npm run test:logout
```

İstenilen Cucumber tag'i doğrudan çalıştırılabilir:

```bash
npx cucumber-js --tags "@state"
npx cucumber-js --tags "@negative"
npx cucumber-js --tags "@regression"
```

Testi tarayıcı arayüzü açık şekilde çalıştırmak için `.env` içindeki değer:

```env
HEADLESS=false
```

Headless çalıştırmak için:

```env
HEADLESS=true
```

## Paralel koşum

Varsayılan worker sayısı `cucumber.js` içinde tanımlıdır:

```js
parallel: 2
```

Bu nedenle `npm test` ve tag tabanlı komutlar varsayılan olarak iki worker ile
çalışır.

Worker sayısını yalnızca ilgili koşum için değiştirmek mümkündür:

```bash
npx cucumber-js --parallel 4
```

Senaryolar paralel çalışmaya uygun tasarlanmıştır. Her senaryo:

- Yeni bir Cucumber World nesnesi kullanır.
- Yeni browser context ve page ile başlar.
- Kendi `scenarioState` nesnesine sahiptir.
- Başka bir senaryonun login, cookie, storage veya sepet verisini kullanmaz.

## Test izolasyonu

`Before` hook'u her senaryodan önce:

1. Boş bir `scenarioState` oluşturur.
2. Yeni browser context oluşturur.
3. Yeni page açar.
4. Page Object'leri `PageManager` üzerinden hazırlar.

`After` hook'u senaryo tamamlandığında context ve browser'ı kapatır. Böylece
cookie, `localStorage`, `sessionStorage` ve kullanıcı oturumu senaryolar
arasında paylaşılmaz.

Senaryo adımları arasında taşınması gereken veriler global değişkende değil,
yalnızca o senaryoya ait World bağlamında saklanır:

```js
this.scenarioState.searchTerm = term;
this.scenarioState.cartProducts = products;
this.scenarioState.guestCart = { product, quantity: 1 };
```

Dinamik test verilerinde timestamp ve process ID kullanılması, iki worker'ın
aynı veriyi üretmesini önler. Artifact dosya isimlerinde de senaryo adı,
process ID ve timestamp bulunduğu için paralel çalışan testler birbirinin
çıktısının üzerine yazmaz.

## Bekleme stratejisi ve flaky test çözümleri

Projede `sleep` ve `waitForTimeout` kullanılmaz. UI senkronizasyonu için
Playwright'ın auto-wait özelliği ve koşul bazlı beklemeler kullanılır:

- `expect(locator).toBeVisible()`
- `expect(locator).toBeHidden()`
- `expect(locator).toHaveText()`
- `expect(locator).toHaveCount()`
- `locator.waitFor()`
- `page.waitForURL()`
- `page.goto(..., { waitUntil: 'networkidle' })`

### Ana sayfanın hazırlanması

Ana sayfada `load` veya `domcontentloaded` tamamlandığında Angular
bileşenlerinin event binding işlemleri henüz bitmemiş olabiliyor. Bu durumda
arama alanı görünmesine rağmen Enter tuşu aramayı tetiklemeyebiliyor.

Sabit süre beklemek yerine ana sayfa `networkidle` durumuna kadar açılır.
Aramada öneri bileşeninin DOM'a eklendiği beklenir ve ardından Enter
aksiyonu uygulanır. Sonuç sayfasına geçiş `waitForURL` ile doğrulanır.

### Hesabım menüsü

Hesabım alt menüsü masaüstünde hover ile açılır. Locator'a doğrudan tıklamak
yerine:

1. Hesabım menüsünün üzerine gelinir.
2. Login bağlantısının görünür olması beklenir.
3. Görünür bağlantı üzerinden işleme devam edilir.

Bu yaklaşım gerçek kullanıcı davranışını taklit eder ve gizli menü locator'ına
tıklama kaynaklı timeout'ları önler.

### Sepete ekleme modalı

Ürün sepete eklendiğinde açılan modal sonraki işlemleri engelleyebilir. Modal
için sabit bekleme kullanılmaz:

1. Kapatma butonunun görünür olması beklenir.
2. Butona tıklanır.
3. Butonun gizlendiği doğrulanır.

### Sonuçsuz arama

Canlı arama servisi anlamsız terimler için de öneri döndürebildiğinden boş
sonuç senaryosu deterministik değildir. Yalnızca dinamik sonuçsuz arama test
verisi için arama response'u Playwright route ile sıfır ürün döndürecek şekilde
düzenlenir. Pozitif arama testi canlı backend üzerinden çalışmaya devam eder.

## Allure raporu

Test çalıştırıldığında Allure sonuçları `allure-results/` altında oluşturulur.

HTML raporu üretmek için:

```bash
npm run report:generate
```

Raporu açmak için:

```bash
npm run report:open
```

Tek komut zinciriyle test ve rapor üretmek için:

```bash
npm test
npm run report:generate
npm run report:open
```

Allure raporu aşağıdaki bilgileri içerir:

- Feature, scenario ve step sonuçları
- Cucumber tag'leri
- Base URL, browser, headless ve locale bilgileri
- Hata durumunda full-page screenshot
- Hata durumunda Playwright trace
- `VIDEO=true` ise hata videosu

## Trace kullanımı

Trace kaydı `.env` içinde yönetilir:

```env
TRACE=true
```

En son oluşturulan trace'i açmak için:

```bash
npx playwright show-trace "$(ls -t test-results/traces/*.zip | head -1)"
```

Belirli bir trace dosyası:

```bash
npx playwright show-trace test-results/traces/trace-dosyasi.zip
```

## GitHub Actions

Workflow dosyası:

```text
.github/workflows/smoke-tests.yml
```

Pipeline:

- Smoke testlerini headless Chromium ile çalıştırır.
- Her gün Türkiye saatiyle 08:00'de zamanlanır.
- `main` ve `master` push'larında çalışır.
- Pull request ve manuel tetiklemeyi destekler.
- Allure sonuçlarını, HTML raporunu ve test artifact'lerini yükler.

Repository içinde aşağıdaki Actions secret'ları tanımlanmalıdır:

- `BASE_URL`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

GitHub-hosted runner IP'leri e-bebek CloudFront tarafından `Request blocked`
cevabıyla engellenebilir. Bu durum framework veya locator hatası değildir.
Gerçek CI UI koşumu için izinli bir test ortamı, allowlist edilmiş runner veya
self-hosted runner kullanılmalıdır. Pipeline hata durumunda screenshot, trace
ve Allure raporunu yine artifact olarak yükler.

## Test kapsamı

- Geçerli kullanıcıyla login
- Farklı negatif login kombinasyonları
- Logout sonrasında korumalı sayfaya erişimin engellenmesi
- Sonuçlu ve sonuçsuz ürün arama
- İki ürünle sepet iş akışı
- Ürün adedi artırma ve ürün silme
- Türkçe para formatını parse ederek sayısal ara toplam kontrolü
- Misafir sepetinin login sonrasında korunması

## AI Kullanımı ve Doğrulama

Bu projede AI destekli geliştirme aracı olarak **OpenAI Codex** kullanılmıştır.
Codex'ten code review süreçlerinde destek alınmıştır.

Codex desteği ağırlıklı olarak aşağıdaki alanlarda kullanılmıştır:

- Framework yapısının ve kod tekrarlarının gözden geçirilmesi
- Locator ve bekleme stratejileri için alternatiflerin değerlendirilmesi
- CI/CD ve Allure entegrasyonunun kontrol edilmesi
- Teknik dokümantasyonun düzenlenmesi

