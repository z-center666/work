'use strict';

/* =========================================================
   视频收藏 · 纯手机端收藏 PWA
   - 收藏与文案都存本机 localStorage
   - 解析：第三方公开接口；下载：浏览器直连
   - 转写/总结：硅基流动（用户自己的免费 Key）
   - 同步：飞书多维表格自动化 Webhook（可选）
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);

const LS_ITEMS = 'douyin.pocket.items.v1';
const LS_SETTINGS = 'douyin.pocket.settings.v1';
const MAX_ITEMS = 500;
const MAX_BATCH_ADD = 100;
const PARSE_URL_TTL = 6 * 60 * 60 * 1000;

const PLATFORMS = {
  douyin: { name: '抖音', api: 'douyin' },
  kuaishou: { name: '快手', api: 'kuaishou' },
  xhs: { name: '小红书', api: 'xhs' },
  bilibili: { name: '哔哩哔哩', api: 'bilibili' },
  wechat: { name: '视频号', api: '' },
  direct: { name: '视频直链', api: '' },
  unknown: { name: '未识别', api: '' }
};

const DEFAULT_SETTINGS = {
  asrKey: '',
  asrModel: 'FunAudioLLM/SenseVoiceSmall',
  chatModel: 'Qwen/Qwen2.5-7B-Instruct',
  webhook: '',
  webhookToken: '',
  autoSync: 'off',
  iosSave: 'share',
  feishuReadUrl: '',
  feishuReadToken: '',
  autoPullFeishu: 'open',
  feishuPulledAt: 0,
  feishuLastSummary: ''
};

const ASR_ENDPOINT = 'https://api.siliconflow.cn/v1/audio/transcriptions';
const MODELS_ENDPOINT = 'https://api.siliconflow.cn/v1/models';
const CHAT_ENDPOINT = 'https://api.siliconflow.cn/v1/chat/completions';
const ASR_DEFAULT_MODEL = 'FunAudioLLM/SenseVoiceSmall';
const ASR_TARGET_RATE = 16000;
const ASR_CHUNK_SECONDS = 240;
const MAX_MEDIA_SECONDS = 30 * 60;

const state = {
  items: [],
  settings: { ...DEFAULT_SETTINGS },
  filter: 'all',
  query: '',
  expanded: new Set(),
  queue: [],
  queueRunning: false,
  busyId: '',
  notes: new Map(),
  syncing: new Set(),
  syncAllRunning: false
};

const el = {};

const isIOS = (() => {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
})();

const canNativeShareFiles = (() => {
  try { return !!(navigator.canShare && navigator.share); } catch (_) { return false; }
})();

const canShareToAlbum = isIOS && isSecureContext && canNativeShareFiles;

/* ---------------- 基础工具 ---------------- */

