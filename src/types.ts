export type Language = 'ar' | 'tr' | 'en';

export interface LocalizedText {
  ar: string;
  tr: string;
  en: string;
}

export interface LocalizedList {
  ar: string[];
  tr: string[];
  en: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  sortOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  images: string[];
  name: LocalizedText;
  description: LocalizedText;
  features: LocalizedList;
  howToUse: LocalizedText;
  price: number;
  originalPrice: number | null;
  discountPercent: number;
  isBestSeller: boolean;
  isLatest: boolean;
  inStock: boolean;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  discountLabel: LocalizedText;
  image: string;
  linkedCategoryId: string;
  linkedProductId: string;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  district: string;
  detailedAddress: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: Language;
  subscribedAt: string;
}

export type TeamApplicationStatus = 'new' | 'reviewed' | 'accepted' | 'archived';

export interface TeamApplication {
  id: string;
  applicationNumber: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  interestArea: string;
  notes: string;
  language: Language;
  status: TeamApplicationStatus;
  createdAt: string;
}

export interface WhyPillar {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface SiteSettings {
  brandName: string;
  currencyCode: 'TRY';
  currencySymbol: string;
  heroImages: string[];
  promoBannerImage: string;
  whyUsImage: string;
  tiktokImage: string;
  heroEyebrow: LocalizedText;
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  heroCta: LocalizedText;
  bestSellersTitle: LocalizedText;
  bestSellersSubtitle: LocalizedText;
  latestTitle: LocalizedText;
  latestSubtitle: LocalizedText;
  offersTitle: LocalizedText;
  offersSubtitle: LocalizedText;
  whyTitle: LocalizedText;
  whySubtitle: LocalizedText;
  reviewsTitle: LocalizedText;
  reviewsSubtitle: LocalizedText;
  tiktokTitle: LocalizedText;
  tiktokSubtitle: LocalizedText;
  joinTeamTitle: LocalizedText;
  joinTeamSubtitle: LocalizedText;
  joinTeamCta: LocalizedText;
  contactTitle: LocalizedText;
  contactSubtitle: LocalizedText;
  newsletterTitle: LocalizedText;
  newsletterSubtitle: LocalizedText;
  footerTagline: LocalizedText;
  whyPillars: WhyPillar[];
  phone: string;
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
}

export interface PublicStorefrontData {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  offers: Offer[];
  reviews: Review[];
}

export interface AdminDashboardData extends PublicStorefrontData {
  orders: Order[];
  subscribers: NewsletterSubscriber[];
  teamApplications: TeamApplication[];
}
