/**
 * Vercel serverless function — 音乐播放器歌单代理。
 *
 * MetingJS 默认公共 API（api.i-meto.com）音频接口已失效（404/401），
 * 而可用的公共实例 api.injahow.cn 不带 CORS 头，浏览器直接请求会被拦截。
 *
 * 方案：只把「歌单请求」经本函数代理（同源 /api/meting → 无跨域问题），
 * 歌单返回的 url / pic / lrc 仍指向 injahow 直连——
 * 音频(<audio>)、封面(<img>) 播放本就不需要 CORS，
 * 同时绕开 Vercel 函数 4.5MB 响应体上限（歌曲 mp3 常超此值）。
 */
const UPSTREAM = "https://api.injahow.cn/meting/";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Cache-Control": "no-cache",
};

export default async function handler(req) {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405, headers: cors });
  }

  const server = url.searchParams.get("server") || "netease";
  const type = url.searchParams.get("type") || "playlist";
  const id = url.searchParams.get("id") || "";
  const r = url.searchParams.get("r") || "";

  // 只代理歌单；url/pic/lrc 由浏览器直连 injahow
  if (type !== "playlist") {
    return new Response("Not Found", { status: 404, headers: cors });
  }

  const target =
    `${UPSTREAM}?server=${encodeURIComponent(server)}` +
    `&type=playlist&id=${encodeURIComponent(id)}` +
    (r ? `&r=${encodeURIComponent(r)}` : "");

  try {
    const res = await fetch(target, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      return new Response(`Upstream error: ${res.status}`, { status: 502, headers: cors });
    }
    const data = await res.text();
    return new Response(data, {
      headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (e) {
    return new Response(`Proxy error: ${e.message}`, { status: 502, headers: cors });
  }
}
