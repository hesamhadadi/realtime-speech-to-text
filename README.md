# persian-realtime-speech

> Real-time speech-to-text for **Persian (Farsi)**, **English**, **Italian** and 50+ languages — zero dependencies, pure TypeScript.

[![npm version](https://img.shields.io/npm/v/persian-realtime-speech)](https://www.npmjs.com/package/persian-realtime-speech)
[![license](https://img.shields.io/npm/l/persian-realtime-speech)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/persian-realtime-speech)](https://bundlephobia.com/package/persian-realtime-speech)

Built on the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). Works in Chrome and Edge — no server, no API key.

---

## Install

```bash
npm install persian-realtime-speech
```

---

## Quick Start

```ts
import { startListening, stopListening, isSpeechRecognitionSupported } from "persian-realtime-speech"

if (!isSpeechRecognitionSupported()) {
  console.warn("Use Chrome or Edge.")
}

const recognition = startListening({
  lang: "fa-IR",
  continuous: true,
  interimResults: true,

  onResult: (text, isFinal) => {
    if (isFinal) console.log("Final:", text)
  },

  onInterim: (text) => console.log("Live:", text),
  onError:   (e)    => console.error(e),
  onStart:   ()     => console.log("Listening…"),
  onEnd:     ()     => console.log("Stopped"),
})

// Stop:
stopListening(recognition)
```

---

## React Hook

```tsx
import { useRef, useState } from "react"
import { startListening, stopListening } from "persian-realtime-speech"

export function useSpeech(lang = "fa-IR") {
  const recRef = useRef<any>(null)
  const [text, setText] = useState("")
  const [interim, setInterim] = useState("")
  const [listening, setListening] = useState(false)

  const start = () => {
    recRef.current = startListening({
      lang,
      continuous: true,
      interimResults: true,
      onResult:  (t) => setText(prev => prev + " " + t),
      onInterim: setInterim,
      onStart:   () => setListening(true),
      onEnd:     () => { setListening(false); setInterim("") },
    })
  }

  const stop = () => stopListening(recRef.current)

  return { text, interim, listening, start, stop }
}
```

---

## API

| Function | Returns | Description |
|---|---|---|
| `startListening(options)` | `SpeechRecognitionInstance` | Start recognition |
| `stopListening(instance)` | `void` | Stop recognition |
| `isSpeechRecognitionSupported()` | `boolean` | Check browser support |

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `lang` | `string` | `"en-US"` | BCP-47 language tag |
| `continuous` | `boolean` | `true` | Keep listening after pauses |
| `interimResults` | `boolean` | `false` | Emit live in-progress text |
| `onResult` | `(text, isFinal) => void` | required | Final transcript callback |
| `onInterim` | `(text) => void` | — | Live text callback |
| `onError` | `(event) => void` | — | Error callback |
| `onStart` | `() => void` | — | Recognition started |
| `onEnd` | `() => void` | — | Recognition ended |

---

## Supported Languages

| Code | Language |
|---|---|
| `fa-IR` | Persian / Farsi |
| `en-US` | English (US) |
| `it-IT` | Italian |
| `de-DE` | German |
| `fr-FR` | French |
| `ar-SA` | Arabic |
| `zh-CN` | Chinese (Simplified) |

Any valid BCP-47 tag works.

---

## Browser Support

| Browser | Supported |
|---|---|
| Chrome 33+ | ✅ |
| Edge 79+ | ✅ |
| Firefox | ❌ |
| Safari | ❌ |

> HTTPS required for mic access (localhost works in dev).

---

## Changelog

### v2.0.0
- `interimResults` + `onInterim` callback for live preview
- `onStart` / `onEnd` lifecycle callbacks
- `isSpeechRecognitionSupported()` utility
- Italian (`it-IT`) + full typed language list
- Dual ESM + CJS build with `tsup`
- Full TypeScript declarations

### v1.0.0
- Initial release — Persian & English

---

## License

MIT © [hesamhadadi](https://github.com/hesamhadadi)
