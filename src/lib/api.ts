import type {
  AdminDashboardData,
  Category,
  Language,
  Offer,
  Order,
  OrderStatus,
  Product,
  PublicStorefrontData,
  Review,
  SiteSettings,
  TeamApplication,
  TeamApplicationStatus,
} from '../types.ts';

const TOKEN_STORAGE_KEY = 'elham_beauty_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage limits
  }
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredAdminToken();
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchStorefront(): Promise<PublicStorefrontData> {
  return requestJson<PublicStorefrontData>('/api/storefront');
}

export async function submitOrder(payload: {
  fullName: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  district: string;
  detailedAddress: string;
  productId: string;
  productName: string;
  quantity: number;
  notes: string;
}): Promise<{ order: Order }> {
  return requestJson<{ order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function subscribeNewsletter(
  email: string,
  language: Language
): Promise<{ status: 'subscribed' | 'already_subscribed' }> {
  return requestJson<{ status: 'subscribed' | 'already_subscribed' }>('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email, language }),
  });
}

export async function submitTeamApplication(payload: {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  interestArea: string;
  notes: string;
  language: Language;
}): Promise<{ application: TeamApplication }> {
  return requestJson<{ application: TeamApplication }>('/api/team-applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function askBeautyAdvisor(payload: {
  message: string;
  language: Language;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<{ reply: string }> {
  return requestJson<{ reply: string }>('/api/ai/concierge', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Admin API
export async function fetchAdminAuthStatus(): Promise<{ hasPasswordConfigured: boolean }> {
  return requestJson<{ hasPasswordConfigured: boolean }>('/api/admin/auth-status');
}

export async function setupAdminPassword(password: string): Promise<{ token: string }> {
  return requestJson<{ token: string }>('/api/admin/setup-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function loginAdmin(password: string): Promise<{ token: string }> {
  return requestJson<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export async function changeAdminPassword(newPassword: string): Promise<{ token: string }> {
  return requestJson<{ token: string }>('/api/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/dashboard');
}

export async function uploadAdminImage(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('image', file);
  return requestJson<{ url: string }>('/api/admin/upload', {
    method: 'POST',
    body: form,
  });
}

export async function generateAdminCopy(payload: {
  mode: 'product' | 'offer' | 'siteText';
  prompt: string;
  sourceLang: Language;
}): Promise<{ generated: Record<string, unknown> }> {
  return requestJson<{ generated: Record<string, unknown> }>('/api/ai/copywriter', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createCategory(
  payload: Omit<Category, 'id' | 'slug'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  id: string,
  payload: Partial<Category>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function createProduct(
  payload: Omit<Product, 'id' | 'createdAt'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  id: string,
  payload: Omit<Product, 'id' | 'createdAt'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
}

export async function createOffer(
  payload: Omit<Offer, 'id' | 'createdAt'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/offers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateOffer(
  id: string,
  payload: Omit<Offer, 'id' | 'createdAt'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteOffer(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/offers/${id}`, {
    method: 'DELETE',
  });
}

export async function createReview(
  payload: Omit<Review, 'id' | 'createdAt'>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateReview(
  id: string,
  payload: Partial<Review>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
  });
}

export async function updateSettings(
  payload: Partial<SiteSettings>
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/orders/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteSubscriber(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/subscribers/${id}`, {
    method: 'DELETE',
  });
}

export async function updateTeamApplicationStatus(
  id: string,
  status: TeamApplicationStatus
): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/team-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteTeamApplication(id: string): Promise<AdminDashboardData> {
  return requestJson<AdminDashboardData>(`/api/admin/team-applications/${id}`, {
    method: 'DELETE',
  });
}
