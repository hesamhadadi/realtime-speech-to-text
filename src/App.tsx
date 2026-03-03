import React, { useEffect, useMemo, useRef, useState } from "react";
import { exportTextAsPdf } from "./utils/exportPdf";
import { enhanceToNotes } from "./utils/aiNotes";
type SpeechRecognitionType = typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : any;

function isSpeechSupported() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

function getRecognizerCtor(): SpeechRecognitionType | null {
  // @ts-expect-error
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export default function App() {
  const supported = useMemo(() => isSpeechSupported(), []);
  const recognizerRef = useRef<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lang, setLang] = useState<"fa-IR" | "en-US">("fa-IR");
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("OR_KEY") || ""
  );
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");

  const [status, setStatus] = useState<string>(
    supported ? "آماده" : "مرورگر شما تبدیل گفتار به متن را پشتیبانی نمی‌کند."
  );

  const fullText = useMemo(() => {
    return (finalText + (interimText ? "\n" + interimText : "")).trim();
  }, [finalText, interimText]);

  useEffect(() => {
    if (!supported) return;

    const Ctor = getRecognizerCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    recognizerRef.current = rec;

    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => setStatus("در حال گوش دادن…");
    rec.onend = () => {
      setStatus("متوقف شد");
      setIsListening(false);
      setInterimText("");
    };
    rec.onerror = (e: any) => {
      setStatus(`خطا: ${e?.error || "unknown"}`);
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalChunk += transcript;
        else interim += transcript;
      }

      if (finalChunk) {
        setFinalText((prev) => (prev ? prev + "\n" + finalChunk.trim() : finalChunk.trim()));
      }
      setInterimText(interim.trim());
    };

    return () => {
      try {
        rec.stop?.();
      } catch {}
    };
  }, [lang, supported]);

  useEffect(() => {
    localStorage.setItem("OR_KEY", apiKey);
  }, [apiKey]);
  const handleAISmartNotes = async () => {
    if (!apiKey) {
      setStatus("OpenRouter API Key رو وارد کن.");
      return;
    }
  
    setAiLoading(true);
    setStatus("AI در حال ساخت جزوه...");
  
    try {
      const result = await enhanceToNotes(
        finalText,
        lang.startsWith("fa") ? "fa" : "en",
        apiKey
      );
  
      setFinalText(result);
      setStatus("جزوه آماده شد ✅");
    } catch (e) {
      setStatus("خطا در ارتباط با AI");
    } finally {
      setAiLoading(false);
    }
  };
  const start = () => {
    const rec = recognizerRef.current;
    if (!rec) return;
    try {
      rec.lang = lang;
      rec.start();
      setIsListening(true);
    } catch {
      setStatus("اگر قبلاً روشن بوده، یک بار Stop بزن و دوباره Start کن.");
    }
  };

  const stop = () => {
    const rec = recognizerRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {}
  };

  const clearAll = () => {
    setFinalText("");
    setInterimText("");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullText || "");
      setStatus("کپی شد ✅");
      setTimeout(() => setStatus(isListening ? "در حال گوش دادن…" : "آماده"), 1200);
    } catch {
      setStatus("کپی ناموفق بود. دسترسی Clipboard را اجازه بده.");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([fullText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => exportTextAsPdf(fullText || "");

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>تبدیل صدا به متن (Real-time)</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85, lineHeight: 1.6 }}>
            Start را بزن، صحبت کن، متن زنده می‌آید. بعدش Copy یا PDF بگیر.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 14, opacity: 0.9 }}>
            زبان:
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              disabled={isListening}
              style={{
                marginRight: 8,
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: "#e8eefc"
              }}
            >
              <option value="fa-IR">فارسی (fa-IR)</option>
              <option value="en-US">English (en-US)</option>
            </select>
          </label>
        </div>
      </header>

      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)"
        }}
      >
        <input
  value={apiKey}
  onChange={(e) => setApiKey(e.target.value)}
  placeholder="OpenRouter API Key"
  style={{
    padding: "8px",
    borderRadius: 8,
    marginRight: 8
  }}
/>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={start} disabled={!supported || isListening} style={btnStyle(isListening ? 0.6 : 1)}>
            ▶️ Start
          </button>

          <button onClick={stop} disabled={!supported || !isListening} style={btnStyle(!isListening ? 0.6 : 1)}>
            ⏹ Stop
          </button>
          <button
  onClick={handleAISmartNotes}
  disabled={aiLoading}
  style={btnStyle(aiLoading ? 0.6 : 1)}
>
  ✨ AI Smart Notes
</button>
          <button onClick={copy} disabled={!supported} style={btnStyle(1)}>
            📋 Copy
          </button>

          <button onClick={downloadPdf} disabled={!supported} style={btnStyle(1)}>
            🧾 PDF
          </button>

          <button onClick={downloadTxt} disabled={!supported} style={btnStyle(1)}>
            ⬇️ TXT
          </button>

          <button onClick={clearAll} disabled={!supported} style={btnStyle(1)}>
            🗑 پاک کردن
          </button>

          <span style={{ marginRight: "auto", opacity: 0.9, alignSelf: "center" }}>
            وضعیت: <b>{status}</b>
          </span>
        </div>
      </div>

      <main style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {!supported && (
          <div style={warnStyle}>
            مرورگر شما Speech Recognition را پشتیبانی نمی‌کند.
            <br />
            پیشنهاد: Chrome یا Edge را استفاده کن.
          </div>
        )}

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>متن نهایی</h2>
            <span style={{ fontSize: 12, opacity: 0.75 }}>هر جمله‌ی Final اینجا اضافه می‌شود</span>
          </div>

          <textarea
            value={finalText}
            onChange={(e) => setFinalText(e.target.value)}
            placeholder="متن نهایی اینجا..."
            style={textareaStyle}
          />
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>متن موقت (Interim)</h2>
            <span style={{ fontSize: 12, opacity: 0.75 }}>حین صحبت کردن تغییر می‌کند</span>
          </div>

          <textarea value={interimText} readOnly placeholder="متن موقت اینجا..." style={{ ...textareaStyle, opacity: 0.9 }} />
        </div>
      </main>

      <footer style={{ marginTop: 16, opacity: 0.75, fontSize: 12, lineHeight: 1.6 }}>
        نکته: برای کارکرد درست میکروفون، سایت باید روی HTTPS باشد (GitHub Pages هست).
      </footer>
    </div>
  );
}

function btnStyle(opacity: number): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.08)",
    color: "#e8eefc",
    cursor: "pointer",
    opacity
  };
}

const cardStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)"
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: 220,
  marginTop: 10,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(0,0,0,0.22)",
  color: "#e8eefc",
  resize: "vertical",
  outline: "none",
  lineHeight: 1.7
};

const warnStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,180,0,0.35)",
  background: "rgba(255,180,0,0.08)"
};