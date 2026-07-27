# e-bebek Web Test Automation

JavaScript, Playwright, Cucumber ve Allure kullanan e-bebek E2E test
framework'ü. Mevcut kapsam login, ürün arama ve sepet case'leridir.

## Kurulum

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

`.env` içinde test ortamına ait kullanıcı bilgilerini tanımlayın. Credential,
base URL ve browser ayarları kaynak kodda tutulmaz.

## Çalıştırma

```bash
npm test
npm run test:login
npm run test:negative-login
npm run test:search
npm run test:cart
npm run test:logout
npm run test:smoke
```

Varsayılan Cucumber koşumu iki paralel worker kullanır. UI modu için:

```env
HEADLESS=false
```

## Rapor

```bash
npm run report:generate
npm run report:open
```

Allure raporu adımları, tag'ları, environment bilgisini ve başarısızlık
artifact'lerini içerir. Başarısız senaryoda screenshot, trace ve video eklenir.
Trace ayrıca şu komutla açılabilir:

```bash
npx playwright show-trace "$(ls -t test-results/traces/*.zip | head -1)"
```

## GitHub Actions

`.github/workflows/smoke-tests.yml`; `main`/`master` branch push'larında, pull
request'lerde ve manuel tetiklemede `npm run test:smoke` komutunu headless
Chromium ile çalıştırır. Allure sonuçları, HTML raporu ve test artifact'leri
koşum başarılı veya başarısız olsa da 14 gün süreyle yüklenir.

Repository ayarlarında aşağıdaki Actions secret'ları tanımlanmalıdır:

- `BASE_URL`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

## Proje yapısı

```text
config/             Ortam konfigürasyonu
features/           İş dilindeki Gherkin case'leri
fixtures/           Dinamik ve merkezi test verileri
pages/              Locator ve sayfa davranışları
step_definitions/   Generic ve domain step'leri
support/            World, browser yaşam döngüsü ve hooks
```

## Framework nasıl çalışır?

Bir senaryo çalışırken sırasıyla şu akış izlenir:

1. `Before` hook yeni bir `World`, browser context ve page hazırlar.
2. Step definition, yapılacak işi ilgili Page Object metoduna gönderir.
3. Page Object locator ve sayfa davranışını yönetir.
4. `After` hook ekran görüntüsü, trace ve video gibi artifact'leri toplar;
   ardından browser'ı kapatır.

`BasePage`, tüm sayfalarda kullanılan `element(name)` ve ana sayfa açma
davranışını içerir. `PageManager`, step'lerin `this.pages.login`,
`this.pages.search` ve `this.pages.cart` üzerinden Page Object'lere ulaşmasını
sağlar.

`generic.steps.js`; tıklama, hover, input doldurma, element görünürlüğü ve URL
kontrollerini tekrar kullanılabilir şekilde sağlar. Locator'lar Page Object
içindeki `elements` map'lerinde tek yerde tanımlanır. XPath kullanılmaz; stabil
ID, role ve anlamlı CSS locator'ları tercih edilir.

Senaryoya özel geçici veriler yalnızca `this.scenarioState` içinde tutulur:

```js
this.scenarioState.searchTerm = term;
this.scenarioState.cartProducts = products;
```

Bu yaklaşım verinin hangi senaryoya ait olduğunu açık tutar ve paralel koşumda
global state oluşmasını engeller.

## Paralel koşum ve izolasyon

Her scenario `Before` hook'unda yeni browser, context ve page oluşturur. Cookie,
localStorage, sessionStorage ve World state'i senaryolar arasında paylaşılmaz.
`After` hook'u context ve browser'ı kapatır. Artifact isimleri scenario adı,
process ID ve timestamp içerdiği için iki worker aynı dosyaya yazmaz.

`@state` senaryosunda misafirken sepete eklenen ürün ve adet bilgisi
`this.scenarioState.guestCart` alanına yazılır. Bu alan Cucumber World nesnesine
aittir; giriş adımından sonra aynı senaryo bağlamından okunarak ürünün sepette
korunduğu doğrulanır. `Before` hook'u bu alanı her senaryo için boş başlatır.

`@logout` senaryosu çıkış bağlantısına tıklamakla yetinmez. Giriş yapılmışken
korumalı hesap sayfasının adresini World bağlamında saklar; çıkıştan sonra bu
adresi yeniden açıp login sayfasına yönlendirmeyi ve misafir giriş menüsünü
doğrular.

Kayıtlı olmayan e-posta her scenario için timestamp ve process ID ile dinamik
üretilir. Hatalı şifre testi için kilitlenme politikası olmayan, yalnızca
otomasyona ayrılmış bir test hesabı kullanılmalıdır.

e-bebek'in semantik arama servisi anlamsız/rastgele terimlerde dahi yüzlerce
öneri döndürdüğü için doğal bir boş sonuç üretmiyor. Sonuçsuz arama case'i,
yalnızca dinamik `sonucsuzArama` fixture teriminde ürün arama response'unu sıfır
ürünle route ederek gerçek boş-state UI mesajını deterministik doğrular.
Sonuçlu arama canlı backend'e karşı çalışır ve ilk ürünlerin tamamının arama
terimindeki en az bir kelimeyle ilişkili olduğunu kontrol eder.

Sepet ara toplamı metin olarak karşılaştırılmaz. Her görünür sepet satırının
`.product-price` birim fiyatı ve `.quantity-text` adedi okunur. Türkçe fiyat
metnindeki `TL`, binlik noktası ve ondalık virgül temizlenerek sayı elde edilir.
Beklenen `Σ(adet × birim fiyat)` iki ondalığa yuvarlanıp `#txtSubtotal`
değeriyle sayısal olarak karşılaştırılır.

## Bekleme ve flaky çözümü

Projede `sleep` ve `waitForTimeout` kullanılmaz. Playwright auto-wait,
`expect(...).toBeVisible()`, `waitFor()` ve URL assertion'ları kullanılır.

Ana sayfada AWS challenge sonrası header geç yüklenebiliyor. Bu durum sabit süre
beklemek yerine `hesabım menüsü` elementinin görünürlüğünü web-first assertion
ile bekleyerek stabilize edilir. Hesabım flyout'u click ile kararsız açıldığı
için gerçek masaüstü davranışına uygun olarak `hover()` yapılır ve login linki
görünür olduktan sonra tıklanır.

Sepete ürün eklendiğinde açılan yan modal sonraki login aksiyonlarını
engelleyebildiği için `waitForTimeout` kullanılmaz; modalın erişilebilir kapatma
butonu görünür olana kadar assertion ile beklenir, tıklanır ve modalın kapandığı
doğrulanır.
