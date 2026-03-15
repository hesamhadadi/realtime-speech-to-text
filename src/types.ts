export type SupportedLang =
  | "en-US" | "en-GB"
  | "fa-IR"
  | "it-IT"
  | "de-DE"
  | "fr-FR"
  | "es-ES"
  | "ar-SA"
  | "zh-CN"
  | "ja-JP"
  | (string & {})

export interface SpeechOptions {
  /** BCP-47 language tag. Default: "en-US" */
  lang?: SupportedLang
  /** Keep listening after pauses. Default: true */
  continuous?: boolean
  /** Emit interim (live) results. Default: false */
  interimResults?: boolean
  /** Called when a final transcript segment is ready */
  onResult: (transcript: string, isFinal: boolean) => void
  /** Called with live text while speaking (requires interimResults: true) */
  onInterim?: (transcript: string) => void
  /** Called on recognition error */
  onError?: (event: any) => void
  /** Called when recognition starts */
  onStart?: () => void
  /** Called when recognition ends */
  onEnd?: () => void
}

export interface SpeechRecognitionInstance {
  start(): void
  stop(): void
  abort(): void
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}