function safeJsonParse(text, fallback) {
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function readableText(...values) {
  const text = firstString(...values);
  if (!text) return '';
  if (/^[.。·…\s\-—_~]+$/.test(text)) return '';
  return text;
}

function genId() {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatSize(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';
  if (value >= 1024 * 1024 * 1024) return (value / 1024 / 1024 / 1024).toFixed(2) + 'GB';
  if (value >= 1024 * 1024) return (value / 1024 / 1024).toFixed(1) + 'MB';
  if (value >= 1024) return Math.round(value / 1024) + 'KB';
  return Math.round(value) + 'B';
}

function formatDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return '';
  const total = Math.round(value);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function formatTimeAgo(timestamp) {
  const ts = Number(timestamp) || 0;
  if (!ts) return '';
  const diff = Date.now() - ts;
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' 分钟前';
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + ' 小时前';
  if (diff < 48 * 60 * 60 * 1000) return '昨天';
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTimeText(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatFileStamp(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function sanitizeFilename(value, fallback = '视频') {
  const cleaned = String(value || '')
    .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
    .replace(/#/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 56);
  return cleaned || fallback;
}

function trimUrl(url) {
  return String(url || '')
    .replace(/^[<（(【\[]+/, '')
    .replace(/[）)】\]>，。；、,.;!?！？'"”’]+$/, '');
}

function normalizeUrl(value) {
  let url = trimUrl(value);
  if (!url) return '';
  if (url.startsWith('//')) url = 'https:' + url;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) return '';
    return parsed.href;
  } catch (_) {
    return '';
  }
}

function extractUrl(text) {
  if (!text) return '';
  const cleaned = String(text).replace(/[\u200b-\u200f\ufeff]/g, '');
  const full = cleaned.match(/https?:\/\/[^\s"'<>，。；、）】》]+/i);
  if (full) return normalizeUrl(full[0]);

  const bare = cleaned.match(/(?:v\.douyin\.com|v\.kuaishou\.com|xhslink\.com|www\.xiaohongshu\.com|xiaohongshu\.com|channels\.weixin\.qq\.com|weixin\.qq\.com\/sph|b23\.tv|bilibili\.com|v\.m\.chenzhongtech\.com)\/[^\s"'<>，。；、）】》]+/i);
  if (bare) return normalizeUrl(bare[0]);
  return '';
}

function extractUrls(text) {
  if (!text) return [];
  const cleaned = String(text).replace(/[\u200b-\u200f\ufeff]/g, '');
  const seen = new Set();
  const urls = [];
  const push = candidate => {
    const url = normalizeUrl(candidate);
    if (!url) return;
    const key = linkKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    urls.push(url);
  };

  const fullRe = /https?:\/\/[^\s"'<>，。；、）】》]+/gi;
  let match;
  while ((match = fullRe.exec(cleaned))) push(match[0]);

  const bareRe = /(?:v\.douyin\.com|v\.kuaishou\.com|xhslink\.com|www\.xiaohongshu\.com|xiaohongshu\.com|channels\.weixin\.qq\.com|weixin\.qq\.com\/sph|b23\.tv|bilibili\.com|v\.m\.chenzhongtech\.com)\/[^\s"'<>，。；、）】》]+/gi;
  while ((match = bareRe.exec(cleaned))) push(match[0]);
  return urls;
}

function detectPlatform(url) {
  if (!url) return 'unknown';
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch (_) { return 'unknown'; }
  if (/(^|\.)douyin\.com$/.test(host) || host.endsWith('iesdouyin.com')) return 'douyin';
  if (/(^|\.)kuaishou\.com$/.test(host) || host.endsWith('chenzhongtech.com') || host.endsWith('kwai.com') || host.endsWith('gifshow.com')) return 'kuaishou';
  if (host === 'xhslink.com' || host.endsWith('xiaohongshu.com')) return 'xhs';
  if (host === 'channels.weixin.qq.com' || (host.endsWith('weixin.qq.com') && /\/sph|finder|channels/i.test(url))) return 'wechat';
  if (host.endsWith('bilibili.com') || host === 'b23.tv') return 'bilibili';
  if (/\.(mp4|mov|m4v|webm)(\?|$)/i.test(url) || /mime_type=video/i.test(url)) return 'direct';
  return 'unknown';
}

function platformName(platform) {
  return (PLATFORMS[platform] || PLATFORMS.unknown).name;
}

function linkKey(url) {
  try {
    const parsed = new URL(url);
    return (parsed.hostname + parsed.pathname).replace(/\/+$/, '').toLowerCase();
  } catch (_) {
    return String(url || '').toLowerCase();
  }
}

function pageUrl() {
  return location.origin + location.pathname;
}

/* ---------------- 错误文案 ---------------- */

class AppError extends Error {
  constructor(message, code = '') {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

function safeMessage(error) {
  const raw = error && error.message ? String(error.message) : '';
  if (raw && /[\u4e00-\u9fa5]/.test(raw)) return raw;
  return '处理失败，请稍后重试';
}

function httpMessage(status) {
  if (status === 401 || status === 403) return '接口拒绝了请求，可能需要登录或密钥';
  if (status === 404) return '接口不存在或作品已删除';
  if (status === 429) return '请求过于频繁，请稍后再试';
  if (status >= 500) return '解析服务暂时不可用，请稍后重试';
  return `解析服务返回异常（${status}）`;
}

function zhError(message) {
  const text = firstString(message);
  if (!text) return '';
  if (/xsec_token|xsec-token/i.test(text)) {
    return '小红书需要带 xsec_token 的完整链接：在小红书里打开笔记，复制完整链接后粘贴';
  }
  if (/rate.?limit|too many|throttl/i.test(text)) return '请求过于频繁，请稍后再试';
  if (/cookie|login|log in|session|unauthor/i.test(text)) return '该平台需要登录态，公开接口暂时不可用';
  if (/not found|deleted|removed|不存在/i.test(text)) return '作品不存在或已被删除';
  if (/timeout|timed out/i.test(text)) return '解析超时，请稍后重试';
  if (/unsupported|not support|invalid url/i.test(text)) return '该链接暂不支持解析';
  if (/param|required|missing/i.test(text)) return '链接格式不完整，请粘贴完整的分享链接';
  if (/network|failed to fetch|load failed/i.test(text)) return '网络连接失败，请检查网络后重试';
  if (!/[\u4e00-\u9fa5]/.test(text) && /^[\x20-\x7e]+$/.test(text)) {
    return '解析服务暂时不可用，请稍后重试';
  }
  return text;
}

/* ---------------- 本机存取 ---------------- */

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const url = normalizeUrl(raw.url || raw.sourceUrl || raw['视频链接'] || '');
  if (!url) return null;
  const addedAt = Number(raw.addedAt) || Date.now();
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : genId(),
    url,
    platform: raw.platform || detectPlatform(url),
    title: firstString(raw.title) || '',
    desc: firstString(raw.desc) || '',
    author: firstString(raw.author) || '',
    cover: normalizeUrl(raw.cover || ''),
    duration: Number(raw.duration) || 0,
    videoUrl: normalizeUrl(raw.videoUrl || ''),
    videoUrlAt: Number(raw.videoUrlAt) || 0,
    transcript: typeof raw.transcript === 'string' ? raw.transcript : '',
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    addedAt,
    updatedAt: Number(raw.updatedAt) || addedAt,
    source: firstString(raw.source) || 'paste',
    syncState: ['done', 'unconfirmed', 'error'].includes(raw.syncState) ? raw.syncState : 'none',
    syncedAt: Number(raw.syncedAt) || 0,
    syncError: firstString(raw.syncError) || '',
    error: firstString(raw.error) || ''
  };
}

function loadItems() {
  const saved = safeJsonParse(localStorage.getItem(LS_ITEMS) || '[]', []);
  const list = Array.isArray(saved) ? saved : [];
  state.items = list
    .map(normalizeItem)
    .filter(Boolean)
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, MAX_ITEMS);
}

function persistItems() {
  try {
    localStorage.setItem(LS_ITEMS, JSON.stringify(state.items));
    return true;
  } catch (_) {
    showToast('本机存储空间不足，请先导出备份并删除一些收藏');
    return false;
  }
}

function loadSettings() {
  const saved = safeJsonParse(localStorage.getItem(LS_SETTINGS) || '{}', {});
  state.settings = { ...DEFAULT_SETTINGS, ...(saved && typeof saved === 'object' ? saved : {}) };
  if (!['off', 'add', 'text'].includes(state.settings.autoSync)) state.settings.autoSync = 'off';
  if (!['share', 'download'].includes(state.settings.iosSave)) state.settings.iosSave = 'share';
  if (!['open', 'off'].includes(state.settings.autoPullFeishu)) state.settings.autoPullFeishu = 'open';
}

function persistSettings() {
  try { localStorage.setItem(LS_SETTINGS, JSON.stringify(state.settings)); } catch (_) {}
}

function findItem(id) {
  return state.items.find(item => item.id === id) || null;
}

function touch(item) {
  item.updatedAt = Date.now();
}

/* ---------------- 解析 ---------------- */

async function requestJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 40000);
  let response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
      credentials: 'omit',
      mode: 'cors',
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timer);
    if (error && error.name === 'AbortError') throw new AppError('解析超时，请稍后重试');
    throw new AppError('网络连接失败，请检查网络后重试');
  }
  clearTimeout(timer);

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = firstString(data.retdesc, data.msg, data.message, data.error);
    } catch (_) {}
    throw new AppError(detail ? zhError(detail) : httpMessage(response.status), String(response.status));
  }

  try {
    return await response.json();
  } catch (_) {
    throw new AppError('解析服务返回了无法识别的数据');
  }
}

function pickVideoUrl(data) {
  const direct = [
    data.video_url, data.videoUrl, data.play_url, data.playUrl,
    data.download_url, data.downloadUrl, data.mp4, data.video
  ];
  let chosen = '';
  for (const item of direct) {
    if (typeof item === 'string' && /^https?:\/\//i.test(item)) { chosen = item; break; }
    if (item && typeof item === 'object' && typeof item.url === 'string') { chosen = item.url; break; }
  }
  if (!chosen && typeof data.url === 'string' &&
      /^https?:\/\//i.test(data.url) &&
      !/\.(jpg|jpeg|png|webp|heic)(\?|$)/i.test(data.url)) {
    chosen = data.url;
  }

  const backups = Array.isArray(data.video_backup) ? data.video_backup
    : Array.isArray(data.videoBackup) ? data.videoBackup : [];
  const bestBackup = backups
    .filter(item => item && typeof item.url === 'string')
    .sort((a, b) => (Number(b.bit_rate || b.size) || 0) - (Number(a.bit_rate || a.size) || 0))[0];

  if (chosen && bestBackup && /api-play|play\/\?/i.test(chosen)) chosen = bestBackup.url;
  if (!chosen && bestBackup) chosen = bestBackup.url;
  return { url: normalizeUrl(chosen), backup: bestBackup || null };
}

function pickAuthor(data) {
  const raw = data.author || data.user || data.owner || {};
  let name = '';
  let avatar = '';
  if (typeof raw === 'string') {
    name = raw;
  } else if (raw && typeof raw === 'object') {
    name = firstString(raw.nickname, raw.name, raw.title, raw.user_name, raw.userName);
    avatar = firstString(raw.avatar, raw.avatar_url, raw.avatarUrl, raw.head_url, raw.headUrl);
  }
  if (!name) name = firstString(data.nickname, data.author_name, data.authorName, data.user_name, data.userName);
  if (!avatar) avatar = firstString(data.avatar, data.author_avatar, data.authorAvatar);
  return { name, avatar: normalizeUrl(avatar) };
}

function normalizeParsed(data, platform, sourceUrl) {
  if (!data || typeof data !== 'object') {
    throw new AppError('解析服务没有返回作品信息');
  }
  if (data.data && typeof data.data === 'object') data = data.data;
  if (Array.isArray(data)) data = data[0] || {};

  const video = pickVideoUrl(data);
  const author = pickAuthor(data);
  const title = readableText(data.title, data.desc, data.description, data.text, data.caption)
    || (platform === 'unknown' ? '未命名作品' : platformName(platform) + '作品');
  const desc = readableText(data.desc, data.description);
  const cover = normalizeUrl(firstString(
    data.cover_url, data.coverUrl, data.cover, data.origin_cover,
    data.thumbnail, data.thumbnail_url, author.avatar
  ));
  const duration = Number(data.duration || (data.duration_ms ? data.duration_ms / 1000 : 0)) || 0;
  const awemeId = firstString(
    data.aweme_id, data.awemeId, data.item_id, data.itemId,
    (sourceUrl.match(/\/(?:video|note|item)\/(\d{6,})/) || [])[1]
  );

  if (!video.url) {
    throw new AppError('没有找到可下载的视频（可能是图文作品）');
  }

  return {
    platform,
    title,
    desc: desc && desc !== title ? desc : '',
    author: author.name,
    cover: cover || author.avatar,
    videoUrl: video.url,
    duration,
    awemeId
  };
}

function mapBugpkMessage(message) {
  const msg = zhError(message);
  if (!msg) return '解析失败，请稍后重试';
  if (/源异常/.test(msg)) return '解析接口暂时异常，请稍后重试';
  return msg;
}

async function parseWithBugpk(url, platform) {
  const api = (PLATFORMS[platform] || {}).api;
  if (!api) throw new AppError(platform === 'wechat' ? '视频号需要微信登录态，暂时无法解析' : '该平台暂不支持解析');
  const endpoint = `https://api.bugpk.com/api/${api}?url=${encodeURIComponent(url)}`;
  const json = await requestJson(endpoint, { timeout: 40000 });
  if (!json || Number(json.code) !== 200) {
    throw new AppError(mapBugpkMessage(json && json.msg), json && json.code);
  }
  return normalizeParsed(json.data, platform, url);
}

async function parseLink(rawText) {
  const url = extractUrl(rawText);
  if (!url) throw new AppError('没有识别到链接，请粘贴完整的分享链接');
  const platform = detectPlatform(url);

  if (platform === 'direct') {
    let title = '视频直链';
    try {
      const name = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
      if (name) title = name.replace(/\.[a-z0-9]{2,5}$/i, '');
    } catch (_) {}
    return {
      platform,
      title,
      desc: '',
      author: '',
      cover: '',
      videoUrl: url,
      duration: 0,
      awemeId: ''
    };
  }

  if (platform === 'unknown') {
    throw new AppError('没有识别到视频链接，请粘贴抖音、快手、小红书等平台的分享链接');
  }

  return parseWithBugpk(url, platform);
}

async function ensureParsed(item, progress, force = false) {
  const fresh = item.videoUrl && (Date.now() - item.videoUrlAt) < PARSE_URL_TTL;
  if (!force && fresh) return;
  if (progress) progress('正在读取视频信息…');
  const parsed = await parseLink(item.url);
  item.title = parsed.title || item.title;
  item.desc = parsed.desc || item.desc;
  item.author = parsed.author || item.author;
  item.cover = parsed.cover || item.cover;
  item.duration = parsed.duration || item.duration;
  item.platform = parsed.platform || item.platform;
  item.videoUrl = parsed.videoUrl || item.videoUrl;
  if (parsed.videoUrl) item.videoUrlAt = Date.now();
  item.awemeId = parsed.awemeId || item.awemeId || '';
  item.error = '';
  touch(item);
  persistItems();
}

/* ---------------- 下载与保存 ---------------- */

async function downloadBlob(url, { onProgress } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 600000);
  let response;
  try {
    response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timer);
    if (error && error.name === 'AbortError') {
      throw new AppError('下载超时，请检查网络后重试');
    }
    throw new AppError('浏览器无法直接下载这个视频地址，可点「打开原文」后在原 App 里保存');
  }

  try {
    if (!response.ok) {
      throw new AppError(
        response.status === 403 ? '视频地址已过期，请点「重新解析」后再试' : httpMessage(response.status),
        String(response.status)
      );
    }

    const total = Number(response.headers.get('content-length')) || 0;
    const type = response.headers.get('content-type') || '';
    if (type.includes('text/html')) {
      throw new AppError('视频地址已失效，请点「重新解析」后再试');
    }

    if (!response.body || typeof response.body.getReader !== 'function') {
      const blob = await response.blob();
      if (onProgress) onProgress(blob.size, blob.size);
      return blob;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        if (onProgress) onProgress(received, total);
      }
    }
    return new Blob(chunks, { type: type || 'video/mp4' });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new AppError('下载超时，请检查网络后重试');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function saveBlob(blob, filename, title, mimeFallback = '') {
  const file = new File([blob], filename, { type: blob.type || mimeFallback || 'application/octet-stream' });

  if (canShareToAlbum && state.settings.iosSave === 'share') {
    try {
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: title || filename });
        return 'shared';
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return 'cancelled';
      // 分享失败时退回普通下载
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  return 'downloaded';
}

/* ---------------- 音频与转写 ---------------- */

function resampleLinear(data, fromRate, toRate) {
  if (fromRate === toRate) return data;
  const ratio = toRate / fromRate;
  const length = Math.max(1, Math.round(data.length * ratio));
  const output = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const pos = i / ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, data.length - 1);
    const weight = pos - left;
    output[i] = data[left] * (1 - weight) + data[right] * weight;
  }
  return output;
}

function encodeWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return new Blob([view], { type: 'audio/wav' });
}

async function extractWavChunks(blob, progress) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new AppError('当前浏览器不支持音频解码，请换 Safari 或 Chrome');

  if (progress) progress('抽取音轨…');

  let ctx;
  try { ctx = new AudioCtx({ sampleRate: ASR_TARGET_RATE }); }
  catch (_) { ctx = new AudioCtx(); }

  let audio;
  try {
    audio = await ctx.decodeAudioData(await blob.arrayBuffer());
  } catch (_) {
    throw new AppError('无法读取视频里的音轨（可能是格式不支持），换个视频试试');
  } finally {
    if (ctx && ctx.close) ctx.close().catch(() => {});
  }

  if (!audio || !audio.length) throw new AppError('视频里没有可识别的音频');
  if (audio.duration > MAX_MEDIA_SECONDS + 1) {
    throw new AppError('视频超过 30 分钟，手机端转写暂不支持');
  }

  let data;
  if (audio.numberOfChannels > 1) {
    data = new Float32Array(audio.length);
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const channel = audio.getChannelData(c);
      for (let i = 0; i < channel.length; i++) data[i] += channel[i] / audio.numberOfChannels;
    }
  } else {
    data = audio.getChannelData(0);
  }

  if (audio.sampleRate !== ASR_TARGET_RATE) {
    data = resampleLinear(data, audio.sampleRate, ASR_TARGET_RATE);
  }

  const chunkSamples = ASR_CHUNK_SECONDS * ASR_TARGET_RATE;
  const chunks = [];
  for (let start = 0; start < data.length; start += chunkSamples) {
    const slice = data.subarray(start, Math.min(data.length, start + chunkSamples));
    if (slice.length < ASR_TARGET_RATE * 0.4 && chunks.length) break;
    chunks.push(encodeWav(slice, ASR_TARGET_RATE));
  }
  if (!chunks.length) throw new AppError('视频里没有可识别的音频');
  return chunks;
}

