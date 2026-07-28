// Simple in-memory caching layer for catalog products.
// This helps prevent redundant Firestore read queries, saves database read costs,
// and enables Stale-While-Revalidate (SWR) patterns for instant page rendering.

let cachedProducts = null;

/**
 * Retrieves the currently cached product list.
 * @returns {Array|null} Array of products, or null if cache is empty.
 */
export function getCachedProducts() {
  return cachedProducts;
}

/**
 * Updates the product list cache.
 * @param {Array|null} products - The array of products to cache.
 */
export function setCachedProducts(products) {
  cachedProducts = products;
}

/**
 * Invalidates and clears the product list cache.
 * This should be called whenever a product is added, updated, or deleted.
 */
export function clearProductCache() {
  cachedProducts = null;
}
