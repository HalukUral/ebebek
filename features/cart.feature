@cart @regression @smoke
Feature: Sepet yönetimi

  Scenario: Müşteri ürünleri günceller ve sayısal ara toplamı doğrular
    Given "ana sayfa" açılır
    When müşteri "sepetUrunleri" test verisiyle arama yapar
    And müşteri iki farklı ürünü sepete ekler
    And müşteri "sepet" elementine tıklar
    Then iki ürün de sepette görünmelidir
    When müşteri ilk ürünün adedini artırır
    And müşteri ikinci ürünü sepetten siler
    Then sepet ara toplamı adet ile birim fiyat çarpımına eşit olmalıdır

  @state
  Scenario: Giriş sonrasında misafir sepeti korunur
    Given "ana sayfa" açılır
    When müşteri "sepetUrunleri" test verisiyle arama yapar
    And müşteri misafir olarak ilk ürünü sepete ekler
    When müşteri geçerli kullanıcı bilgileriyle giriş yapar
    And müşteri "sepet" elementine tıklar
    Then giriş sonrasında misafir sepetindeki ürün korunmuş olmalıdır
