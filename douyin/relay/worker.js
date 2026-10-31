/*
 * 视频收藏 · 飞书只读中转（Cloudflare Worker，免费版够用）
 *
 * 部署后在 Worker 的变量/密钥里配置：
 *   FEISHU_APP_ID      飞书企业自建应用的 App ID
 *   FEISHU_APP_SECRET  飞书企业自建应用的 App Secret
 *   FEISHU_APP_TOKEN   多维表格地址 /base/ 后面那一段
 *   FEISHU_TABLE_ID    多维表格地址 ?table= 后面那一段
 *   RELAY_TOKEN        自己设一个长口令，网页里填同一个
 * 可选：
 *   ALLOW_ORIGIN       允许的网页来源，默认 https://z-center666.github.io
 *
 * 网页里访问：https://<worker>.workers.dev/records
 * 请求头：Authorization: Bearer <RELAY_TOKEN>
 *
 * 这个中转只读、不写表格；App Secret 只存在 Worker 里，不会进网页。
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || 'https://z-center666.github.io',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-store',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'GET') {
      return json({ error: '只支持 GET' }, 405, cors);
    }

    const url = new URL(request.url);
    if (!url.pathname.replace(/\/+$/, '').endsWith('/records')) {
      return json({ error: '路径应为 /records' }, 404, cors);
    }

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!env.RELAY_TOKEN || token !== env.RELAY_TOKEN) {
      return json({ error: '口令不正确' }, 401, cors);
    }
    if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET || !env.FEISHU_APP_TOKEN || !env.FEISHU_TABLE_ID) {
      return json({ error: 'Worker 变量还没配齐' }, 500, cors);
    }

    try {
      const accessToken = await tenantToken(env);
      const records = await listRecords(env, accessToken);
      return json({ records, pulledAt: Date.now() }, 200, cors);
    } catch (error) {
      return json({ error: error && error.message ? error.message : '读取飞书失败' }, 502, cors);
    }
  }
};

let cachedToken = { value: '', expiresAt: 0 };

async function tenantToken(env) {
  if (cachedToken.value && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.value;
  }
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET })
  });
  const data = await response.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(data.msg || '获取飞书访问令牌失败');
  }
  cachedToken = {
    value: data.tenant_access_token,
    expiresAt: Date.now() + (Number(data.expire) || 7200) * 1000
  };
  return cachedToken.value;
}

async function listRecords(env, token) {
  const base = 'https://open.feishu.cn/open-apis/bitable/v1/apps/' +
    encodeURIComponent(env.FEISHU_APP_TOKEN) + '/tables/' +
    encodeURIComponent(env.FEISHU_TABLE_ID) + '/records';
  const out = [];
  let pageToken = '';

  do {
    const url = new URL(base);
    url.searchParams.set('page_size', '500');
    if (pageToken) url.searchParams.set('page_token', pageToken);
    const response = await fetch(url.toString(), {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.msg || '读取多维表格失败');
    }
    const page = (data.data && data.data.items) || [];
    for (const record of page) {
      const item = normalize(record);
      if (item) out.push(item);
    }
    pageToken = data.data && data.data.has_more ? data.data.page_token : '';
  } while (pageToken);

  return out;
}

function normalize(record) {
  const fields = (record && record.fields) || {};
  const url = field(fields, ['视频链接', '链接', 'url', 'URL', 'link']);
  if (!url) return null;
  return {
    id: record.record_id || '',
    url,
    title: field(fields, ['标题', 'title', '名称']),
    desc: field(fields, ['描述文案', '描述', 'desc', 'description']),
    transcript: field(fields, ['口播文案', '文案', 'transcript']),
    summary: field(fields, ['视频总结', '总结', 'summary']),
    author: field(fields, ['作者', 'author']),
    cover: httpUrl(field(fields, ['封面', 'cover'])),
    status: field(fields, ['处理状态', 'status']),
    savedAt: timestamp(fields['收藏时间']),
    syncedAt: timestamp(fields['同步时间'])
  };
}

function field(fields, names) {
  for (const name of names) {
    if (!Object.prototype.hasOwnProperty.call(fields, name)) continue;
    const value = text(fields[name]);
    if (value) return value;
  }
  return '';
}

function httpUrl(value) {
  return /^https?:\/\//i.test(value) ? value : '';
}

function text(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('');
  if (typeof value === 'object') {
    return text(value.text) || text(value.name) || text(value.link) || text(value.url) || '';
  }
  return '';
}

function timestamp(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value > 1e12 ? value : (value > 1e9 ? value * 1000 : 0);
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return timestamp(Number(value));
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' }
  });
}
