import { SpeechOptions, SpeechRecognitionInstance } from "./types"

export function startListening(options: SpeechOptions): SpeechRecognitionInstance {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    throw new Error("SpeechRecognition is not supported. Use Chrome or Edge.")
  }

  const recognition: SpeechRecognitionInstance = new SpeechRecognition()

  recognition.lang = options.lang ?? "en-US"
  recognition.continuous = options.continuous ?? true
  recognition.interimResults = options.interimResults ?? false

  recognition.onresult = (event: any) => {
    let finalChunk = ""
    let interimChunk = ""

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript: string = result[0]?.transcript ?? ""
      if (result.isFinal) finalChunk += transcript
      else interimChunk += transcript
    }

    if (finalChunk) options.onResult(finalChunk.trim(), true)
    if (interimChunk && options.onInterim) options.onInterim(interimChunk.trim())
  }

  recognition.onerror = (event: any) => options.onError?.(event)
  recognition.onend = () => options.onEnd?.()
  recognition.onstart = () => options.onStart?.()

  recognition.start()

  return recognition
}

export function stopListening(recognition: SpeechRecognitionInstance): void {
  try { recognition.stop() } catch { /* already stopped */ }
}

export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  )
}
