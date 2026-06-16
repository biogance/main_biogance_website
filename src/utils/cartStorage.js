const KEY = "cartData";

export const saveCartData = (data) => {
  const json = JSON.stringify(data);
  try { localStorage.setItem(KEY, json); } catch {}
  try { sessionStorage.setItem(KEY, json); } catch {}
  // same tab mein storage event dispatch karo taake Navbar update ho
  try { window.dispatchEvent(new Event('storage')); } catch {}
};

export const getCartData = () => {
  try {
    const s = sessionStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch {}
  try {
    const l = localStorage.getItem(KEY);
    if (l) return JSON.parse(l);
  } catch {}
  return null;
};

/**
 * Create cart API ke response se naya item existing cart mein merge karke save karo.
 * newData = res.data.data  (cartItems array + cart_count)
 */
export const mergeCartItem = (newData) => {
  const existing = getCartData() || { cartItem: [], cart_count: 0 };
  const existingItems = (existing.cartItem || []).filter(Boolean);
  const newItems = (newData.cartItems || []).filter(Boolean);
  // Merge: existing items update karo agar same id ho, warna append karo
  const merged = [...existingItems];
  newItems.forEach((newItem) => {
    const idx = merged.findIndex((i) => i.id === newItem.id);
    if (idx !== -1) {
      merged[idx] = newItem;
    } else {
      merged.push(newItem);
    }
  });
  const result = { cartItem: merged, cart_count: newData.cart_count ?? existing.cart_count };
  saveCartData(result);
  return result;
};

export const clearCartData = () => {
  try { localStorage.removeItem(KEY); } catch {}
  try { sessionStorage.removeItem(KEY); } catch {}
};