function asrMessage(status, detail) {
  const chinese = /[\u4e00-\u9fa5]/.test(detail || '') ? detail : '';
  if (status === 401 || status === 403) return 'API Key 无效或没有调用权限，请到设置里检查';
  if (status === 402) return '账户余额不足，请到硅基流动查看';
  if (status === 413) return '音频太大，换一个更短的视频试试';
  if (status === 429) return chinese || '请求过于频繁或免费额度用尽，请稍后再试';
  if (status >= 500) return '转写服务暂时不可用，请稍后重试';
  return chinese || `转写服务返回异常（${status}）`;
}

async function requestTranscription(wavBlob, key, model) {
  const form = new FormData();
  form.append('file', wavBlob, 'audio.wav');
  form.append('model', model || ASR_DEFAULT_MODEL);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 180000);
  let response;
  try {
    response = await fetch(ASR_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key },
      body: form,
      credentials: 'omit',
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timer);
    if (error && error.name === 'AbortError') throw new AppError('识别超时，请稍后重试');
    throw new AppError('无法连接转写服务，请检查网络后重试');
  }
  clearTimeout(timer);

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = firstString(data.message, data.msg, data.error && data.error.message, data.error);
    } catch (_) {}
    throw new AppError(asrMessage(response.status, detail), String(response.status));
  }

  let data = null;
  try { data = await response.json(); } catch (_) {}
  const text = data ? firstString(data.text, data.transcription, data.result && data.result.text) : '';
  if (!text) throw new AppError('这一段没有识别到语音内容');
  return text.trim();
}

/* ---------------- 总结 ---------------- */

const SUMMARY_PROMPT = '你是短视频内容整理助手。请把用户给的口播文案整理成中文总结：' +
  '第一行用一句话概括主题，随后用「· 」列出不超过 3 条关键信息。' +
  '总字数控制在 150 字以内。只输出总结本身，不要解释，不要使用 Markdown 标题。';

async function requestChat(messages, key, model, maxTokens = 700) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let response;
  try {
    response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + key
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
        stream: false
      }),
      credentials: 'omit',
      signal: controller.signal
    });
  } catch (error) {
    clearTimeout(timer);
    if (error && error.name === 'AbortError') throw new AppError('生成总结超时，请稍后重试');
    throw new AppError('无法连接总结服务，请检查网络后重试');
  }
  clearTimeout(timer);

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = firstString(data.message, data.msg, data.error && data.error.message, data.error);
    } catch (_) {}
    if (response.status === 401 || response.status === 403) {
      throw new AppError('API Key 无效或没有调用权限，请到设置里检查');
    }
    if (response.status === 402) throw new AppError('账户余额不足，请到硅基流动查看');
    if (response.status === 404) throw new AppError('总结模型不可用，请在设置里换一个模型');
    if (response.status === 429) throw new AppError('生成过于频繁或免费额度用尽，请稍后再试');
    throw new AppError(detail ? zhError(detail) : '总结服务暂时不可用，请稍后重试');
  }

  let data = null;
  try { data = await response.json(); } catch (_) {}
  const content = data && data.choices && data.choices[0] && data.choices[0].message
    ? String(data.choices[0].message.content || '').trim()
    : '';
  if (!content) throw new AppError('总结服务没有返回内容，请稍后重试');
  return content;
}

function splitForSummary(text, size = 9000) {
  const value = String(text || '').trim();
  if (value.length <= size) return [value];
  const parts = [];
  for (let i = 0; i < value.length; i += size) parts.push(value.slice(i, i + size));
  return parts;
}

async function summarizeText(text, key, model) {
  const parts = splitForSummary(text);
  let material = text;
  if (parts.length > 1) {
    const briefs = [];
    for (let i = 0; i < parts.length; i++) {
      briefs.push(await requestChat([
        { role: 'system', content: '你是内容整理助手，请用中文简洁概括。' },
        { role: 'user', content: `这是第 ${i + 1}/${parts.length} 段口播文案，请用 120 字以内概括要点：\n\n${parts[i]}` }
      ], key, model, 400));
    }
    material = briefs.join('\n');
  }
  return requestChat([
    { role: 'system', content: SUMMARY_PROMPT },
    { role: 'user', content: material }
  ], key, model, 700);
}

async function summarizeItem(item, progress) {
  const key = String(state.settings.asrKey || '').trim();
  const model = String(state.settings.chatModel || '').trim() || 'Qwen/Qwen2.5-7B-Instruct';
  if (!key) throw new AppError('先在设置里填写硅基流动 API Key');
  const material = item.transcript
    || [item.title, item.desc].filter(Boolean).join('\n')
    || '（没有文案，请根据标题生成一句简短说明）';
  if (progress) progress('生成总结…');
  const summary = await summarizeText(material, key, model);
  item.summary = summary.trim();
  touch(item);
  persistItems();
}

/* ---------------- 任务队列 ---------------- */

function isItemBusy(id) {
  return state.busyId === id || state.queue.some(job => job.itemId === id);
}

function enqueueTask(itemId, type, options = {}) {
  const item = findItem(itemId);
  if (!item) return;
  if (isItemBusy(itemId)) {
    showToast('这条收藏正在处理中');
    return;
  }
  state.queue.push({ itemId, type, force: !!options.force, autoSync: !!options.autoSync });
  updateCard(item);
  pumpQueue();
}

function makeProgress(item) {
  let last = 0;
  let timer = 0;
  return text => {
    item.status = text;
    const now = Date.now();
    if (now - last > 260) {
      last = now;
      updateCard(item);
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = 0;
        last = Date.now();
        updateCard(item);
      }, 260);
    }
  };
}

