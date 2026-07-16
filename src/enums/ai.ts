export enum AiProvider {
  Local = 'local',
  DeepSeek = 'deepseek',
}

export enum AiModel {
  DeepSeekChat = 'deepseek-chat',
  DeepSeekV4Flash = 'deepseek-v4-flash',
  DeepSeekV4Pro = 'deepseek-v4-pro',
}

export const DEFAULT_DEEPSEEK_MODEL = AiModel.DeepSeekV4Flash

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  [AiProvider.Local]: '本地词库',
  [AiProvider.DeepSeek]: 'DeepSeek',
}
