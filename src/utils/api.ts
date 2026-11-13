import { TranslateRequestPayload, TranslationResult } from '../types/translation';

export async function postTranslate(
  payload: TranslateRequestPayload,
  baseUrl = ''
): Promise<TranslationResult> {
  const response = await fetch(`${baseUrl}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let parsed: (TranslationResult & { error?: string }) | null = null;

  if (rawText.trim()) {
    try {
      parsed = JSON.parse(rawText) as TranslationResult & { error?: string };
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (parsed?.error) {
      throw new Error(parsed.error);
    }
    if (response.status === 404) {
      throw new Error(
        '未找到翻译接口 (/api/translate)。若您使用 Netlify 部署，请确认仓库包含 netlify.toml 与 netlify/functions 目录并重新部署。'
      );
    }
    if (response.status === 502 || response.status === 504) {
      throw new Error(
        `服务端响应超时或网关异常（HTTP ${response.status}），请稍后重试。`
      );
    }
    throw new Error(
      `翻译请求失败（HTTP ${response.status}），请检查后端函数与 GEMINI_API_KEY 环境变量配置。`
    );
  }

  if (!parsed || typeof parsed.polishedText !== 'string') {
    throw new Error(
      '服务器返回了空响应或非 JSON 内容，请检查后端 /api/translate 接口是否正常部署。'
    );
  }

  return parsed;
}