async function pumpQueue() {
  if (state.queueRunning) return;
  state.queueRunning = true;
  try {
    while (state.queue.length) {
      const job = state.queue.shift();
      const item = findItem(job.itemId);
      if (!item) continue;
      state.busyId = item.id;
      item.busy = job.type;
      item.status = '准备中…';
      updateCard(item);

      const progress = makeProgress(item);
      try {
        if (job.type === 'parse') {
          await ensureParsed(item, progress, job.force);
          if (job.autoSync && state.settings.autoSync === 'add' && state.settings.webhook) {
            syncItem(item, { silent: true });
          }
        } else if (job.type === 'download') {
          await downloadItem(item, progress);
        } else if (job.type === 'extract') {
          await extractItem(item, progress, job.force);
        }
      } catch (error) {
        const message = safeMessage(error);
        item.error = message;
        showToast(message, 3600);
        touch(item);
        persistItems();
      } finally {
        state.busyId = '';
        item.busy = '';
        item.status = '';
        persistItems();
        renderItems();
      }
    }
  } finally {
    state.queueRunning = false;
  }
}

function setNote(item, text, ms = 4500) {
  state.notes.set(item.id, { text, until: Date.now() + ms });
  updateCard(item);
}

async function downloadItem(item, progress) {
  await ensureParsed(item, progress);
  if (!item.videoUrl) throw new AppError('这个作品没有可下载的视频文件');

  progress('下载视频 0%');
  let lastPercent = -1;
  const blob = await downloadBlob(item.videoUrl, {
    onProgress: (received, total) => {
      const percent = total ? Math.min(100, Math.round((received / total) * 100)) : -1;
      if (percent !== lastPercent) {
        lastPercent = percent;
        progress(percent >= 0 ? `下载视频 ${percent}%` : `下载视频 ${formatSize(received)}`);
      }
    }
  });

  progress('正在保存…');
  const filename = sanitizeFilename(item.title || '视频') + '.mp4';
  const mode = await saveBlob(blob, filename, item.title || filename, 'video/mp4');
  const text = mode === 'shared' ? '已打开系统保存面板'
    : mode === 'cancelled' ? '已取消保存'
      : '视频已下载';
  if (mode !== 'cancelled') {
    item.error = '';
    touch(item);
    persistItems();
  }
  state.notes.set(item.id, { text, until: Date.now() + 5000 });
  progress(text);
  showToast(text);
}

async function extractItem(item, progress, force) {
  const key = String(state.settings.asrKey || '').trim();
  if (!key) {
    openSettings(true);
    throw new AppError('先在设置里填写硅基流动 API Key');
  }
  const asrModel = String(state.settings.asrModel || '').trim() || ASR_DEFAULT_MODEL;

  if (item.transcript && !force) {
    if (!item.summary) {
      await summarizeItem(item, progress);
      state.notes.set(item.id, { text: '总结已生成', until: Date.now() + 4500 });
      state.expanded.add(item.id);
      persistItems();
      renderItems();
      return;
    }
    state.expanded.add(item.id);
    renderItems();
    return;
  }

  await ensureParsed(item, progress);
  if (!item.videoUrl) {
    if (!item.desc) throw new AppError('这个作品没有视频或文字，无法提取文案');
    await summarizeItem(item, progress);
    state.expanded.add(item.id);
    persistItems();
    renderItems();
    return;
  }

  progress('下载视频…');
  let lastPercent = -1;
  const blob = await downloadBlob(item.videoUrl, {
    onProgress: (received, total) => {
      const percent = total ? Math.min(100, Math.round((received / total) * 100)) : -1;
      if (percent !== lastPercent) {
        lastPercent = percent;
        progress(percent >= 0 ? `下载视频 ${percent}%` : `下载视频 ${formatSize(received)}`);
      }
    }
  });

  const chunks = await extractWavChunks(blob, progress);
  const texts = [];
  for (let i = 0; i < chunks.length; i++) {
    progress(chunks.length > 1 ? `识别语音 ${i + 1}/${chunks.length}…` : '识别语音…');
    const text = await requestTranscription(chunks[i], key, asrModel);
    if (text) texts.push(text);
  }

  const transcript = texts.join('\n').trim();
  if (!transcript) throw new AppError('没有识别到语音内容，可能是纯音乐或无口播');
  item.transcript = transcript;
  item.error = '';
  touch(item);
  persistItems();
  updateCard(item);

  let summaryError = null;
  try {
    await summarizeItem(item, progress);
  } catch (error) {
    summaryError = safeMessage(error);
  }

  state.expanded.add(item.id);
  persistItems();
  renderItems();

  if (summaryError) {
    item.error = '文案已提取，但总结失败：' + summaryError;
    persistItems();
    updateCard(item);
    showToast(item.error, 4200);
    return;
  }

  state.notes.set(item.id, { text: '文案和总结完成', until: Date.now() + 5000 });
  renderItems();
  showToast('文案和总结完成');

  if (state.settings.autoSync === 'text' && state.settings.webhook && item.syncState !== 'done') {
    syncItem(item, { silent: true });
  }
}

/* ---------------- 飞书同步 ---------------- */

function buildPayload(item, isTest = false) {
  const now = Date.now();
  return {
    标题: item.title || (isTest ? '视频收藏 · 同步测试' : '视频收藏'),
    视频链接: item.url || pageUrl(),
    描述文案: item.desc || '',
    口播文案: item.transcript || '',
    视频总结: item.summary || '',
    作者: item.author || '',
    封面: item.cover || '',
    处理状态: (item.transcript || item.summary) ? '已完成' : '处理中',
    收藏时间: Number(item.addedAt) || now,
    同步时间: now
  };
}

function syncLabelFor(item) {
  if (state.syncing.has(item.id)) return '同步中…';
  if (item.syncState === 'done') return '已同步 · 再次同步';
  if (item.syncState === 'unconfirmed') return '同步待确认 · 重发';
  if (item.syncState === 'error') return '同步失败 · 重试';
  return '同步飞书';
}

async function sendPayload(payload) {
  const webhook = String(state.settings.webhook || '').trim();
  const token = String(state.settings.webhookToken || '').trim();
  if (!webhook) return { state: 'error', message: '先在设置里填写飞书 Webhook 地址' };

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    let response;
    try {
      response = await fetch(webhook, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      });
    } catch (error) {
      // 跨域被拦时，请求可能已经送达，也可能根本没发出；不要自动重发，避免重复记录
      if (error && error.name === 'AbortError') {
        return { state: 'error', message: '同步超时，请稍后重试' };
      }
      if (navigator.onLine === false) {
        return { state: 'error', message: '网络未连接，请检查网络后重试' };
      }
      return { state: 'unconfirmed', message: '浏览器跨域受限，无法确认是否写入；请先到表格查看，未写入可重发' };
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { state: 'error', message: '飞书拒绝了请求，请检查 Webhook 地址或 Token' };
      }
      return { state: 'error', message: `飞书返回异常（${response.status}）` };
    }

    let data = null;
    try { data = await response.json(); } catch (_) {}
    if (data && data.code !== undefined && Number(data.code) !== 0) {
      const detail = firstString(data.msg, data.message);
      return { state: 'error', message: detail ? zhError(detail) : '飞书自动化返回失败，请检查字段映射' };
    }
    return { state: 'done', message: '已同步到飞书' };
  } finally {
    clearTimeout(timer);
  }
}

async function syncItem(item, options = {}) {
  if (!item || state.syncing.has(item.id)) return;
  const webhook = String(state.settings.webhook || '').trim();
  if (!webhook) {
    openSettings();
    showToast('先在设置里填写飞书 Webhook 地址');
    return;
  }
  if (item.syncState === 'done' && !options.confirmed) {
    const ok = confirm('这条已经同步过，再次同步会在飞书新增一条记录。继续吗？');
    if (!ok) return;
  }

  state.syncing.add(item.id);
  updateCard(item);
  item.syncError = '';
  const result = await sendPayload(buildPayload(item));
  state.syncing.delete(item.id);

  if (result.state === 'done') {
    item.syncState = 'done';
    item.syncedAt = Date.now();
    item.syncError = '';
    state.notes.set(item.id, { text: '已同步到飞书', until: Date.now() + 4500 });
    if (!options.silent) showToast('已同步到飞书');
  } else if (result.state === 'unconfirmed') {
    item.syncState = 'unconfirmed';
    item.syncedAt = Date.now();
    item.syncError = result.message;
    if (!options.silent) showToast(result.message, 4200);
  } else {
    item.syncState = 'error';
    item.syncError = result.message;
    if (!options.silent) showToast(result.message, 4200);
  }
  touch(item);
  persistItems();
  updateCard(item);
}

async function syncAll() {
  if (state.syncAllRunning) return;
  syncSettingsFromForm();
  if (!state.settings.webhook) {
    openSettings();
    showToast('先在设置里填写飞书 Webhook 地址');
    return;
  }
  const targets = state.items.filter(item => item.syncState === 'none' || item.syncState === 'error');
  if (!targets.length) {
    showToast('没有待同步的收藏');
    return;
  }

  state.syncAllRunning = true;
  el.syncAllBtn.disabled = true;
  let done = 0;
  let failed = 0;
  let unconfirmed = 0;

  for (let i = 0; i < targets.length; i++) {
    el.syncAllBtn.textContent = `同步 ${i + 1}/${targets.length}`;
    const item = targets[i];
    state.syncing.add(item.id);
    updateCard(item);
    const result = await sendPayload(buildPayload(item));
    state.syncing.delete(item.id);

    if (result.state === 'done') {
      item.syncState = 'done';
      item.syncedAt = Date.now();
      item.syncError = '';
      done++;
    } else if (result.state === 'unconfirmed') {
      item.syncState = 'unconfirmed';
      item.syncedAt = Date.now();
      item.syncError = result.message;
      unconfirmed++;
    } else {
      item.syncState = 'error';
      item.syncError = result.message;
      failed++;
    }
    touch(item);
    persistItems();
    updateCard(item);
  }

  state.syncAllRunning = false;
  el.syncAllBtn.disabled = false;
  el.syncAllBtn.textContent = '同步全部';
  const parts = [`成功 ${done} 条`];
  if (unconfirmed) parts.push(`待确认 ${unconfirmed} 条`);
  if (failed) parts.push(`失败 ${failed} 条`);
  showToast('同步完成：' + parts.join('，'), 4600);
  renderItems();
}

