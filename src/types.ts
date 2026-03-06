export interface SpeechOptions {
    lang?: string
    continuous?: boolean
    onResult: (text: string) => void
    onError?: (error: any) => void
  }