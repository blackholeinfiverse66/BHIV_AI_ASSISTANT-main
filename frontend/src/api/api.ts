import { ApiClient } from './client'
import type {
  SummarizeRequest,
  SummarizeResponse,
  IntentRequest,
  IntentResponse,
  TaskClassificationRequest,
  TaskClassificationResponse,
  TaskCreateRequest,
  TaskUpdateRequest,
  Task,
  EmbedRequest,
  EmbedResponse,
  SimilarityRequest,
  SimilarityResponse,
  RespondRequest,
  RespondResponse,
  BHIVRequest,
  BHIVResponse,
  RLActionRequest,
  RLActionResponse,
  ExternalLLMRequest,
  ExternalLLMResponse,
  ExternalAppRequest,
  ExternalAppResponse,
  VoiceTTSRequest,
  VoiceTTSResponse,
  VoiceSTTResponse,
  DecisionHubResponse,
  TokenRequest,
  TokenResponse,
} from './types'

export function createBhivApi(client: ApiClient) {
  return {
    summarize: (req: SummarizeRequest) =>
      client.request<SummarizeResponse>({ method: 'POST', path: '/api/summarize', json: req }),
    intent: (req: IntentRequest) =>
      client.request<IntentResponse>({ method: 'POST', path: '/api/intent', json: req }),
    classifyTask: (req: TaskClassificationRequest) =>
      client.request<TaskClassificationResponse>({ method: 'POST', path: '/api/task', json: req }),

    createTask: (req: TaskCreateRequest) =>
      client.request<Task>({ method: 'POST', path: '/api/tasks', json: req }),
    listTasks: () => client.request<Task[]>({ method: 'GET', path: '/api/tasks' }),
    getTask: (taskId: number) => client.request<Task>({ method: 'GET', path: `/api/tasks/${taskId}` }),
    updateTask: (taskId: number, req: TaskUpdateRequest) =>
      client.request<Task>({ method: 'PUT', path: `/api/tasks/${taskId}`, json: req }),
    deleteTask: (taskId: number) =>
      client.request<{ message: string }>({ method: 'DELETE', path: `/api/tasks/${taskId}` }),

    embed: (req: EmbedRequest) => client.request<EmbedResponse>({ method: 'POST', path: '/api/embed', json: req }),
    similarity: (req: SimilarityRequest) =>
      client.request<SimilarityResponse>({ method: 'POST', path: '/api/embed/similarity', json: req }),

    respond: (req: RespondRequest) => client.request<RespondResponse>({ method: 'POST', path: '/api/respond', json: req }),
    bhivRun: (req: BHIVRequest) => client.request<BHIVResponse>({ method: 'POST', path: '/api/bhiv/run', json: req }),

    rlAction: (req: RLActionRequest) => client.request<RLActionResponse>({ method: 'POST', path: '/api/rl_action', json: req }),

    externalLlm: (req: ExternalLLMRequest) =>
      client.request<ExternalLLMResponse>({ method: 'POST', path: '/api/external_llm', json: req }),
    externalApp: (req: ExternalAppRequest) =>
      client.request<ExternalAppResponse>({ method: 'POST', path: '/api/external_app', json: req }),

    voiceTts: (req: VoiceTTSRequest) =>
      client.request<VoiceTTSResponse>({ method: 'POST', path: '/api/voice_tts', json: req, timeoutMs: 60_000 }),
    voiceStt: (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      return client.request<VoiceSTTResponse>({ method: 'POST', path: '/api/voice_stt', formData: fd, timeoutMs: 60_000 })
    },

    decisionHub: (args: { input_text: string; platform?: string; device_context?: string; voice_input?: boolean; audio_file?: File | null }) => {
      const fd = new FormData()
      fd.append('input_text', args.input_text)
      fd.append('platform', args.platform || 'web')
      fd.append('device_context', args.device_context || 'desktop')
      fd.append('voice_input', String(Boolean(args.voice_input)))
      if (args.audio_file) fd.append('audio_file', args.audio_file)
      return client.request<DecisionHubResponse>({ method: 'POST', path: '/api/decision_hub', formData: fd, timeoutMs: 60_000 })
    },

    // Optional auth module (backend must expose this route; see README notes)
    token: (req: TokenRequest) => client.request<TokenResponse>({ method: 'POST', path: '/api/auth/token', json: req }),
  }
}