/* ---------------- 渲染 ---------------- */

function cacheEls() {
  el.itemList = $('#itemList');
  el.emptyState = $('#emptyState');
  el.listHint = $('#listHint');
  el.storageTag = $('#storageTag');
  el.linkInput = $('#linkInput');
  el.addBtn = $('#addBtn');
  el.pasteBtn = $('#pasteBtn');
  el.addHint = $('#addHint');
  el.searchInput = $('#searchInput');
  el.filterChips = $('#filterChips');
  el.syncAllBtn = $('#syncAllBtn');
  el.settingsBtn = $('#settingsBtn');
  el.sheetWrap = $('#sheetWrap');
  el.asrKey = $('#asrKey');
  el.asrModel = $('#asrModel');
  el.chatModel = $('#chatModel');
  el.keyState = $('#keyState');
  el.toggleKeyBtn = $('#toggleKeyBtn');
  el.testKeyBtn = $('#testKeyBtn');
  el.webhook = $('#webhook');
  el.webhookToken = $('#webhookToken');
  el.autoSync = $('#autoSync');
  el.phoneModeHint = $('#phoneModeHint');
  el.testWebhookBtn = $('#testWebhookBtn');
  el.copySampleBtn = $('#copySampleBtn');
  el.feishuReadUrl = $('#feishuReadUrl');
  el.feishuReadToken = $('#feishuReadToken');
  el.autoPullFeishu = $('#autoPullFeishu');
  el.pullFeishuBtn = $('#pullFeishuBtn');
  el.testFeishuBtn = $('#testFeishuBtn');
  el.copyWorkerBtn = $('#copyWorkerBtn');
  el.feishuReadState = $('#feishuReadState');
  el.iosSave = $('#iosSave');
  el.exportBtn = $('#exportBtn');
  el.importBtn = $('#importBtn');
  el.importFile = $('#importFile');
  el.clearBtn = $('#clearBtn');
  el.dataState = $('#dataState');
  el.versionLine = $('#versionLine');
  el.toast = $('#toast');
}

let toastTimer = 0;
function showToast(text, duration = 2600) {
  if (!text) return;
  el.toast.textContent = text;
  el.toast.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('is-show'), duration);
}

function itemMetaText(item) {
  const parts = [];
  if (item.platform && item.platform !== 'douyin') parts.push(platformName(item.platform));
  if (item.author) parts.push(item.author);
  const duration = formatDuration(item.duration);
  if (duration) parts.push(duration);
  parts.push(formatTimeAgo(item.addedAt));
  return parts.filter(Boolean).join(' · ');
}

function statusInfo(item) {
  if (state.busyId === item.id) {
    return { text: item.status || '处理中…', isError: false };
  }
  if (state.queue.some(job => job.itemId === item.id)) {
    return { text: '排队中…', isError: false };
  }
  const note = state.notes.get(item.id);
  if (note && note.until > Date.now()) return { text: note.text, isError: false };
  if (item.error) return { text: item.error, isError: true };
  if (item.syncError) return { text: item.syncError, isError: true };
  return { text: '', isError: false };
}

function downloadLabel(item) {
  if (state.busyId === item.id && item.busy === 'download') return '下载中…';
  if (state.busyId === item.id || state.queue.some(job => job.itemId === item.id)) return '处理中…';
  return '下载视频';
}

function extractLabel(item) {
  if (state.busyId === item.id && item.busy === 'extract') return '提取中…';
  if (state.busyId === item.id || state.queue.some(job => job.itemId === item.id)) return '处理中…';
  if (item.transcript && item.summary) return '查看文案';
  if (item.transcript && !item.summary) return '生成总结';
  return '提取文案';
}

function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'item';
  card.dataset.id = item.id;

  const main = document.createElement('div');
  main.className = 'item-main';

  const cover = document.createElement('div');
  cover.className = 'cover';
  const fallback = document.createElement('span');
  fallback.className = 'cover-fallback';
  fallback.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>';
  cover.appendChild(fallback);
  if (item.cover) {
    const img = document.createElement('img');
    img.src = item.cover;
    img.alt = '';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => img.remove());
    cover.appendChild(img);
  }

  const info = document.createElement('div');
  info.className = 'item-info';

  const title = document.createElement('h3');
  title.className = 'item-title' + (item.title ? '' : ' is-link');
  title.textContent = item.title || '等待读取标题…';

  const meta = document.createElement('p');
  meta.className = 'item-meta';
  meta.textContent = itemMetaText(item);

  const tags = document.createElement('div');
  tags.className = 'item-tags';
  const addTag = text => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = text;
    tags.appendChild(tag);
  };
  if (item.transcript) addTag('有文案');
  else addTag('待整理');
  if (item.syncState === 'done') addTag('已同步');
  else if (item.syncState === 'unconfirmed') addTag('同步待确认');
  else if (item.syncState === 'error') addTag('同步失败');

  info.append(title, meta, tags);
  main.append(cover, info);

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'action-btn';
  downloadBtn.dataset.act = 'download';
  downloadBtn.textContent = downloadLabel(item);
  downloadBtn.disabled = isItemBusy(item.id);

  const extractBtn = document.createElement('button');
  extractBtn.type = 'button';
  extractBtn.className = 'action-btn accent';
  extractBtn.dataset.act = 'extract';
  extractBtn.textContent = extractLabel(item);
  extractBtn.disabled = isItemBusy(item.id);

  actions.append(downloadBtn, extractBtn);

  const status = document.createElement('p');
  status.className = 'item-status';
  const infoStatus = statusInfo(item);
  status.textContent = infoStatus.text;
  if (infoStatus.isError) status.classList.add('is-error');

  card.append(main, actions, status);

  if (state.expanded.has(item.id) && (item.summary || item.transcript)) {
    card.appendChild(buildPanel(item));
  }
  return card;
}

function buildPanel(item) {
  const panel = document.createElement('div');
  panel.className = 'item-panel';

  if (item.summary) {
    const block = document.createElement('div');
    block.className = 'panel-block';
    const head = document.createElement('h4');
    head.textContent = '视频总结';
    const text = document.createElement('p');
    text.className = 'panel-text';
    text.textContent = item.summary;
    block.append(head, text);
    panel.appendChild(block);
  }

  if (item.transcript) {
    const block = document.createElement('div');
    block.className = 'panel-block';
    const head = document.createElement('h4');
    head.textContent = `口播文案 · ${item.transcript.length} 字`;
    const text = document.createElement('p');
    text.className = 'panel-text is-transcript';
    text.textContent = item.transcript;
    block.append(head, text);
    panel.appendChild(block);
  }

  const actions = document.createElement('div');
  actions.className = 'panel-actions';
  if (item.summary) {
    const copySummary = document.createElement('button');
    copySummary.type = 'button';
    copySummary.className = 'ghost-btn small';
    copySummary.dataset.act = 'copy-summary';
    copySummary.textContent = '复制总结';
    actions.appendChild(copySummary);
  }
  if (item.transcript) {
    const copyTranscript = document.createElement('button');
    copyTranscript.type = 'button';
    copyTranscript.className = 'ghost-btn small';
    copyTranscript.dataset.act = 'copy-transcript';
    copyTranscript.textContent = '复制文案';
    actions.appendChild(copyTranscript);
  }
  panel.appendChild(actions);

  const foot = document.createElement('div');
  foot.className = 'item-foot';

  const syncBtn = document.createElement('button');
  syncBtn.type = 'button';
  syncBtn.className = 'link-action';
  syncBtn.dataset.act = 'sync';
  syncBtn.textContent = syncLabelFor(item);
  syncBtn.disabled = state.syncing.has(item.id);
  foot.appendChild(syncBtn);

  if (item.syncState === 'unconfirmed') {
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button';
    confirmBtn.className = 'link-action';
    confirmBtn.dataset.act = 'confirm-sync';
    confirmBtn.textContent = '我已确认写入';
    foot.appendChild(confirmBtn);
  }

  const reparse = document.createElement('button');
  reparse.type = 'button';
  reparse.className = 'link-action';
  reparse.dataset.act = 'reparse';
  reparse.textContent = '重新解析';
  foot.appendChild(reparse);

  if (item.transcript) {
    const reextract = document.createElement('button');
    reextract.type = 'button';
    reextract.className = 'link-action';
    reextract.dataset.act = 'reextract';
    reextract.textContent = '重新提取';
    foot.appendChild(reextract);
  }

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'link-action';
  open.dataset.act = 'open';
  open.textContent = '打开原文';
  foot.appendChild(open);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'link-action danger';
  del.dataset.act = 'delete';
  del.textContent = '删除';
  foot.appendChild(del);

  panel.appendChild(foot);
  return panel;
}

