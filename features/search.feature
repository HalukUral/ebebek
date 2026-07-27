@search @regression
Feature: Ürün arama

  @smoke
  Scenario: Arama terimiyle ilişkili ürünler listelenir
    Given "ana sayfa" açılır
    When müşteri "sonucluArama" test verisiyle arama yapar
    Then ürün sonuçları arama terimiyle ilişkili olmalıdır

  @negative
  Scenario: Ürün bulunmayan aramada boş sonuç gösterilir
    Given "ana sayfa" açılır
    When müşteri "sonucsuzArama" test verisiyle arama yapar
    Then boş arama sonucu gösterilmelidir
