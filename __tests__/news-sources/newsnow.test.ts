import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { NewsnowSource } from '../../shared/news-sources/newsnow';
import type { SourceConfig } from '../../shared/news-sources/types';

const MOCK_API_RESPONSE_DATA_ITEMS = {
  items: [
    { title: '热点1', url: 'https://example.com/1', extra: { value: '100万' }, desc: '摘要1' },
    { title: '热点2', url: 'https://example.com/2', extra: { value: '80万' }, desc: '摘要2' },
    { title: '热点3', url: 'https://example.com/3', extra: {}, desc: '' },
  ],
};

const MOCK_API_RESPONSE_DATA = {
  items: [
    { title: '微博热点', url: 'https://weibo.com/1', extra: { value: '50万' }, desc: '微博摘要' },
  ],
};

const createSourceConfig = (overrides: Partial<SourceConfig['config']> = {}): SourceConfig => ({
  id: 'newsnow',
  name: 'NewsNow',
  enabled: true,
  type: 'newsnow',
  config: {
    baseUrl: 'https://api.newsnow.cn',
    platforms: ['weibo', 'zhihu'],
    timeout: 5000,
    ...overrides,
  },
});

describe('NewsnowSource', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('解析 newsnow API 响应（包含 data.items）', async () => {
    globalThis.fetch = async (url: string) => {
      expect(url).toContain('api.newsnow.cn');
      expect(url).toContain('id=weibo');
      return new Response(JSON.stringify(MOCK_API_RESPONSE_DATA_ITEMS), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const source = new NewsnowSource(
      createSourceConfig({ baseUrl: 'https://api.newsnow.cn', platforms: ['weibo'], timeout: 5000 })
    );

    const items = await source.fetch({ topN: 5 });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty('platform');
    expect(items[0]).toHaveProperty('title');
    expect(items[0]).toHaveProperty('url');
    expect(items[0].title).toBe('热点1');
    expect(items[0].url).toBe('https://example.com/1');
    expect(items[0].hotValue).toBe('100万');
    expect(items[0].rank).toBe(1);
  });

  test('解析 newsnow API 响应（单项数据）', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify(MOCK_API_RESPONSE_DATA), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    const source = new NewsnowSource(
      createSourceConfig({ platforms: ['weibo'], timeout: 5000 })
    );

    const items = await source.fetch({ topN: 5 });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].title).toBe('微博热点');
    expect(items[0].platform).toBe('微博');
  });

  test('处理 fetch 超时（5秒）', async () => {
    globalThis.fetch = async (_url: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise<Response>((resolve, reject) => {
        const timeoutId = setTimeout(() => resolve(new Response('{}')), 10000);
        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        }
      });
    };

    const source = new NewsnowSource(
      createSourceConfig({ platforms: ['weibo'], timeout: 50 })
    );

    await expect(source.fetch({ topN: 5 })).rejects.toThrow(/超时|timeout|abort|失败/i);
  });

  test('处理 API 返回错误', async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
      });

    const source = new NewsnowSource(
      createSourceConfig({ platforms: ['weibo'], timeout: 5000 })
    );

    await expect(source.fetch({ topN: 5 })).rejects.toThrow(/失败|HTTP|500/i);
  });

  test('尊重 topN 限制', async () => {
    const manyItems = Array.from({ length: 20 }, (_, i) => ({
      title: `热点${i + 1}`,
      url: `https://example.com/${i + 1}`,
      extra: {},
      desc: '',
    }));

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ items: manyItems }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    const source = new NewsnowSource(
      createSourceConfig({ platforms: ['weibo'], timeout: 5000 })
    );

    const items = await source.fetch({ topN: 3 });

    expect(items.length).toBe(3);
    expect(items[0].title).toBe('热点1');
    expect(items[2].title).toBe('热点3');
  });

  test('实现 NewsSource 接口', () => {
    const source = new NewsnowSource(createSourceConfig());
    expect(source.id).toBe('newsnow');
    expect(source.name).toBe('NewsNow');
    expect(source.enabled).toBe(true);
    expect(typeof source.fetch).toBe('function');
  });
});