function visibleItems() {
  const query = state.query.trim().toLowerCase();
  return state.items.filter(item => {
    if (state.filter === 'pending' && item.transcript) return false;
    if (state.filter === 'text' && !item.transcript) return false;
    if (state.filter === 'unsynced' && item.syncState === 'done') return false;
    if (!query) return true;
    const haystack = [item.title, item.desc, item.author, item.transcript, item.summary]
      .filter(Boolean).join('\n').toLowerCase();
    return haystack.includes(query);
  });
}

function renderItems() {
  const list = visibleItems();
  const fragment = document.createDocumentFragment();
  for (const item of list) fragment.appendChild(buildCard(item));
  el.itemList.replaceChildren(fragment);

  const total = state.items.length;
  el.emptyState.hidden = total > 0;
  el.storageTag.textContent = total ? `本机 ${total} 条` : '仅存本机';

  if (!total) {
    el.listHint.textContent = '';
  } else if (!list.length) {
    el.listHint.textContent = '没有符合条件的收藏';
  } else {
    const withText = state.items.filter(item => item.transcript).length;
    const synced = state.items.filter(item => item.syncState === 'done').length;
    const parts = [`${total} 条收藏`, `${withText} 条有文案`];
    if (synced) parts.push(`${synced} 条已同步`);
    if (list.length !== total) parts.unshift(`筛选出 ${list.length} 条`);
    el.listHint.textContent = parts.join(' · ');
  }
  updateDataState();
}

function updateCard(item) {
  const old = el.itemList.querySelector(`[data-id="${item.id}"]`);
  if (!old) return;
  const fresh = buildCard(item);
  old.replaceWith(fresh);
}

function flashCard(id) {
  const card = el.itemList.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  card.classList.add('is-flash');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => card.classList.remove('is-flash'), 1200);
}

function updateDataState() {
  if (!el.dataState) return;
  let raw = '';
  try { raw = localStorage.getItem(LS_ITEMS) || '[]'; } catch (_) {}
  const size = new Blob([raw]).size;
  el.dataState.textContent = state.items.length
    ? `${state.items.length} 条收藏，占用约 ${formatSize(size) || '0B'}。`
    : '本机还没有收藏。';
}

/* ---------------- 添加 ---------------- */

function createItem(url, source) {
  return {
    id: genId(),
    url,
    platform: detectPlatform(url),
    title: '',
    desc: '',
    author: '',
    cover: '',
    duration: 0,
    videoUrl: '',
    videoUrlAt: 0,
    transcript: '',
    summary: '',
    addedAt: Date.now(),
    updatedAt: Date.now(),
    source,
    syncState: 'none',
    syncedAt: 0,
    syncError: '',
    error: ''
  };
}

function addFromText(rawText, source = 'paste') {
  const urls = extractUrls(rawText);
  if (!urls.length) {
    showToast('没有识别到链接，请粘贴完整的视频分享链接');
    return [];
  }

  const knownKeys = new Set(state.items.map(item => linkKey(item.url)));
  const added = [];
  let skipped = 0;
  let ignored = 0;
  let overflow = 0;

  for (const url of urls) {
    if (added.length >= MAX_BATCH_ADD) { overflow += 1; continue; }
    if (detectPlatform(url) === 'unknown') { ignored += 1; continue; }
    const key = linkKey(url);
    if (knownKeys.has(key)) { skipped += 1; continue; }
    knownKeys.add(key);
    added.push(createItem(url, source));
  }

  if (!added.length) {
    if (skipped) {
      showToast('这些链接都已经在收藏里');
      const first = state.items.find(item => urls.some(url => linkKey(url) === linkKey(item.url)));
      if (first) flashCard(first.id);
    } else {
      showToast('没有识别到视频链接，请粘贴抖音、快手、小红书等平台的分享链接');
    }
    return [];
  }

  state.items.unshift(...added);
  if (state.items.length > MAX_ITEMS) state.items = state.items.slice(0, MAX_ITEMS);
  persistItems();
  el.linkInput.value = '';
  renderItems();
  flashCard(added[0].id);
  added.forEach(item => enqueueTask(item.id, 'parse', { autoSync: true }));

  let message = added.length > 1 ? `已加入 ${added.length} 条` : '已存入本机';
  if (skipped) message += `，${skipped} 条已存在`;
  if (ignored) message += `，忽略 ${ignored} 个非视频链接`;
  if (overflow) message += `，一次最多 ${MAX_BATCH_ADD} 条`;
  showToast(message);
  return added;
}

/* ---------------- 剪贴板 ---------------- */

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }
}

/* ---------------- 设置 ---------------- */

function fillSettingsForm() {
  el.asrKey.value = state.settings.asrKey || '';
  el.asrModel.value = state.settings.asrModel || ASR_DEFAULT_MODEL;
  el.chatModel.value = state.settings.chatModel || 'Qwen/Qwen2.5-7B-Instruct';
  el.webhook.value = state.settings.webhook || '';
  el.webhookToken.value = state.settings.webhookToken || '';
  el.autoSync.value = state.settings.autoSync || 'off';
  el.iosSave.value = state.settings.iosSave || 'share';
  el.feishuReadUrl.value = state.settings.feishuReadUrl || '';
  el.feishuReadToken.value = state.settings.feishuReadToken || '';
  el.autoPullFeishu.value = state.settings.autoPullFeishu || 'open';
  updateKeyState();
  updateFeishuReadState();
  updateDataState();
}

function syncSettingsFromForm() {
  if (!el.asrKey) return;
  state.settings.asrKey = el.asrKey.value.trim();
  state.settings.asrModel = el.asrModel.value.trim() || ASR_DEFAULT_MODEL;
  state.settings.chatModel = el.chatModel.value.trim() || 'Qwen/Qwen2.5-7B-Instruct';
  state.settings.webhook = el.webhook.value.trim();
  state.settings.webhookToken = el.webhookToken.value.trim();
  state.settings.autoSync = el.autoSync.value;
  state.settings.iosSave = el.iosSave.value;
  state.settings.feishuReadUrl = el.feishuReadUrl.value.trim();
  state.settings.feishuReadToken = el.feishuReadToken.value.trim();
  state.settings.autoPullFeishu = el.autoPullFeishu.value;
  persistSettings();
  updateKeyState();
  updateFeishuReadState();
}

function updateKeyState() {
  const key = el.asrKey ? el.asrKey.value.trim() : state.settings.asrKey;
  if (!key) {
    el.keyState.textContent = '还没有填写密钥。';
  } else {
    const tail = key.length > 6 ? key.slice(-4) : '';
    el.keyState.textContent = `密钥已保存在本机${tail ? '（结尾 ' + tail + '）' : ''}。`;
  }
}

function openSettings(focusKey = false) {
  fillSettingsForm();
  el.sheetWrap.hidden = false;
  document.body.style.overflow = 'hidden';
  if (focusKey) {
    setTimeout(() => {
      el.asrKey.focus();
      el.asrKey.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 220);
  }
}

function closeSettings() {
  syncSettingsFromForm();
  el.sheetWrap.hidden = true;
  document.body.style.overflow = '';
}

async function testKey() {
  syncSettingsFromForm();
  const key = state.settings.asrKey;
  if (!key) {
    showToast('请先填写 API Key');
    return;
  }
  el.testKeyBtn.disabled = true;
  el.testKeyBtn.textContent = '测试中…';
  try {
    const response = await fetch(MODELS_ENDPOINT, {
      headers: { Authorization: 'Bearer ' + key },
      credentials: 'omit',
      mode: 'cors'
    });
    if (response.status === 401 || response.status === 403) {
      showToast('密钥无效，请检查是否复制完整');
    } else if (!response.ok) {
      showToast('服务暂时不可用，请稍后再试');
    } else {
      showToast('密钥可用');
    }
  } catch (_) {
    showToast('无法连接转写服务，请检查网络');
  } finally {
    el.testKeyBtn.disabled = false;
    el.testKeyBtn.textContent = '测试密钥';
  }
}

let webhookArmed = false;
let webhookTimer = 0;

function resetWebhookTest() {
  webhookArmed = false;
  clearTimeout(webhookTimer);
  el.testWebhookBtn.textContent = '发送测试';
}

async function testWebhook() {
  syncSettingsFromForm();
  if (!state.settings.webhook) {
    showToast('先填写 Webhook 地址');
    return;
  }
  if (!webhookArmed) {
    webhookArmed = true;
    el.testWebhookBtn.textContent = '再点一次发送';
    showToast('测试会在飞书表格新增一条记录');
    webhookTimer = setTimeout(resetWebhookTest, 5000);
    return;
  }
  resetWebhookTest();
  el.testWebhookBtn.disabled = true;
  el.testWebhookBtn.textContent = '发送中…';
  const item = {
    id: 'test',
    title: '视频收藏 · 同步测试',
    url: pageUrl(),
    desc: '这是一条来自视频收藏的测试记录，可以直接删除。',
    author: '视频收藏',
    cover: '',
    transcript: '',
    summary: '',
    addedAt: Date.now()
  };
  const result = await sendPayload(buildPayload(item, true));
  el.testWebhookBtn.disabled = false;
  el.testWebhookBtn.textContent = '发送测试';
  if (result.state === 'done') showToast('已发送，表格里应新增一条测试记录', 4200);
  else if (result.state === 'unconfirmed') showToast('已发送，但浏览器读不到返回，请到表格确认', 4600);
  else showToast(result.message, 4600);
}

/* ---------------- 从飞书加载 ---------------- */

function plainText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return value.map(plainText).filter(Boolean).join('');
  }
  if (typeof value === 'object') {
    return plainText(value.text) || plainText(value.name) || plainText(value.link) ||
      plainText(value.url) || '';
  }
  return '';
}

