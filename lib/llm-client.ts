/**
 * LLM Client Utility - Comprehensive LLM Integration
 * TypeScript version supporting multiple providers
 */

export enum LLMProvider {
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
  GEMINI = "gemini",
  OLLAMA = "ollama",
  LOCAL = "local",
  ENTERPRISE = "enterprise",
  APIGEE = "apigee"
}

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

export interface TokenInfo {
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

export class LLMClient {
  private config: LLMConfig;
  private logger: Console;

  constructor(config: LLMConfig) {
    this.config = config;
    this.logger = console;
  }

  async callLLM(prompt: string): Promise<string> {
    try {
      switch (this.config.provider) {
        case LLMProvider.OPENAI:
          return await this.callOpenAI(prompt);
        case LLMProvider.ANTHROPIC:
          return await this.callAnthropic(prompt);
        case LLMProvider.GEMINI:
          return await this.callGemini(prompt);
        case LLMProvider.OLLAMA:
          return await this.callOllama(prompt);
        case LLMProvider.LOCAL:
          return await this.callLocal(prompt);
        case LLMProvider.ENTERPRISE:
          return await this.callEnterprise(prompt);
        case LLMProvider.APIGEE:
          return await this.callApigee(prompt);
        default:
          throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error(`⚠️ LLM call failed for provider ${this.config.provider}:`, error);
      throw error;
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.apiKey}`
    };

    const payload = {
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const url = this.config.baseUrl 
      ? `${this.config.baseUrl}/v1/chat/completions`
      : "https://api.openai.com/v1/chat/completions";

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("Anthropic API key not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.config.apiKey,
      "anthropic-version": "2023-06-01"
    };

    const payload = {
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const url = this.config.baseUrl 
      ? `${this.config.baseUrl}/v1/messages`
      : "https://api.anthropic.com/v1/messages";

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error("Google Gemini API key not configured");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callOllama(prompt: string): Promise<string> {
    const url = this.config.baseUrl 
      ? `${this.config.baseUrl}/api/chat`
      : "http://localhost:11434/api/chat";

    const payload = {
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.config.temperature
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  private async callLocal(prompt: string): Promise<string> {
    if (!this.config.baseUrl) {
      throw new Error("Local LLM base URL not configured");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const payload = {
      model: this.config.model,
      messages: [{ role: "user", content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`Local LLM API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callEnterprise(prompt: string): Promise<string> {
    if (!this.config.baseUrl) {
      throw new Error("Enterprise LLM base URL not configured");
    }

    // For enterprise, we'll use a simple approach
    // In a real implementation, you'd handle token management here
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    const payload = {
      model: this.config.model,
      prompt: prompt,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const response = await fetch(this.config.baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout * 1000)
    });

    if (!response.ok) {
      throw new Error(`Enterprise LLM error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content;
  }

  private async callApigee(prompt: string): Promise<string> {
    // Apigee implementation would require additional setup
    // For now, we'll use a mock implementation
    throw new Error("Apigee integration requires additional configuration");
  }

  isAvailable(): boolean {
    try {
      switch (this.config.provider) {
        case LLMProvider.OPENAI:
        case LLMProvider.ANTHROPIC:
        case LLMProvider.GEMINI:
          const hasKey = !!this.config.apiKey;
          return hasKey;
        case LLMProvider.LOCAL:
        case LLMProvider.OLLAMA:
          const hasUrl = !!this.config.baseUrl;
          return hasUrl;
        case LLMProvider.ENTERPRISE:
          const hasEnterpriseConfig = !!(this.config.baseUrl && this.config.apiKey);
          return hasEnterpriseConfig;
        case LLMProvider.APIGEE:
          return false; // Requires additional setup
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
}

export function createLLMClientFromEnv(): LLMClient | null {
  const providers = [
    { provider: LLMProvider.OPENAI, envKey: "OPENAI_API_KEY" },
    { provider: LLMProvider.ANTHROPIC, envKey: "ANTHROPIC_API_KEY" },
    { provider: LLMProvider.GEMINI, envKey: "GEMINI_API_KEY" },
    { provider: LLMProvider.ENTERPRISE, envKey: "ENTERPRISE_LLM_URL" },
    { provider: LLMProvider.LOCAL, envKey: "LOCAL_LLM_URL" },
    { provider: LLMProvider.OLLAMA, envKey: "OLLAMA_HOST" }
  ];

  for (const { provider, envKey } of providers) {
    if (process.env[envKey]) {
      try {
        const config = createConfigForProvider(provider);
        const client = new LLMClient(config);
        if (client.isAvailable()) {
          return client;
        }
      } catch (error) {
        console.warn(`Failed to create ${provider} client:`, error);
        continue;
      }
    }
  }

  return null;
}

function createConfigForProvider(provider: LLMProvider): LLMConfig {
  switch (provider) {
    case LLMProvider.OPENAI:
      return {
        provider,
        model: process.env.OPENAI_MODEL || "gpt-4",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: process.env.OPENAI_BASE_URL,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "4000"),
        timeout: 300
      };

    case LLMProvider.ANTHROPIC:
      return {
        provider,
        model: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229",
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseUrl: process.env.ANTHROPIC_BASE_URL,
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || "4000"),
        timeout: 300
      };

    case LLMProvider.GEMINI:
      return {
        provider,
        model: process.env.GEMINI_MODEL || "gemini-pro",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_BASE_URL,
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || "4000"),
        timeout: 300
      };

    case LLMProvider.LOCAL:
      return {
        provider,
        model: process.env.LOCAL_LLM_MODEL || "llama-3.2-3b-instruct",
        apiKey: process.env.LOCAL_LLM_API_KEY,
        baseUrl: process.env.LOCAL_LLM_URL || "http://localhost:1234/v1",
        temperature: parseFloat(process.env.LOCAL_LLM_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.LOCAL_LLM_MAX_TOKENS || "40000"),
        timeout: 300
      };

    case LLMProvider.OLLAMA:
      return {
        provider,
        model: process.env.OLLAMA_MODEL || "llama-3.2-3b-instruct",
        baseUrl: process.env.OLLAMA_HOST || "http://localhost:11434",
        temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.OLLAMA_NUM_PREDICT || "4000"),
        timeout: 300
      };

    case LLMProvider.ENTERPRISE:
      return {
        provider,
        model: process.env.ENTERPRISE_LLM_MODEL || "llama-3.2-3b-instruct",
        apiKey: process.env.ENTERPRISE_LLM_API_KEY,
        baseUrl: process.env.ENTERPRISE_LLM_URL,
        temperature: parseFloat(process.env.ENTERPRISE_LLM_TEMPERATURE || "0.1"),
        maxTokens: parseInt(process.env.ENTERPRISE_LLM_MAX_TOKENS || "4000"),
        timeout: 300
      };

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
} 