import type {
  Language,
  LocalizedList,
  LocalizedText,
  OrderStatus,
  TeamApplicationStatus,
} from '../types.ts';

export function pickText(text: LocalizedText | undefined | null, lang: Language): string {
  if (!text) return '';
  return (
    text[lang]?.trim() ||
    text.ar?.trim() ||
    text.en?.trim() ||
    text.tr?.trim() ||
    ''
  );
}

export function pickList(list: LocalizedList | undefined | null, lang: Language): string[] {
  if (!list) return [];
  if (Array.isArray(list[lang]) && list[lang].length > 0) return list[lang];
  if (Array.isArray(list.ar) && list.ar.length > 0) return list.ar;
  if (Array.isArray(list.en) && list.en.length > 0) return list.en;
  if (Array.isArray(list.tr) && list.tr.length > 0) return list.tr;
  return [];
}

export function formatTRY(amount: number, lang: Language = 'ar'): string {
  const locale = lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : 'ar-SA';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ₺`;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export const UI_STRINGS = {
  ar: {
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      offers: 'العروض',
      reviews: 'آراء العملاء',
      contact: 'تواصل معنا',
      admin: 'لوحة التحكم',
      advisor: 'مستشارة الجمال',
    },
    home: {
      viewAllProducts: 'تصفح جميع المنتجات',
      exploreCatalog: 'استكشاف الأقسام',
      openAdvisor: 'استشيري مستشارة الجمال',
      bestSellersEmptyTitle: 'تشكيلة الأكثر مبيعاً قيد الإعداد',
      bestSellersEmptyDesc:
        'لا توجد منتجات منشورة بعد. يمكنك إضافة المنتجات وتحديد الأكثر مبيعاً من لوحة التحكم لتظهر هنا فوراً.',
      latestEmptyTitle: 'إصداراتنا القادمة تُحضّر بعناية',
      latestEmptyDesc:
        'تصفحي الأقسام الرئيسية أو اشتركي في نشرتنا البريدية ليصلك إشعار عند إضافة أحدث العطور ومنتجات العناية.',
      offersEmptyTitle: 'عروض حصرية قادمة قريباً',
      offersEmptyDesc:
        'سيتم الإعلان عن الباقات الموسمية والخصومات الخاصة فور نشرها من لوحة التحكم.',
      reviewsEmptyTitle: 'بانتظار مشاركة آراء عميلاتنا',
      reviewsEmptyDesc:
        'نحرص على عرض التجارب الحقيقية فقط. يمكن إضافة تقييمات العميلات المعتمدة عبر لوحة التحكم.',
      browseOffersProducts: 'تصفح المنتجات',
      followTikTok: 'متابعة على TikTok',
      followInstagram: 'متابعة على Instagram',
      followFacebook: 'متابعة على Facebook',
      officialAccount: 'الحساب الرسمي',
      callOrWhatsapp: 'الهاتف والواتساب',
      whatsappDirect: 'مراسلة عبر واتساب',
      directCall: 'اتصال هاتفي',
      brandLabel: 'اسم العلامة',
    },
    products: {
      title: 'مجموعة ELHAM BEAUTY',
      subtitle:
        'اختاري بين العطور الفاخرة، كريمات الوجه والعناية بالبشرة، سيرومات الشعر، ومنتجات التضخيم والتنحيف والتجميل.',
      allCategories: 'الكل',
      searchPlaceholder: 'ابحثي باسم المنتج أو الوصف...',
      sortNewest: 'الأحدث',
      sortBest: 'الأكثر مبيعاً',
      sortPriceAsc: 'السعر: من الأقل',
      sortPriceDesc: 'السعر: من الأعلى',
      viewProduct: 'عرض المنتج',
      discountBadge: 'خصم',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر حالياً',
      emptyCategoryTitle: 'هذا القسم بانتظار أولى إضافاته',
      emptyCategoryDesc:
        'لم تُضف منتجات في هذا التصنيف بعد. يمكن لمديرة المتجر إضافة المنتجات والصور والأسعار بسهولة من لوحة التحكم.',
      openAdminHint: 'إدارة المتجر من لوحة التحكم',
      backToProducts: 'العودة إلى المنتجات',
      featuresTitle: 'المميزات',
      howToUseTitle: 'طريقة الاستخدام',
      quantityLabel: 'الكمية',
      orderNow: 'اطلبي الآن',
      suggestedTitle: 'منتجات مقترحة لك',
      saveAmount: 'توفير',
    },
    order: {
      title: 'نموذج إتمام الطلب',
      subtitle: 'أدخلي بيانات التوصيل بدقة وسنتواصل معك لتأكيد الطلب.',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      country: 'الدولة',
      governorate: 'المحافظة',
      city: 'المدينة',
      district: 'المنطقة',
      detailedAddress: 'العنوان بالتفصيل',
      product: 'المنتج',
      quantity: 'الكمية',
      notes: 'ملاحظات إضافية (اختياري)',
      totalEstimate: 'الإجمالي التقديري',
      submit: 'إرسال الطلب',
      submitting: 'جاري إرسال الطلب...',
      requiredError: 'يرجى تعبئة جميع الحقول المطلوبة بدقة.',
      successTitle: 'تم إرسال طلبك بنجاح',
      successDesc: 'شكراً لثقتك بـ ELHAM BEAUTY. تم حفظ طلبك وسيقوم فريقنا بمراجعته والتواصل معك قريباً.',
      orderNumberLabel: 'رقم الطلب',
      sendWhatsapp: 'إرسال تفاصيل الطلب عبر واتساب',
      close: 'إغلاق',
      customProductPlaceholder: 'أدخلي اسم المنتج المطلوب',
    },
    newsletter: {
      emailPlaceholder: 'أدخلي بريدك الإلكتروني',
      subscribe: 'اشتراك',
      subscribing: 'جاري التسجيل...',
      successMsg: 'تم اشتراكك بنجاح في نشرة ELHAM BEAUTY.',
      alreadyMsg: 'هذا البريد الإلكتروني مشترك بالفعل.',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
    },
    joinTeam: {
      badge: 'فرصة تعاون وانضمام',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف / الواتساب',
      country: 'الدولة',
      city: 'المدينة (من أي مدينة)',
      cityPlaceholder: 'مثال: إسطنبول، أنقرة، غازي عنتاب، الرياض، دبي...',
      interestArea: 'مجال الاهتمام أو الخبرة',
      interestOptions: [
        'التسويق والمبيعات والتوزيع',
        'صناعة المحتوى والترويج',
        'مندوبة أو شريكة في مدينتي',
        'استفسار عام للانضمام',
      ],
      notes: 'نبذة قصيرة أو ملاحظات إضافية (اختياري)',
      submitting: 'جاري حفظ الاستمارة وتحويلك للواتساب...',
      requiredError: 'يرجى تعبئة الاسم الكامل، رقم الهاتف، الدولة، والمدينة للمتابعة.',
      successTitle: 'تم إرسال استمارتك بنجاح',
      successDesc:
        'شكراً لتقديمك للانضمام إلى فريق ELHAM BEAUTY. يتم الآن نقلك إلى واتساب إلهام بيوتي لإتمام تواصلك مباشرة.',
      appNumberLabel: 'رقم الاستمارة',
      openWhatsappNow: 'الانتقال الآن إلى واتساب ELHAM BEAUTY',
      copyMessage: 'نسخ نص الرسالة',
      copiedMessage: 'تم نسخ الرسالة',
      messagePreviewLabel: 'الرسالة الجاهزة للإرسال عبر واتساب',
      applyAgain: 'إرسال استمارة أخرى',
      navLabel: 'انضم لفريقنا',
    },
    advisor: {
      title: 'مستشارة الجمال والعطور',
      subtitle: 'إرشاد ذكي للعطور وكريمات البشرة وسيرومات الشعر والعناية',
      placeholder: 'اسألي عن عطر، كريم وجه، سيروم للشعر، أو روتين عناية...',
      send: 'إرسال',
      thinking: 'جاري التحليل بعمق...',
      welcome:
        'أهلاً بك في استشارة ELHAM BEAUTY الخاصة. أخبريني باحتياج بشرتك أو شعرك أو النوتات العطرية التي تفضلينها لأساعدك في اختيار الأنسب.',
      quickPrompts: [
        'اقترحي لي روتين كريمات للوجه وسيروم مناسب للشعر',
        'ما العطور النسائية الهادئة المناسبة للاستخدام اليومي؟',
        'كيف أختار بين منتجات العناية بالجسم والتنحيف أو التضخيم؟',
      ],
    },
    admin: {
      gateTitle: 'لوحة تحكم ELHAM BEAUTY',
      setupTitle: 'إنشاء كلمة مرور لوحة التحكم',
      setupSubtitle: 'ضعي كلمة مرور خاصة لحماية إدارة المتجر والمنتجات والطلبات.',
      loginSubtitle: 'أدخلي كلمة المرور الخاصة بإدارة المتجر للمتابعة.',
      passwordLabel: 'كلمة المرور',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      setupButton: 'تفعيل لوحة التحكم',
      loginButton: 'دخول إلى لوحة التحكم',
      backToStore: 'العودة للمتجر',
      logout: 'تسجيل الخروج',
      tabs: {
        products: 'المنتجات',
        categories: 'التصنيفات',
        offers: 'العروض',
        reviews: 'آراء العملاء',
        siteTexts: 'النصوص والبنرات',
        settings: 'التواصل والحماية',
        orders: 'الطلبات',
        teamApplications: 'طلبات الانضمام',
        subscribers: 'النشرة البريدية',
      },
      teamStatuses: {
        new: 'جديد',
        reviewed: 'تمت المراجعة',
        accepted: 'مقبول',
        archived: 'مؤرشف',
      },
      actions: {
        add: 'إضافة جديد',
        save: 'حفظ التغييرات',
        saving: 'جاري الحفظ...',
        edit: 'تعديل',
        delete: 'حذف',
        confirmDelete: 'تأكيد الحذف',
        cancel: 'إلغاء',
        uploadImage: 'رفع صورة',
        uploading: 'جاري الرفع...',
        aiGenerate: 'صياغة وترجمة بالذكاء الاصطناعي',
        aiGenerating: 'جاري الصياغة...',
        exportCsv: 'تصدير CSV',
        copyEmails: 'نسخ جميع الإيميلات',
        copied: 'تم النسخ',
        savedToast: 'تم الحفظ بنجاح',
      },
      statuses: {
        new: 'جديد',
        processing: 'قيد التجهيز',
        shipped: 'تم الشحن',
        completed: 'مكتمل',
        cancelled: 'ملغي',
      },
    },
  },
  tr: {
    nav: {
      home: 'Ana Sayfa',
      products: 'Ürünler',
      offers: 'Fırsatlar',
      reviews: 'Yorumlar',
      contact: 'İletişim',
      admin: 'Yönetim Paneli',
      advisor: 'Güzellik Danışmanı',
    },
    home: {
      viewAllProducts: 'Tüm Ürünleri Gör',
      exploreCatalog: 'Kategorileri Keşfet',
      openAdvisor: 'Güzellik Danışmanına Sor',
      bestSellersEmptyTitle: 'Çok Satanlar Koleksiyonu Hazırlanıyor',
      bestSellersEmptyDesc:
        'Henüz yayınlanmış ürün yok. Yönetim panelinden ürün ekleyip çok satan olarak işaretlediğinizde burada görünecektir.',
      latestEmptyTitle: 'Yeni Koleksiyonlar Özenle Hazırlanıyor',
      latestEmptyDesc:
        'Kategorilere göz atın veya en yeni parfüm ve bakım ürünlerinden haberdar olmak için bültenimize katılın.',
      offersEmptyTitle: 'Özel Kampanyalar Çok Yakında',
      offersEmptyDesc:
        'Sezonluk setler ve avantajlı fırsatlar yönetim panelinden yayınlandığında burada görüntülenecektir.',
      reviewsEmptyTitle: 'Müşteri Deneyimleri Bekleniyor',
      reviewsEmptyDesc:
        'Yalnızca gerçek müşteri yorumları paylaşılır. Onaylanan yorumlar yönetim panelinden eklenebilir.',
      browseOffersProducts: 'Ürünlere Göz At',
      followTikTok: "TikTok'ta Takip Et",
      followInstagram: "Instagram'da Takip Et",
      followFacebook: "Facebook'ta Takip Et",
      officialAccount: 'Resmi Hesap',
      callOrWhatsapp: 'Telefon ve WhatsApp',
      whatsappDirect: 'WhatsApp ile Yaz',
      directCall: 'Hemen Ara',
      brandLabel: 'Marka Adı',
    },
    products: {
      title: 'ELHAM BEAUTY Koleksiyonu',
      subtitle:
        'Lüks parfümler, yüz kremleri, saç serumları, vücut şekillendirme ve zayıflama ürünlerini keşfedin.',
      allCategories: 'Tümü',
      searchPlaceholder: 'Ürün adı veya açıklama ile ara...',
      sortNewest: 'En Yeniler',
      sortBest: 'Çok Satanlar',
      sortPriceAsc: 'Fiyat: Artan',
      sortPriceDesc: 'Fiyat: Azalan',
      viewProduct: 'Ürünü İncele',
      discountBadge: 'İndirim',
      inStock: 'Stokta',
      outOfStock: 'Tükendi',
      emptyCategoryTitle: 'Bu Kategori İlk Ürünlerini Bekliyor',
      emptyCategoryDesc:
        'Bu kategoride henüz ürün bulunmuyor. Mağaza yöneticisi panel üzerinden kolayca ürün, görsel ve fiyat ekleyebilir.',
      openAdminHint: 'Yönetim Panelinden Ürün Ekle',
      backToProducts: 'Ürünlere Dön',
      featuresTitle: 'Özellikler',
      howToUseTitle: 'Nasıl Kullanılır',
      quantityLabel: 'Adet',
      orderNow: 'Şimdi Sipariş Ver',
      suggestedTitle: 'Size Özel Öneriler',
      saveAmount: 'Kazanç',
    },
    order: {
      title: 'Sipariş Formu',
      subtitle: 'Teslimat bilgilerinizi eksiksiz doldurun, siparişinizi hızla onaylayalım.',
      fullName: 'Ad Soyad',
      phone: 'Telefon Numarası',
      country: 'Ülke',
      governorate: 'İl / Eyalet',
      city: 'Şehir / İlçe',
      district: 'Mahalle / Semt',
      detailedAddress: 'Açık Adres',
      product: 'Ürün',
      quantity: 'Adet',
      notes: 'Ek Notlar (İsteğe bağlı)',
      totalEstimate: 'Tahmini Toplam',
      submit: 'Siparişi Gönder',
      submitting: 'Sipariş gönderiliyor...',
      requiredError: 'Lütfen tüm zorunlu alanları doldurun.',
      successTitle: 'Siparişiniz Başarıyla Alındı',
      successDesc:
        'ELHAM BEAUTY tercih ettiğiniz için teşekkür ederiz. Siparişiniz kaydedildi, ekibimiz en kısa sürede sizinle iletişime geçecektir.',
      orderNumberLabel: 'Sipariş Numarası',
      sendWhatsapp: 'Siparişi WhatsApp ile İlet',
      close: 'Kapat',
      customProductPlaceholder: 'Talep edilen ürün adını yazın',
    },
    newsletter: {
      emailPlaceholder: 'E-posta adresinizi girin',
      subscribe: 'Abone Ol',
      subscribing: 'Kaydediliyor...',
      successMsg: 'ELHAM BEAUTY bültenine başarıyla abone oldunuz.',
      alreadyMsg: 'Bu e-posta adresi zaten bültenimize kayıtlı.',
      invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.',
    },
    joinTeam: {
      badge: 'Ekip Başvurusu',
      fullName: 'Ad Soyad',
      phone: 'Telefon / WhatsApp Numarası',
      country: 'Ülke',
      city: 'Şehir (Her şehirden başvuru)',
      cityPlaceholder: 'Örn: İstanbul, Ankara, Gaziantep, İzmir...',
      interestArea: 'İlgi Alanı / Deneyim',
      interestOptions: [
        'Satış, Pazarlama ve Dağıtım',
        'İçerik Üretimi ve Tanıtım',
        'Şehrimde Temsilci / İş Ortağı',
        'Genel Ekip Başvurusu',
      ],
      notes: 'Kısa Not veya Ek Bilgi (İsteğe bağlı)',
      submitting: "Form kaydediliyor ve WhatsApp'a aktarılıyor...",
      requiredError: 'Lütfen ad soyad, telefon, ülke ve şehir alanlarını doldurun.',
      successTitle: 'Başvurunuz Alındı',
      successDesc:
        'ELHAM BEAUTY ekibine başvurduğunuz için teşekkürler. Şimdi doğrudan ELHAM BEAUTY WhatsApp hattına yönlendiriliyorsunuz.',
      appNumberLabel: 'Başvuru No',
      openWhatsappNow: "ELHAM BEAUTY WhatsApp'a Geç",
      copyMessage: 'Mesajı Kopyala',
      copiedMessage: 'Mesaj Kopyalandı',
      messagePreviewLabel: 'WhatsApp Mesaj Önizlemesi',
      applyAgain: 'Yeni Başvuru Gönder',
      navLabel: 'Ekibimize Katılın',
    },
    advisor: {
      title: 'Güzellik ve Parfüm Danışmanı',
      subtitle: 'Parfüm, yüz kremi, saç serumu ve kişisel bakım rehberi',
      placeholder: 'Parfüm, yüz kremi, saç serumu veya vücut bakımı hakkında sorun...',
      send: 'Gönder',
      thinking: 'Derin analiz yapılıyor...',
      welcome:
        'ELHAM BEAUTY özel danışmanına hoş geldiniz. Cilt veya saç bakım ihtiyacınızı ya da sevdiğiniz koku notalarını paylaşın, size en uygun seçimleri önereyim.',
      quickPrompts: [
        'Cilt tipi ve saç yapısına göre yüz kremi ve saç serumu rutini önerir misin?',
        'Günlük kullanıma uygun zarif kadın parfüm notaları neler?',
        'Vücut şekillendirme ve bakım rutininde nelere dikkat etmeliyim?',
      ],
    },
    admin: {
      gateTitle: 'ELHAM BEAUTY Yönetim Paneli',
      setupTitle: 'Yönetim Şifresi Oluştur',
      setupSubtitle: 'Mağaza ürünlerini, içeriklerini ve siparişleri korumak için özel şifre belirleyin.',
      loginSubtitle: 'Devam etmek için yönetim şifrenizi girin.',
      passwordLabel: 'Şifre',
      confirmPasswordLabel: 'Şifreyi Onayla',
      setupButton: 'Paneli Aktifleştir',
      loginButton: 'Panele Giriş Yap',
      backToStore: 'Mağazaya Dön',
      logout: 'Çıkış Yap',
      tabs: {
        products: 'Ürünler',
        categories: 'Kategoriler',
        offers: 'Fırsatlar',
        reviews: 'Müşteri Yorumları',
        siteTexts: 'Metin & Görseller',
        settings: 'İletişim & Güvenlik',
        orders: 'Siparişler',
        teamApplications: 'Ekip Başvuruları',
        subscribers: 'Bülten Aboneleri',
      },
      teamStatuses: {
        new: 'Yeni',
        reviewed: 'İncelendi',
        accepted: 'Kabul Edildi',
        archived: 'Arşivlendi',
      },
      actions: {
        add: 'Yeni Ekle',
        save: 'Değişiklikleri Kaydet',
        saving: 'Kaydediliyor...',
        edit: 'Düzenle',
        delete: 'Sil',
        confirmDelete: 'Silmeyi Onayla',
        cancel: 'İptal',
        uploadImage: 'Görsel Yükle',
        uploading: 'Yükleniyor...',
        aiGenerate: 'Yapay Zeka ile Yaz & Çevir',
        aiGenerating: 'Hazırlanıyor...',
        exportCsv: 'CSV İndir',
        copyEmails: 'E-postaları Kopyala',
        copied: 'Kopyalandı',
        savedToast: 'Başarıyla kaydedildi',
      },
      statuses: {
        new: 'Yeni',
        processing: 'Hazırlanıyor',
        shipped: 'Kargoda',
        completed: 'Tamamlandı',
        cancelled: 'İptal Edildi',
      },
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      offers: 'Offers',
      reviews: 'Reviews',
      contact: 'Contact',
      admin: 'Admin Dashboard',
      advisor: 'Beauty Advisor',
    },
    home: {
      viewAllProducts: 'View All Products',
      exploreCatalog: 'Explore Categories',
      openAdvisor: 'Consult Beauty Advisor',
      bestSellersEmptyTitle: 'Best Sellers Collection Coming Soon',
      bestSellersEmptyDesc:
        'No products are published yet. Add products and flag Best Sellers from the Admin Dashboard to showcase them here.',
      latestEmptyTitle: 'New Arrivals Are Being Curated',
      latestEmptyDesc:
        'Browse our signature categories or join our newsletter below to be notified as soon as new editions arrive.',
      offersEmptyTitle: 'Exclusive Offers Coming Soon',
      offersEmptyDesc:
        'Seasonal promotions and curated gift sets will appear here as soon as they are published in the Admin Dashboard.',
      reviewsEmptyTitle: 'Awaiting Verified Client Impressions',
      reviewsEmptyDesc:
        'We publish only authentic client feedback. Verified reviews can be added directly from the Admin Dashboard.',
      browseOffersProducts: 'Browse Products',
      followTikTok: 'Follow on TikTok',
      followInstagram: 'Follow on Instagram',
      followFacebook: 'Follow on Facebook',
      officialAccount: 'Official Channel',
      callOrWhatsapp: 'Phone & WhatsApp',
      whatsappDirect: 'Chat on WhatsApp',
      directCall: 'Call Directly',
      brandLabel: 'Brand Name',
    },
    products: {
      title: 'ELHAM BEAUTY Collection',
      subtitle:
        'Explore luxury perfumes, face creams, nourishing hair serums, body sculpting & slimming products, and cosmetics.',
      allCategories: 'All',
      searchPlaceholder: 'Search by product name or notes...',
      sortNewest: 'Newest',
      sortBest: 'Best Sellers',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      viewProduct: 'View Product',
      discountBadge: 'Off',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      emptyCategoryTitle: 'This Category Awaits Its First Editions',
      emptyCategoryDesc:
        'No products have been added to this category yet. Store owners can add products, photos, and TRY prices in the Admin Dashboard.',
      openAdminHint: 'Manage Catalog in Admin',
      backToProducts: 'Back to Products',
      featuresTitle: 'Highlights & Benefits',
      howToUseTitle: 'How to Use',
      quantityLabel: 'Quantity',
      orderNow: 'Order Now',
      suggestedTitle: 'You May Also Love',
      saveAmount: 'Save',
    },
    order: {
      title: 'Complete Your Order',
      subtitle: 'Provide your delivery details below and our team will confirm your order promptly.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      country: 'Country',
      governorate: 'Governorate / Province',
      city: 'City',
      district: 'District / Area',
      detailedAddress: 'Detailed Address',
      product: 'Product',
      quantity: 'Quantity',
      notes: 'Additional Notes (Optional)',
      totalEstimate: 'Estimated Total',
      submit: 'Submit Order',
      submitting: 'Submitting order...',
      requiredError: 'Please complete all required delivery and contact fields.',
      successTitle: 'Order Received Successfully',
      successDesc:
        'Thank you for choosing ELHAM BEAUTY. Your order has been saved and our team will contact you shortly.',
      orderNumberLabel: 'Order Number',
      sendWhatsapp: 'Send Order Details via WhatsApp',
      close: 'Close',
      customProductPlaceholder: 'Enter requested product name',
    },
    newsletter: {
      emailPlaceholder: 'Enter your email address',
      subscribe: 'Subscribe',
      subscribing: 'Subscribing...',
      successMsg: 'Thank you for subscribing to ELHAM BEAUTY updates.',
      alreadyMsg: 'This email address is already subscribed.',
      invalidEmail: 'Please enter a valid email address.',
    },
    joinTeam: {
      badge: 'Team Application',
      fullName: 'Full Name',
      phone: 'Phone / WhatsApp Number',
      country: 'Country',
      city: 'City (Any City)',
      cityPlaceholder: 'e.g. Istanbul, Ankara, Dubai, Riyadh...',
      interestArea: 'Area of Interest',
      interestOptions: [
        'Sales, Marketing & Distribution',
        'Content Creation & Promotion',
        'Local Representative in My City',
        'General Team Inquiry',
      ],
      notes: 'Brief Bio or Notes (Optional)',
      submitting: 'Saving application and opening WhatsApp...',
      requiredError: 'Please fill in your full name, phone, country, and city.',
      successTitle: 'Application Submitted',
      successDesc:
        'Thank you for applying to join ELHAM BEAUTY. You are now being transferred to ELHAM BEAUTY WhatsApp to connect directly.',
      appNumberLabel: 'Application Ref',
      openWhatsappNow: 'Continue to ELHAM BEAUTY WhatsApp',
      copyMessage: 'Copy Message',
      copiedMessage: 'Copied',
      messagePreviewLabel: 'Formatted WhatsApp Message',
      applyAgain: 'Submit Another Application',
      navLabel: 'Join Our Team',
    },
    advisor: {
      title: 'Beauty & Fragrance Advisor',
      subtitle: 'Tailored guidance for perfumes, face creams, hair serums & care',
      placeholder: 'Ask about perfumes, face creams, hair serums, or body care...',
      send: 'Send',
      thinking: 'Thinking deeply...',
      welcome:
        'Welcome to your private ELHAM BEAUTY consultation. Share your skin, hair, or body care goals or preferred scent notes for thoughtful tailored guidance.',
      quickPrompts: [
        'Suggest a gentle face cream and nourishing hair serum routine',
        'Which soft floral fragrance notes work best for everyday wear?',
        'What should I consider when choosing body shaping or slimming care?',
      ],
    },
    admin: {
      gateTitle: 'ELHAM BEAUTY Admin Studio',
      setupTitle: 'Create Admin Password',
      setupSubtitle: 'Set a private password to secure your catalog, site content, and customer orders.',
      loginSubtitle: 'Enter your store admin password to manage ELHAM BEAUTY.',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      setupButton: 'Activate Dashboard',
      loginButton: 'Sign In to Dashboard',
      backToStore: 'Back to Storefront',
      logout: 'Sign Out',
      tabs: {
        products: 'Products',
        categories: 'Categories',
        offers: 'Offers',
        reviews: 'Reviews',
        siteTexts: 'Texts & Banners',
        settings: 'Contact & Security',
        orders: 'Orders',
        teamApplications: 'Team Applications',
        subscribers: 'Newsletter',
      },
      teamStatuses: {
        new: 'New',
        reviewed: 'Reviewed',
        accepted: 'Accepted',
        archived: 'Archived',
      },
      actions: {
        add: 'Add New',
        save: 'Save Changes',
        saving: 'Saving...',
        edit: 'Edit',
        delete: 'Delete',
        confirmDelete: 'Confirm Delete',
        cancel: 'Cancel',
        uploadImage: 'Upload Image',
        uploading: 'Uploading...',
        aiGenerate: 'Draft & Translate with AI',
        aiGenerating: 'Drafting...',
        exportCsv: 'Export CSV',
        copyEmails: 'Copy Emails',
        copied: 'Copied',
        savedToast: 'Changes saved',
      },
      statuses: {
        new: 'New',
        processing: 'Processing',
        shipped: 'Shipped',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
    },
  },
} as const;

export function getStatusLabel(status: OrderStatus, lang: Language): string {
  return UI_STRINGS[lang].admin.statuses[status];
}

export function getTeamStatusLabel(status: TeamApplicationStatus, lang: Language): string {
  return UI_STRINGS[lang].admin.teamStatuses[status];
}

export function formatTeamApplicationMessage(params: {
  applicationNumber: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  interestArea: string;
  notes: string;
  lang: Language;
}): string {
  if (params.lang === 'ar') {
    return `مرحباً ELHAM BEAUTY 🤍\nطلب انضمام لفريق الهام بيوتي (${params.applicationNumber})\nالاسم: ${params.fullName}\nرقم الهاتف: ${params.phone}\nالدولة: ${params.country}\nالمدينة: ${params.city}${
      params.interestArea ? `\nمجال الاهتمام: ${params.interestArea}` : ''
    }${params.notes ? `\nملاحظات: ${params.notes}` : ''}`;
  }
  if (params.lang === 'tr') {
    return `Merhaba ELHAM BEAUTY\nEkip Başvurusu (${params.applicationNumber})\nAd Soyad: ${params.fullName}\nTelefon: ${params.phone}\nÜlke: ${params.country}\nŞehir: ${params.city}${
      params.interestArea ? `\nİlgi Alanı: ${params.interestArea}` : ''
    }${params.notes ? `\nNot: ${params.notes}` : ''}`;
  }
  return `Hello ELHAM BEAUTY\nTeam Application (${params.applicationNumber})\nName: ${params.fullName}\nPhone: ${params.phone}\nCountry: ${params.country}\nCity: ${params.city}${
    params.interestArea ? `\nInterest: ${params.interestArea}` : ''
  }${params.notes ? `\nNotes: ${params.notes}` : ''}`;
}

export function buildWhatsAppTeamApplicationUrl(params: {
  storePhone: string;
  applicationNumber: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  interestArea: string;
  notes: string;
  lang: Language;
}): string {
  const digits = cleanPhoneForWhatsApp(params.storePhone) || '905385047543';
  const text = formatTeamApplicationMessage(params);
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppOrderUrl(params: {
  storePhone: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  district: string;
  detailedAddress: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  notes: string;
  lang: Language;
}): string {
  const digits = cleanPhoneForWhatsApp(params.storePhone) || '905385047543';
  const priceLine =
    params.totalPrice > 0 ? `\nTotal: ${formatTRY(params.totalPrice, params.lang)}` : '';
  const notesLine = params.notes ? `\nNotes: ${params.notes}` : '';

  const text =
    params.lang === 'ar'
      ? `مرحباً ELHAM BEAUTY 🤍\nطلب جديد رقم: ${params.orderNumber}\nالمنتج: ${params.productName}\nالكمية: ${params.quantity}${
          params.totalPrice > 0 ? `\nالإجمالي: ${formatTRY(params.totalPrice, 'ar')}` : ''
        }\n\nالاسم: ${params.fullName}\nالهاتف: ${params.phone}\nالعنوان: ${params.country} - ${params.governorate} - ${params.city} - ${params.district}\nالتفاصيل: ${params.detailedAddress}${
          params.notes ? `\nملاحظات: ${params.notes}` : ''
        }`
      : params.lang === 'tr'
      ? `Merhaba ELHAM BEAUTY\nYeni Sipariş No: ${params.orderNumber}\nÜrün: ${params.productName}\nAdet: ${params.quantity}${
          params.totalPrice > 0 ? `\nToplam: ${formatTRY(params.totalPrice, 'tr')}` : ''
        }\n\nAd Soyad: ${params.fullName}\nTelefon: ${params.phone}\nAdres: ${params.country}, ${params.governorate}, ${params.city}, ${params.district}\nAçık Adres: ${params.detailedAddress}${
          params.notes ? `\nNot: ${params.notes}` : ''
        }`
      : `Hello ELHAM BEAUTY\nNew Order: ${params.orderNumber}\nProduct: ${params.productName}\nQuantity: ${params.quantity}${priceLine}\n\nName: ${params.fullName}\nPhone: ${params.phone}\nAddress: ${params.country}, ${params.governorate}, ${params.city}, ${params.district}\nDetails: ${params.detailedAddress}${notesLine}`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