function httpUrl(value) {
  const text = plainText(value);
  return /^https?:\/\//i.test(text) ? text : '';
}

function pickField(fields, names) {
  if (!fields || typeof fields !== 'object') return '';
  for (const name of names) {
    if (!Object.prototype.hasOwnProperty.call(fields, name)) continue;
    const value = plainText(fields[name]);
    if (value) return value;
  }
  return '';
}

function toTimestamp(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value > 1e12 ? value : (value > 1e9 ? value * 1000 : 0);
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return toTimestamp(Number(value));
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function normalizePulledRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const fields = raw.fields && typeof raw.fields === 'object' ? raw.fields : raw;
  const url = extractUrl(
    pickField(fields, ['视频链接', '链接', 'url', 'URL', 'link']) ||
    pickField(raw, ['视频链接', '链接', 'url', 'URL', 'link'])
  );
  if (!url) return null;
  return {
    url,
    title: pickField(fields, ['标题', 'title', '名称']) || pickField(raw, ['title']),
    desc: pickField(fields, ['描述文案', '描述', 'desc', 'description']) || pickField(raw, ['desc']),
    transcript: pickField(fields, ['口播文案', '文案', 'transcript']) || pickField(raw, ['transcript']),
    summary: pickField(fields, ['视频总结', '总结', 'summary']) || pickField(raw, ['summary']),
    author: pickField(fields, ['作者', 'author']) || pickField(raw, ['author']),
    cover: httpUrl(pickField(fields, ['封面', 'cover']) || pickField(raw, ['cover'])),
    savedAt: toTimestamp(raw.savedAt || raw.addedAt || fields['收藏时间']),
    syncedAt: toTimestamp(raw.syncedAt || fields['同步时间'])
  };
}

async function fetchFeishuRecords() {
  const url = String(state.settings.feishuReadUrl || '').trim();
  if (!url) throw new AppError('还没有填写飞书中转地址');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const headers = {};
    if (state.settings.feishuReadToken) {
      headers.Authorization = 'Bearer ' + state.settings.feishuReadToken;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
      credentials: 'omit',
      mode: 'cors',
      signal: controller.signal
    });
    if (response.status === 401 || response.status === 403) {
      throw new AppError('中转口令不正确，请和 Worker 里的 RELAY_TOKEN 核对');
    }
    if (!response.ok) {
      throw new AppError('读取飞书失败，请检查中转地址是否带 /records');
    }
    const data = await response.json();
    const list = Array.isArray(data)
      ? data
      : (Array.isArray(data.records) ? data.records : (Array.isArray(data.items) ? data.items : []));
    return list;
  } catch (error) {
    if (error && error.name === 'AbortError') throw new AppError('读取飞书超时，请稍后再试');
    if (error instanceof AppError) throw error;
    throw new AppError('无法连接飞书中转，请检查网络和 Worker 的跨域设置');
  } finally {
    clearTimeout(timer);
  }
}

function mergeFeishuRecords(list) {
  const addedItems = [];
  let updated = 0;
  let skipped = 0;

  for (const raw of list) {
    const remote = normalizePulledRecord(raw);
    if (!remote) { skipped += 1; continue; }
    const key = linkKey(remote.url);
    const existing = state.items.find(item => linkKey(item.url) === key);

    if (!existing) {
      const item = createItem(remote.url, 'feishu');
      item.title = remote.title;
      item.desc = remote.desc;
      item.author = remote.author;
      item.cover = remote.cover;
      item.transcript = remote.transcript;
      item.summary = remote.summary;
      item.addedAt = remote.savedAt || Date.now();
      item.updatedAt = Date.now();
      item.syncState = 'done';
      item.syncedAt = remote.syncedAt || Date.now();
      addedItems.push(item);
      continue;
    }

    let changed = false;
    for (const field of ['title', 'desc', 'author', 'cover', 'transcript', 'summary']) {
      if (!existing[field] && remote[field]) {
        existing[field] = remote[field];
        changed = true;
      }
    }
    if (existing.syncState !== 'done') {
      existing.syncState = 'done';
      existing.syncedAt = remote.syncedAt || Date.now();
      changed = true;
    }
    if (changed) {
      touch(existing);
      updated += 1;
    }
  }

  if (addedItems.length) {
    state.items.unshift(...addedItems);
    if (state.items.length > MAX_ITEMS) state.items = state.items.slice(0, MAX_ITEMS);
  }
  if (addedItems.length || updated) {
    persistItems();
    renderItems();
  }
  return { added: addedItems.length, updated, skipped };
}

function updateFeishuReadState(text) {
  if (!el.feishuReadState) return;
  if (text) {
    el.feishuReadState.textContent = text;
    return;
  }
  if (!state.settings.feishuReadUrl) {
    el.feishuReadState.textContent = '还没有配置中转。';
    return;
  }
  const at = Number(state.settings.feishuPulledAt) || 0;
  const summary = state.settings.feishuLastSummary || '';
  el.feishuReadState.textContent = at
    ? `上次加载：${new Date(at).toLocaleString('zh-CN', { hour12: false })}${summary ? ' · ' + summary : '。'}`
    : '中转已填写，还没有加载过。';
}

let feishuPulling = false;

async function pullFeishu(options = {}) {
  const silent = !!options.silent;
  if (feishuPulling) return null;
  if (!String(state.settings.feishuReadUrl || '').trim()) {
    if (!silent) showToast('先填写飞书中转地址');
    return null;
  }
  feishuPulling = true;
  if (el.pullFeishuBtn) {
    el.pullFeishuBtn.disabled = true;
    el.pullFeishuBtn.textContent = '加载中…';
  }
  if (!silent) updateFeishuReadState('正在读取飞书…');
  try {
    const list = await fetchFeishuRecords();
    const result = mergeFeishuRecords(list);
    const message = `已从飞书读取 ${list.length} 条：新增 ${result.added}，更新 ${result.updated}。`;
    state.settings.feishuPulledAt = Date.now();
    state.settings.feishuLastSummary = message;
    persistSettings();
    updateFeishuReadState(message);
    if (!silent) showToast(`飞书加载完成：新增 ${result.added} 条，更新 ${result.updated} 条`, 3600);
    return result;
  } catch (error) {
    const message = safeMessage(error);
    updateFeishuReadState(message);
    if (!silent) showToast(message, 4200);
    return null;
  } finally {
    feishuPulling = false;
    if (el.pullFeishuBtn) {
      el.pullFeishuBtn.disabled = false;
      el.pullFeishuBtn.textContent = '立即从飞书加载';
    }
  }
}

async function testFeishuRead() {
  syncSettingsFromForm();
  if (!state.settings.feishuReadUrl) {
    showToast('先填写飞书中转地址');
    return;
  }
  el.testFeishuBtn.disabled = true;
  el.testFeishuBtn.textContent = '测试中…';
  updateFeishuReadState('正在测试连接…');
  try {
    const list = await fetchFeishuRecords();
    updateFeishuReadState(`连接正常，表格里有 ${list.length} 条记录。`);
    showToast(`连接正常，读到 ${list.length} 条记录`, 3200);
  } catch (error) {
    const message = safeMessage(error);
    updateFeishuReadState(message);
    showToast(message, 4200);
  } finally {
    el.testFeishuBtn.disabled = false;
    el.testFeishuBtn.textContent = '测试连接';
  }
}

async function copySample() {
  syncSettingsFromForm();
  const sample = buildPayload({
    id: 'sample',
    title: '示例：真正意义上的 AI 浏览器',
    url: 'https://www.douyin.com/video/0000000000000000000',
    desc: '这里放视频描述或标题文案。',
    author: '示例作者',
    cover: 'https://example.com/cover.jpg',
    transcript: '这里放转写出来的口播文案全文。',
    summary: '一句话主题。\n· 关键信息一\n· 关键信息二',
    addedAt: Date.now()
  });
  sample.收藏时间 = Date.now();
  sample.同步时间 = Date.now();
  const ok = await copyText(JSON.stringify(sample, null, 2));
  showToast(ok ? '示例 JSON 已复制' : '复制失败，请长按文字手动复制');
}

async function exportBackup() {
  const data = {
    app: 'douyin-pocket',
    version: 1,
    exportedAt: new Date().toISOString(),
    items: state.items
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const name = `视频收藏备份_${formatFileStamp(Date.now())}.json`;
  const mode = await saveBlob(blob, name, '视频收藏备份', 'application/json');
  if (mode === 'cancelled') showToast('已取消导出');
  else if (mode === 'shared') showToast('已打开保存面板');
  else showToast('备份已导出');
}

async function importBackup(file) {
  if (!file) return;
  let data = null;
  try {
    data = JSON.parse(await file.text());
  } catch (_) {
    showToast('备份文件无法读取，请选择视频收藏导出的 JSON 文件');
    return;
  }
  const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : null);
  if (!list) {
    showToast('备份文件里没有收藏数据');
    return;
  }

  let added = 0;
  let merged = 0;
  for (const raw of list) {
    const incoming = normalizeItem(raw);
    if (!incoming) continue;
    const key = linkKey(incoming.url);
    const existing = state.items.find(item => linkKey(item.url) === key);
    if (existing) {
      existing.title = existing.title || incoming.title;
      existing.desc = existing.desc || incoming.desc;
      existing.author = existing.author || incoming.author;
      existing.cover = existing.cover || incoming.cover;
      existing.duration = existing.duration || incoming.duration;
      existing.videoUrl = existing.videoUrl || incoming.videoUrl;
      existing.videoUrlAt = existing.videoUrlAt || incoming.videoUrlAt;
      existing.transcript = existing.transcript || incoming.transcript;
      existing.summary = existing.summary || incoming.summary;
      if (incoming.syncState === 'done' && existing.syncState !== 'done') {
        existing.syncState = 'done';
        existing.syncedAt = incoming.syncedAt || existing.syncedAt;
      }
      touch(existing);
      merged++;
    } else {
      incoming.id = state.items.some(item => item.id === incoming.id) ? genId() : incoming.id;
      state.items.push(incoming);
      added++;
    }
  }

  state.items.sort((a, b) => b.addedAt - a.addedAt);
  state.items = state.items.slice(0, MAX_ITEMS);
  persistItems();
  renderItems();
  showToast(`导入完成：新增 ${added} 条，合并 ${merged} 条`, 4200);
}

