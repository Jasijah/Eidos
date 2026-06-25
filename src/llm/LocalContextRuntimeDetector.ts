export interface LocalContextRuntimeStatus { available: boolean; endpoint?: string; model?: string; message: string; }

export class LocalContextRuntimeDetector {
  constructor(private readonly endpoint = 'http://127.0.0.1:11434') {}
  async detect(signal?: AbortSignal): Promise<LocalContextRuntimeStatus> {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, { signal });
      if (!response.ok) return { available: false, message: `Local runtime returned ${response.status}.` };
      const payload = await response.json() as { models?: Array<{ name?: string }> };
      const model = payload.models?.find((entry) => /qwen3(?::|-)?4b/i.test(entry.name ?? ''))?.name;
      return model ? { available: true, endpoint: this.endpoint, model, message: 'Local Qwen context runtime detected.' } : { available: false, endpoint: this.endpoint, message: 'Local runtime found, but Qwen 3 4B is not installed.' };
    } catch { return { available: false, message: 'No local context runtime detected.' }; }
  }
}