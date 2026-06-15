const KEY = "cartData";

export const saveCartData = (data) => {
  const json = JSON.stringify(data);
  try { localStorage.setItem(KEY, json); } catch {}
  try { sessionStorage.setItem(KEY, json); } catch {}
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

export const clearCartData = () => {
  try { localStorage.removeItem(KEY); } catch {}
  try { sessionStorage.removeItem(KEY); } catch {}
};
