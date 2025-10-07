const BASE = import.meta.env.VITE_API_URL;

export const apiGet = (path) => fetch(`${BASE}${path}`, {
  credentials: 'include', 
});
export const apiPost = (path, body) => 
  fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
