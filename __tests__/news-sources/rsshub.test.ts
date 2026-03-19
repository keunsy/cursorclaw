import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { RSSHubSource } from '../../shared/news-sources/rsshub';
import type { SourceConfig } from '../../shared/news-sources/types';

/** 标准 RSS 2.0 格式 XML（RSSHub 返回格式） */
const MOCK_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>微博热搜</title>
    <item>
      <title><![CDATA[热点新闻标题1]]></title>
      <link>https://weibo.com/search/hot?q=1</link>
      <pubDate>Mon, 16 Mar 2026 08:00:00 GMT</pubDate>
      <description><![CDATA[<p>这是第一条新闻的摘要描述</p>]]></description>
    </item>
    <item>
      <title><![CDATA[热点新闻标题2]]></title>
      <link>https://weibo.com/search/hot?q=2</link>
      <pubDate>Mon, 16 Mar 2026 07:30:00 GMT</pubDate>
      <description><![CDATA[第二条新闻的摘要]]></description>
    </item>
    <item>
      <title><![CDATA[热点新闻标题3]]></title>
      <link>https://weibo.com/search/hot?q=3</link>
      <pubDate>Mon, 16 Mar 2026 07:00:00 GMT</pubDate>
      <description><![CDATA[]]></description>
    </item>
  </channel>
</rss>`;

/** 无效 XML */
const INVALID_XML = 'not valid xml at all <<<';

const createSourceConfig = (overrides: Partial<SourceConfig['config']> = {}): SourceConfig => ({
  id: 'rsshub',
  name: 'RSSHub',
  enabled: true,
  type: 'rsshub',
  config: {
    baseUrl: 'https://rsshub.app',
    feeds: ['weibo/search/hot'],
    timeout: 15000,
    ...overrides,
  },
});

describe('RSSHubSource', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('解析 RSS XML（包含 item、title、link、pubDate、description）', async () => {
    globalThis.fetch = async (url: string) => {
      expect(url).toContain('rsshub.app');
      expect(url).toContain('weibo/search/hot');
      return new Response(MOCK_RSS_XML, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    };

    const source = new RSSHubSource(
      createSourceConfig({ baseUrl: 'https://rsshub.app', feeds: ['weibo/search/hot'], timeout: 15000 })
    );

    const items = await source.fetch({ topN: 5 });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('platform');
    expect(items[0]).toHaveProperty('title');
    expect(items[0]).toHaveProperty('url');
    expect(items[0]).toHaveProperty('description');
    expect(items[0]).toHaveProperty('timestamp');
    expect(items[0].title).toBe('热点新闻标题1');
    expect(items[0].url).toBe('https://weibo.com/search/hot?q=1');
    expect(items[0].description).toContain('第一条新闻的摘要');
    expect(items[0].rank).toBe(1);
  });

  test('处理 fetch 超时', async () => {
    globalThis.fetch = async (_url: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('never')), 10000);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        }
      });
    };

    const source = new RSSHubSource(
      createSourceConfig({ feeds: ['weibo/search/hot'], timeout: 50 })
    );

    await expect(source.fetch({ topN: 5 })).rejects.toThrow(/超时|timeout|abort|失败/i);
  });

  test('处理无效 XML', async () => {
    globalThis.fetch = async () =>
      new Response(INVALID_XML, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });

    const source = new RSSHubSource(
      createSourceConfig({ feeds: ['weibo/search/hot'], timeout: 5000 })
    );

    await expect(source.fetch({ topN: 5 })).rejects.toThrow(/失败|invalid|XML/i);
  });

  test('尊重 topN 限制', async () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => `
    <item>
      <title><![CDATA[热点${i + 1}]]></title>
      <link>https://example.com/${i + 1}</link>
      <pubDate>Mon, 16 Mar 2026 0${i}:00:00 GMT</pubDate>
      <description><![CDATA[摘要${i + 1}]]></description>
    </item>`).join('');

    const xmlWithManyItems = `<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title>${manyItems}</channel></rss>`;

    globalThis.fetch = async () =>
      new Response(xmlWithManyItems, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });

    const source = new RSSHubSource(
      createSourceConfig({ feeds: ['weibo/search/hot'], timeout: 5000 })
    );

    const items = await source.fetch({ topN: 3 });

    expect(items.length).toBe(3);
    expect(items[0].title).toBe('热点1');
    expect(items[2].title).toBe('热点3');
  });

  test('实现 NewsSource 接口', () => {
    const source = new RSSHubSource(createSourceConfig());
    expect(source.id).toBe('rsshub');
    expect(source.name).toBe('RSSHub');
    expect(source.enabled).toBe(true);
    expect(typeof source.fetch).toBe('function');
  });

  test('处理 HTTP 错误', async () => {
    globalThis.fetch = async () =>
      new Response('Internal Server Error', { status: 500 });

    const source = new RSSHubSource(
      createSourceConfig({ feeds: ['weibo/search/hot'], timeout: 5000 })
    );

    await expect(source.fetch({ topN: 5 })).rejects.toThrow(/失败|HTTP|500/i);
  });
});
