@authentication @regression
Feature: Müşteri girişi

  @positive-login @smoke
  Scenario: Kayıtlı müşteri geçerli bilgilerle giriş yapar
    Given "ana sayfa" açılır
    When müşteri "hesabım menüsü" elementinin üzerine gelir
    Then "giriş menüsü bağlantısı" görünür olmalıdır
    When müşteri "giriş menüsü bağlantısı" elementine tıklar
    Then güncel URL "/login" içermelidir
    When müşteri "e-posta sekmesi" elementine tıklar
    And müşteri "e-posta alanı" elementini "geçerliEposta" test verisiyle doldurur
    And müşteri "devam butonu" elementine tıklar
    Then "şifre alanı" görünür olmalıdır
    When müşteri "şifre alanı" elementini "geçerliSifre" test verisiyle doldurur
    And müşteri "giriş butonu" elementine tıklar
    Then müşterinin giriş yaptığı doğrulanmalıdır

  @logout @smoke
  Scenario: Müşteri çıkış yaptıktan sonra korumalı hesap sayfasına erişemez
    Given "ana sayfa" açılır
    When müşteri geçerli kullanıcı bilgileriyle giriş yapar
    And müşteri hesabından çıkış yapar
    Then müşteri oturumunun sonlandığı doğrulanmalıdır

  @negative-login @negative
  Scenario Outline: Müşteri geçersiz bilgilerle giriş yapamaz
    Given "ana sayfa" açılır
    When müşteri geçersiz "<eposta>" ve "<sifre>" ile giriş yapamamalıdır
    Then "<mesaj>" test mesajı görünür olmalıdır

    Examples:
      | eposta         | sifre       | mesaj             |
      | geçerliEposta  | hatalıSifre | geçersizKullanici |
      | kayitsizEposta | bos         | hesapOlustur      |
      | bos            | bos         | zorunluAlan       |
      | geçerliEposta  | bos         | zorunluAlan       |