function clearAll() {
  if (!state.items.length) {
    showToast('本机还没有收藏');
    return;
  }
  if (!confirm('清空本机所有收藏？此操作不可恢复，建议先导出备份。')) return;
  state.items = [];
  state.expanded.clear();
  state.notes.clear();
  try { localStorage.removeItem(LS_ITEMS); } catch (_) {}
  renderItems();
  showToast('已清空本机收藏');
}

/* ---------------- 事件绑定 ---------------- */

function bindEvents() {
  el.addBtn.addEventListener('click', () => {
    const text = el.linkInput.value;
    if (!text.trim()) {
      el.linkInput.focus();
      showToast('先粘贴一条视频分享链接');
      return;
    }
    addFromText(text, 'paste');
  });

  el.linkInput.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      el.addBtn.click();
    }
  });

  el.pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        el.linkInput.focus();
        showToast('剪贴板是空的');
        return;
      }
      el.linkInput.value = text.trim();
      el.linkInput.focus();
    } catch (_) {
      el.linkInput.focus();
      showToast('浏览器不允许直接读剪贴板，请长按输入框粘贴');
    }
  });

  el.filterChips.addEventListener('click', event => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    state.filter = chip.dataset.filter || 'all';
    for (const node of el.filterChips.querySelectorAll('.chip')) {
      const active = node === chip;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-selected', active ? 'true' : 'false');
    }
    renderItems();
  });

  el.searchInput.addEventListener('input', () => {
    state.query = el.searchInput.value;
    renderItems();
  });

  el.syncAllBtn.addEventListener('click', syncAll);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const settings = state.settings;
    if (settings.autoPullFeishu !== 'open' || !settings.feishuReadUrl) return;
    if (Date.now() - (Number(settings.feishuPulledAt) || 0) < 5 * 60 * 1000) return;
    pullFeishu({ silent: true });
  });

  el.settingsBtn.addEventListener('click', () => openSettings(false));

  el.itemList.addEventListener('click', event => {
    const btn = event.target.closest('button[data-act]');
    if (!btn) return;
    const card = btn.closest('.item');
    if (!card) return;
    const item = findItem(card.dataset.id);
    if (!item) return;
    const act = btn.dataset.act;

    if (act === 'download') {
      enqueueTask(item.id, 'download');
    } else if (act === 'extract') {
      if (item.transcript && item.summary) {
        state.expanded.add(item.id);
        renderItems();
      } else {
        enqueueTask(item.id, 'extract', { force: false });
      }
    } else if (act === 'copy-summary') {
      copyText(item.summary).then(ok => showToast(ok ? '总结已复制' : '复制失败，请长按文字手动复制'));
    } else if (act === 'copy-transcript') {
      copyText(item.transcript).then(ok => showToast(ok ? '文案已复制' : '复制失败，请长按文字手动复制'));
    } else if (act === 'sync') {
      syncItem(item);
    } else if (act === 'confirm-sync') {
      item.syncState = 'done';
      item.syncedAt = item.syncedAt || Date.now();
      item.syncError = '';
      touch(item);
      persistItems();
      renderItems();
      showToast('已标记为已同步');
    } else if (act === 'reparse') {
      enqueueTask(item.id, 'parse', { force: true });
    } else if (act === 'reextract') {
      if (!confirm('重新提取会重新下载视频并调用转写，确定继续吗？')) return;
      enqueueTask(item.id, 'extract', { force: true });
    } else if (act === 'open') {
      const win = window.open(item.url, '_blank');
      if (!win) showToast('浏览器拦截了新窗口，请长按链接手动打开');
    } else if (act === 'delete') {
      if (!confirm('删除这条收藏？本机记录会被移除，飞书表格里的记录不受影响。')) return;
      state.items = state.items.filter(entry => entry.id !== item.id);
      state.expanded.delete(item.id);
      state.notes.delete(item.id);
      persistItems();
      renderItems();
      showToast('已删除');
    }
  });

  el.sheetWrap.addEventListener('click', event => {
    if (event.target.closest('[data-sheet-close]')) closeSettings();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !el.sheetWrap.hidden) closeSettings();
  });

  el.toggleKeyBtn.addEventListener('click', () => {
    const showing = el.asrKey.type === 'text';
    el.asrKey.type = showing ? 'password' : 'text';
    el.toggleKeyBtn.textContent = showing ? '显示' : '隐藏';
  });

  el.testKeyBtn.addEventListener('click', testKey);
  el.testWebhookBtn.addEventListener('click', testWebhook);
  el.copySampleBtn.addEventListener('click', copySample);
  el.pullFeishuBtn.addEventListener('click', () => {
    syncSettingsFromForm();
    pullFeishu();
  });
  el.testFeishuBtn.addEventListener('click', testFeishuRead);
  el.copyWorkerBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('./relay/worker.js', { cache: 'no-store' });
      if (!response.ok) throw new Error('读取失败');
      const ok = await copyText(await response.text());
      showToast(ok ? '中转代码已复制，去 Cloudflare 粘贴' : '复制失败，请打开代码文件手动复制', 3600);
    } catch (_) {
      showToast('读取中转代码失败，请打开代码文件手动复制');
    }
  });
  el.exportBtn.addEventListener('click', exportBackup);
  el.importBtn.addEventListener('click', () => el.importFile.click());
  el.importFile.addEventListener('change', () => {
    const file = el.importFile.files && el.importFile.files[0];
    el.importFile.value = '';
    importBackup(file);
  });
  el.clearBtn.addEventListener('click', clearAll);

  for (const node of [el.asrKey, el.asrModel, el.chatModel, el.webhook, el.webhookToken]) {
    node.addEventListener('input', () => {
      updateKeyState();
      clearTimeout(node.__saveTimer);
      node.__saveTimer = setTimeout(() => {
        syncSettingsFromForm();
      }, 450);
    });
  }
  for (const node of [el.autoSync, el.iosSave]) {
    node.addEventListener('change', syncSettingsFromForm);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // 更新时间显示
      if (state.items.length) renderItems();
    }
  });
}

/* ---------------- 入口 ---------------- */

function handleIncoming() {
  const params = new URLSearchParams(location.search);
  const hasShare = ['add', 'url', 'text', 'title'].some(key => params.get(key));
  if (!hasShare) return;

  const candidates = ['add', 'url', 'text', 'title']
    .map(key => params.get(key))
    .filter(Boolean);
  const withLink = candidates.find(value => extractUrl(value));
  const clean = location.origin + location.pathname;
  history.replaceState(null, '', clean);
  if (!withLink) {
    if (params.get('add') || params.get('url') || params.get('text')) {
      showToast('没有从分享内容里找到链接');
    }
    return;
  }
  setTimeout(() => addFromText(withLink, 'share'), 120);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';
  if (!secure) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

function applyPlatformHints() {
  if (!el.phoneModeHint) return;
  const standalone = !!(window.navigator.standalone);
  if (isIOS) {
    el.phoneModeHint.textContent = standalone
      ? '当前是主屏幕 App：iOS 的主屏幕 App 与 Safari 存储互不相通，快捷指令写入的是 Safari。请用本页的「从剪贴板粘贴」添加；API Key 也需要在本 App 里单独填写。'
      : '当前在 Safari：快捷指令会打开同一个页面，添加的数据能直接看到。若之后添加到主屏幕，二者存储不会自动互通，可用导出/导入迁移。';
    if (standalone) {
      el.addHint.textContent = '在抖音等 App 复制分享链接后，点「从剪贴板粘贴」存入；主屏幕 App 与 Safari 的数据不互通。';
    }
  } else {
    el.phoneModeHint.textContent = '安卓：在 Chrome 里安装到主屏幕后，分享面板可以直接选「视频收藏」，数据互通。';
  }
}

function ensurePersistentStorage() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(() => {});
    }
  } catch (_) {}
}

function init() {
  cacheEls();
  loadSettings();
  loadItems();
  bindEvents();
  renderItems();
  fillSettingsForm();
  applyPlatformHints();
  ensurePersistentStorage();
  el.versionLine.textContent = `版本 1.1 · 本机存储 · ${location.host || '本地文件'}`;
  handleIncoming();
  if (state.settings.autoPullFeishu === 'open' && state.settings.feishuReadUrl) {
    setTimeout(() => pullFeishu({ silent: true }), 900);
  }
  registerServiceWorker();
}

init();
