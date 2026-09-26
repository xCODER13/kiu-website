import { vi } from 'vitest'

// URL + method bo'yicha soxta fetch. routes: { 'GET /news': body | (req)=>body | {status, body} }
// Har chaqiruv `calls` ga yoziladi: { url, method, headers, body }
export function mockApi(routes = {}) {
  const calls = []
  const fn = vi.fn((url, init = {}) => {
    const method = (init.method || 'GET').toUpperCase()
    const path = String(url).replace('http://api.test/api', '')
    calls.push({ url: String(url), path, method, headers: init.headers || {}, body: init.body })
    const key = `${method} ${path}`
    const route = routes[key]
    if (route === undefined) return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) })
    const r = typeof route === 'function' ? route({ path, method, body: init.body }) : route
    const res = r && typeof r === 'object' && 'status' in r && 'body' in r ? r : { status: 200, body: r }
    return Promise.resolve({ ok: res.status >= 200 && res.status < 300, status: res.status, json: () => Promise.resolve(res.body) })
  })
  vi.stubGlobal('fetch', fn)
  return { calls, fn, find: (method, path) => calls.filter(c => c.method === method && c.path === path) }
}

// Kartadagi tugmalarni topish: matn elementidan yuqoriga ko'tarilib, >=2 tugmasi bor konteynerni oladi
export function rowOf(el) {
  let n = el
  while (n && n.querySelectorAll('button').length < 2) n = n.parentElement
  return n
}

// Berilgan selektor birinchi marta topiladigan eng yaqin ota-element (masalan, qatorda <select> bo'lsa)
export function rowWith(el, selector) {
  let n = el
  while (n && !n.querySelector(selector)) n = n.parentElement
  return n
}
