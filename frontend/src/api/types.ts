// Request/response typings aligned to the FastAPI routers under app/routers/*

export type SummarizeRequest = { text: string }
export type SummarizeResponse = Record<string, unknown>

export type IntentRequest = { text: string }
export type IntentResponse = Record<string, unknown>

export type TaskClassificationRequest = {
  intent: string
  entities?: Record<string, unknown>
  context?: Record<string, unknown>
  original_text?: string
  confidence?: number
  text?: string
}
export type TaskClassificationResponse = { task: unknown }

export type TaskCreateRequest = { description: string }
export type TaskUpdateRequest = { description?: string | null; status?: string | null }
export type Task = {
  id: number
  description: string
  status: string
  created_at: string
  updated_at: string
}

export type EmbedRequest = {
  texts: string[]
  user_id?: string
  session_id?: string
  platform?: string
}
export type EmbedResponse = { embeddings: number[][]; obfuscated_embeddings: number[][] }

export type SimilarityRequest = {
  texts1: string[]
  texts2: string[]
  user_id?: string
  session_id?: string
  platform?: string
}
export type SimilarityResponse = { similarities: number[][] }

export type RespondRequest = {
  query: string
  context?: Record<string, unknown>
  model?: string
  decision?: 'respond' | 'bhiv_core'
}
export type RespondResponse = { response?: string; error?: string } & Record<string, unknown>

export type BHIVRequest = { query: string; context?: Record<string, unknown> }
export type BHIVResponse = { bhiv_output: unknown }

export type RLActionRequest = { state: Record<string, unknown>; actions: unknown[] }
export type RLActionResponse = { selected_action: unknown; probabilities: unknown; ranking: unknown }

export type ExternalLLMRequest = { prompt: string; model?: string }
export type ExternalLLMResponse = { response: string }

export type ExternalAppRequest = { app: string; action: string; params?: Record<string, unknown> }
export type ExternalAppResponse = { result: unknown }

export type VoiceTTSRequest = {
  text: string
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  model?: 'gpt-4o-mini-tts' | 'gpt-4o-realtime-tts'
  save_cache?: boolean
}
export type VoiceTTSResponse = { audio_base64: string }

export type VoiceSTTResponse = { text: string; language: string; confidence: number | null }

export type DecisionHubResponse = Record<string, unknown>

export type TokenRequest = { username: string }
export type TokenResponse = { access_token: string; token_type: 'bearer' }

