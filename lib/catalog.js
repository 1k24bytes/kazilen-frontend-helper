import servicesData from '../app/data/services.json';
import { API_BASE_URL, apiFetch } from './api';

const seedCategories = servicesData.categories || [];
const seedSubCategories = servicesData.subCategories || [];

function normalizeSeed() {
  return {
    categories: seedCategories.map((c, idx) => ({
      id: String(c.id),
      name: c.name || String(c.id),
      description: c.desc || c.description || null,
      image: c.image || null,
      is_active: true,
      sort_order: idx,
      sub_categories_count: 0,
    })),
    subCategories: seedSubCategories.map((s, idx) => ({
      id: String(s.id),
      category_id: String(s.categoryId || s.category_id),
      label: s.label || String(s.id),
      description: s.default_description || s.description || null,
      image: s.image || null,
      tag: s.tag || null,
      price_type: s.default_price_type || 'fixed',
      fixed_price: s.default_fixed_price ?? null,
      price_per_hour: s.default_price_per_hour ?? null,
      is_active: true,
      sort_order: idx,
    })),
  };
}

function normalizeApi(payload) {
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const subCategories = Array.isArray(payload?.sub_categories)
    ? payload.sub_categories
    : Array.isArray(payload?.subCategories)
      ? payload.subCategories
      : [];
  return { categories, subCategories };
}

export async function fetchCatalog() {
  try {
    const res = await apiFetch(`${API_BASE_URL}/catalog`);
    if (!res.ok) throw new Error(`catalog ${res.status}`);
    const data = await res.json();
    const normalized = normalizeApi(data);
    if (!normalized.categories.length && !normalized.subCategories.length) {
      return normalizeSeed();
    }
    return normalized;
  } catch {
    return normalizeSeed();
  }
}

export function getSeedCatalog() {
  return normalizeSeed();
}
