import { SpeechOptions } from "./types"

export function startListening(options: SpeechOptions) {

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    throw new Error("SpeechRecognition is not supported in this browser")
  }

  const recognition = new SpeechRecognition()

  recognition.lang = options.lang || "en-US"
  recognition.continuous = options.continuous ?? true

  recognition.onresult = (event: any) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript

    options.onResult(transcript)
  }

  recognition.onerror = (error: any) => {
    options.onError?.(error)
  }

  recognition.start()

  return recognition
}

export function stopListening(recognition: any) {
  recognition.stop()
}