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

export default async function handler(req, res) {
  try {
    // Vercel 会填充 req.query；取不到时手动解析 req.url
    let q = req.query || {};
    if (Object.keys(q).length === 0) {
      const search = String(req.url || "").split("?")[1] || "";
      q = Object.fromEntries(new URLSearchParams(search));
    }

    const setCors = () => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
    };

    if (req.method === "OPTIONS") {
      setCors();
      return res.status(204).end();
    }
    if (req.method !== "GET") {
      setCors();
      return res.status(405).end();
    }

    const server = q.server || "netease";
    const type = q.type || "playlist";
    const id = q.id || "";
    const r = q.r || "";

    // 只代理歌单；url/pic/lrc 由浏览器直连 injahow
    if (type !== "playlist") {
      setCors();
      return res.status(404).json({ error: "only playlist is proxied" });
    }

    const target =
      `${UPSTREAM}?server=${encodeURIComponent(server)}` +
      `&type=playlist&id=${encodeURIComponent(id)}` +
      (r ? `&r=${encodeURIComponent(r)}` : "");

    const up = await fetch(target, { signal: AbortSignal.timeout(20000) });
    if (!up.ok) {
      setCors();
      return res.status(502).json({ error: `Upstream error: ${up.status}` });
    }
    const text = await up.text();
    setCors();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.status(200).send(text);
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: String(e.stack || "").split("\n").slice(0, 5) });
  }
}
