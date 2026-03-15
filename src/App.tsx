import React, { useEffect, useMemo, useRef, useState } from "react";
import { exportTextAsPdf } from "./utils/exportPdf";
import { enhanceToNotes } from "./utils/aiNotes";

type Lang = "fa-IR" | "en-US" | "it-IT";

function isSpeechSupported() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

function getRecognizerCtor(): any | null {
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

const LANGS: { value: Lang; label: string; short: string }[] = [
  { value: "en-US", label: "English", short: "EN" },
  { value: "fa-IR", label: "Persian", short: "FA" },
  { value: "it-IT", label: "Italiano", short: "IT" },
];

// SVG Icons — all vector, no emoji
const MicIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const StopIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="3"/>
  </svg>
);

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const PdfIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const TxtIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const TrashIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const SparkleIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const KeyIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const WarnIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SpinnerIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "vs-spin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.2"/>
    <path d="M21 12a9 9 0 00-9-9"/>
  </svg>
);

const WaveformBars = ({ active }: { active: boolean }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 3, height: 26 }}>
    {[0.5, 1, 0.7, 1, 0.6].map((factor, i) => (
      <div
        key={i}
        style={{
          width: 3,
          borderRadius: 99,
          background: active ? "var(--accent)" : "rgba(255,255,255,0.18)",
          height: active ? undefined : `${6 + i * 2}px`,
          animation: active ? `vs-wave ${(0.7 + i * 0.1 * factor).toFixed(2)}s ease-in-out ${(i * 0.08).toFixed(2)}s infinite alternate` : "none",
        } as React.CSSProperties}
        className={active ? "vs-wave-bar" : ""}
      />
    ))}
  </div>
);

export default function App() {
  const supported = useMemo(() => isSpeechSupported(), []);
  const recognizerRef = useRef<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en-US");
  const [isListening, setIsListening] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("OR_KEY") || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<string>(
    supported ? "Ready" : "Speech recognition not supported."
  );

  const fullText = useMemo(
    () => (finalText + (interimText ? "\n" + interimText : "")).trim(),
    [finalText, interimText]
  );

  const wordCount = useMemo(
    () => (fullText.trim() ? fullText.trim().split(/\s+/).length : 0),
    [fullText]
  );

  // Re-create recognizer when lang changes
  useEffect(() => {
    if (!supported) return;
    const Ctor = getRecognizerCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    recognizerRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => setStatus("Listening…");
    rec.onend = () => {
      setStatus("Stopped");
      setIsListening(false);
      setInterimText("");
    };
    rec.onerror = (e: any) => {
      const msg =
        e?.error === "not-allowed"
          ? "Microphone access denied — please allow in browser settings."
          : e?.error === "network"
          ? "Network error — check your internet connection."
          : `Error: ${e?.error || "unknown"}`;
      setStatus(msg);
      setIsListening(false);
    };
    rec.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) finalChunk += t;
        else interim += t;
      }
      if (finalChunk) {
        setFinalText((prev) =>
          prev ? prev + " " + finalChunk.trim() : finalChunk.trim()
        );
      }
      setInterimText(interim.trim());
    };

    return () => { try { rec.stop?.(); } catch {} };
  }, [lang, supported]);

  // Auto-scroll
  useEffect(() => {
    if (isListening && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [finalText, isListening]);

  // Persist API key
  useEffect(() => {
    localStorage.setItem("OR_KEY", apiKey);
  }, [apiKey]);

  const start = () => {
    const rec = recognizerRef.current;
    if (!rec) return;
    try {
      rec.lang = lang;
      rec.start();
      setIsListening(true);
      setStatus("Listening…");
    } catch {
      setStatus("Already active — click Stop first.");
    }
  };

  const stop = () => {
    try { recognizerRef.current?.stop(); } catch {}
  };

  const clearAll = () => {
    setFinalText("");
    setInterimText("");
    setStatus("Cleared");
    setTimeout(() => setStatus(isListening ? "Listening…" : "Ready"), 1500);
  };

  const copy = async () => {
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Copy failed — allow clipboard access in browser.");
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voicescribe-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => exportTextAsPdf(fullText);

  const handleAISmartNotes = async () => {
    if (!apiKey) {
      setShowApiKey(true);
      setStatus("Enter your OpenRouter API key to use AI Notes.");
      return;
    }
    if (!finalText) {
      setStatus("No transcript to process.");
      return;
    }
    setAiLoading(true);
    setStatus("AI is generating smart notes…");
    try {
      const langCode = lang.startsWith("fa") ? "fa" : lang.startsWith("it") ? "it" : "en";
      const result = await enhanceToNotes(finalText, langCode as any, apiKey);
      setFinalText(result);
      setStatus("Smart notes ready");
    } catch {
      setStatus("AI error — check your API key.");
    } finally {
      setAiLoading(false);
    }
  };

  const isError = status.toLowerCase().includes("error") ||
    status.toLowerCase().includes("denied") ||
    status.toLowerCase().includes("failed");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #07090f;
          --surface: #0d1220;
          --surface2: #121929;
          --surface3: #171f30;
          --border: rgba(255,255,255,0.07);
          --border-hi: rgba(255,255,255,0.13);
          --text: #dce6fa;
          --text-sub: rgba(220,230,250,0.5);
          --accent: #4f8cff;
          --accent-dim: rgba(79,140,255,0.14);
          --green: #3ecf8e;
          --red: #f26d6d;
          --amber: #f7b84b;
          --purple: #a78bfa;
          --r: 13px;
          --r-sm: 8px;
          --font: 'Sora', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          min-height: 100vh;
          font-size: 14.5px;
          -webkit-font-smoothing: antialiased;
          line-height: 1.6;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 65% 55% at 15% -5%, rgba(79,140,255,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 85% 105%, rgba(62,207,142,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(167,139,250,0.04) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        #root { position: relative; z-index: 1; }

        .vs-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 36px 22px 56px;
        }

        /* Logo */
        .vs-logo {
          width: 38px; height: 38px;
          border-radius: 11px;
          background: linear-gradient(140deg, var(--accent) 0%, #7c5af7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 18px rgba(79,140,255,0.28);
        }

        /* Card */
        .vs-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r);
          padding: 20px;
          transition: border-color 0.2s;
        }
        .vs-card:hover { border-color: var(--border-hi); }

        /* Buttons */
        .vs-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 15px;
          border-radius: var(--r-sm);
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--text);
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all 0.14s ease;
          white-space: nowrap;
          font-family: var(--font);
          letter-spacing: 0.01em;
        }
        .vs-btn:hover:not(:disabled) {
          background: var(--surface3);
          border-color: var(--border-hi);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .vs-btn:active:not(:disabled) { transform: translateY(0); box-shadow: none; }
        .vs-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .vs-btn-primary {
          background: var(--accent);
          border-color: transparent;
          color: #fff; font-weight: 600;
          box-shadow: 0 4px 18px rgba(79,140,255,0.32);
        }
        .vs-btn-primary:hover:not(:disabled) {
          background: #6ba3ff;
          box-shadow: 0 6px 22px rgba(79,140,255,0.42);
        }
        .vs-btn-stop {
          background: rgba(242,109,109,0.1);
          border-color: rgba(242,109,109,0.22);
          color: var(--red);
        }
        .vs-btn-stop:hover:not(:disabled) { background: rgba(242,109,109,0.17); border-color: rgba(242,109,109,0.35); }
        .vs-btn-danger {
          background: transparent;
          border-color: rgba(242,109,109,0.18);
          color: var(--red);
        }
        .vs-btn-danger:hover:not(:disabled) { background: rgba(242,109,109,0.1); border-color: rgba(242,109,109,0.3); }
        .vs-btn-ai {
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(79,140,255,0.12));
          border-color: rgba(167,139,250,0.25);
          color: var(--purple);
        }
        .vs-btn-ai:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(167,139,250,0.25), rgba(79,140,255,0.2));
          border-color: rgba(167,139,250,0.4);
        }

        /* Lang pills */
        .vs-langs { display: flex; gap: 5px; }
        .vs-lang {
          padding: 6px 13px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-sub);
          font-size: 12.5px; font-weight: 500;
          cursor: pointer;
          transition: all 0.14s;
          font-family: var(--font);
        }
        .vs-lang:hover:not(:disabled) { border-color: var(--border-hi); color: var(--text); }
        .vs-lang.active {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
        }
        .vs-lang:disabled { opacity: 0.35; cursor: not-allowed; }

        /* Status */
        .vs-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          transition: background 0.3s;
        }
        .vs-dot-listen { background: var(--green); animation: vs-pulse 1.3s ease-in-out infinite; }
        .vs-dot-idle { background: rgba(255,255,255,0.2); }
        .vs-dot-error { background: var(--red); }
        @keyframes vs-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(0.65)} }

        /* Waveform */
        @keyframes vs-wave { from{height:5px} to{height:22px} }
        .vs-wave-bar { height: 5px; min-height: 3px; max-height: 22px; }

        /* Rec badge */
        .vs-rec {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(242,109,109,0.1);
          border: 1px solid rgba(242,109,109,0.2);
          color: var(--red);
          font-size: 11px; font-weight: 700; letter-spacing: 0.07em;
        }
        .vs-rec-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--red);
          animation: vs-pulse 0.9s ease-in-out infinite;
        }

        /* Textarea */
        .vs-ta {
          width: 100%; padding: 15px;
          border-radius: var(--r-sm);
          border: 1px solid var(--border);
          background: rgba(0,0,0,0.28);
          color: var(--text);
          resize: vertical; outline: none;
          font-size: 14.5px; line-height: 1.78;
          font-family: var(--font);
          transition: border-color 0.2s;
        }
        .vs-ta:focus { border-color: rgba(79,140,255,0.35); }
        .vs-ta::placeholder { color: var(--text-sub); }
        .vs-ta-interim { color: rgba(220,230,250,0.48); font-style: italic; }

        /* Stat chip */
        .vs-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          font-size: 11.5px; color: var(--text-sub);
          font-family: var(--mono);
        }

        /* Section label */
        .vs-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--text-sub);
        }

        /* API input */
        .vs-api-in {
          width: 100%; padding: 9px 13px;
          border-radius: var(--r-sm);
          border: 1px solid var(--border);
          background: rgba(0,0,0,0.28);
          color: var(--text); font-size: 13px;
          outline: none;
          font-family: var(--mono);
          transition: border-color 0.2s;
        }
        .vs-api-in:focus { border-color: rgba(79,140,255,0.35); }
        .vs-api-in::placeholder { color: var(--text-sub); font-family: var(--font); }

        /* Separator */
        .vs-sep {
          width: 1px; height: 26px;
          background: var(--border);
          flex-shrink: 0; margin: 0 3px;
        }

        /* Warning */
        .vs-warn {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 15px 18px;
          border-radius: var(--r);
          background: rgba(247,184,75,0.07);
          border: 1px solid rgba(247,184,75,0.2);
          color: var(--amber);
          font-size: 13.5px; line-height: 1.65;
        }

        /* Animations */
        @keyframes vs-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes vs-fadeup { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vs-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        .vs-a1 { animation: vs-fadeup 0.35s ease both; }
        .vs-a2 { animation: vs-fadeup 0.35s 0.08s ease both; }
        .vs-a3 { animation: vs-fadeup 0.35s 0.16s ease both; }
        .vs-a4 { animation: vs-fadeup 0.35s 0.24s ease both; }
        .vs-pop { animation: vs-pop 0.22s ease forwards; }

        /* Scroll */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>

      <div className="vs-wrap">
        {/* ── Header ── */}
        <header className="vs-a1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div className="vs-logo">
              <MicIcon size={17} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.2 }}>VoiceScribe</div>
              <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 1 }}>Real-time speech to text</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
            <span className="vs-label">Language</span>
            <div className="vs-langs">
              {LANGS.map((l) => (
                <button key={l.value} className={`vs-lang ${lang === l.value ? "active" : ""}`} onClick={() => setLang(l.value)} disabled={isListening}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Browser warning ── */}
        {!supported && (
          <div className="vs-warn vs-a1" style={{ marginBottom: 18 }}>
            <WarnIcon size={18} />
            <div>
              <strong>Browser not supported.</strong> VoiceScribe requires Chrome or Edge.
              <br />The Web Speech API is not available in Firefox or Safari.
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div className="vs-card vs-a2" style={{ marginBottom: 14 }}>
          {/* Status bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {isListening && <span className="vs-rec"><span className="vs-rec-dot"/>REC</span>}
              <WaveformBars active={isListening} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className={`vs-dot ${isListening ? "vs-dot-listen" : isError ? "vs-dot-error" : "vs-dot-idle"}`} />
              <span style={{ fontSize: 13, fontWeight: 500, color: isListening ? "var(--green)" : isError ? "var(--red)" : "var(--text-sub)" }}>
                {status}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            <button className="vs-btn vs-btn-primary" onClick={start} disabled={!supported || isListening}>
              <MicIcon size={15} /> Start
            </button>
            <button className="vs-btn vs-btn-stop" onClick={stop} disabled={!supported || !isListening}>
              <StopIcon size={14} /> Stop
            </button>

            <span className="vs-sep" />

            <button className="vs-btn" onClick={copy} disabled={!supported || !fullText}>
              {copied ? <span className="vs-pop"><CheckIcon size={15}/></span> : <CopyIcon size={15}/>}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button className="vs-btn" onClick={downloadPdf} disabled={!supported || !fullText}>
              <PdfIcon size={15} /> PDF
            </button>
            <button className="vs-btn" onClick={downloadTxt} disabled={!supported || !fullText}>
              <TxtIcon size={15} /> TXT
            </button>

            <span className="vs-sep" />

            <button className="vs-btn vs-btn-ai" onClick={handleAISmartNotes} disabled={!supported || !finalText || aiLoading}>
              {aiLoading ? <SpinnerIcon size={15}/> : <SparkleIcon size={15}/>}
              {aiLoading ? "Generating…" : "AI Notes"}
            </button>

            <button className="vs-btn vs-btn-danger" onClick={clearAll} disabled={!supported || (!finalText && !interimText)} style={{ marginLeft: "auto" }}>
              <TrashIcon size={15} /> Clear
            </button>
          </div>

          {/* Stats */}
          {(wordCount > 0 || fullText.length > 0) && (
            <div style={{ display: "flex", gap: 7, marginTop: 13, flexWrap: "wrap", alignItems: "center" }}>
              <span className="vs-chip">{wordCount} words</span>
              <span className="vs-chip">{fullText.length} chars</span>
              <span className="vs-chip" style={{ marginLeft: "auto" }}>
                {LANGS.find(l => l.value === lang)?.short} · {LANGS.find(l => l.value === lang)?.label}
              </span>
            </div>
          )}
        </div>

        {/* ── AI Key toggle ── */}
        <div className="vs-a3" style={{ marginBottom: 14 }}>
          <button className="vs-btn" onClick={() => setShowApiKey(!showApiKey)} style={{ fontSize: 12, padding: "6px 11px", color: "var(--text-sub)" }}>
            <KeyIcon size={12} /> AI Notes API Key <ChevronIcon open={showApiKey}/>
          </button>
          {showApiKey && (
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-or-v1-… (OpenRouter API key)" className="vs-api-in"/>
              {apiKey && (
                <button className="vs-btn" style={{ padding: "9px 13px", color: "var(--green)", flexShrink: 0 }} onClick={() => setShowApiKey(false)}>
                  <CheckIcon size={14}/>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Transcript ── */}
        <div className="vs-a4" style={{ display: "grid", gap: 12 }}>
          <div className="vs-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="vs-label">Transcript</span>
                {isListening && (
                  <span style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 999, background: "rgba(62,207,142,0.1)", border: "1px solid rgba(62,207,142,0.2)", color: "var(--green)", fontWeight: 700, letterSpacing: "0.05em" }}>
                    LIVE
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11.5, color: "var(--text-sub)" }}>Editable — finalized sentences appear here</span>
            </div>
            <textarea
              ref={textareaRef}
              value={finalText}
              onChange={(e) => setFinalText(e.target.value)}
              placeholder="Press Start and begin speaking…"
              className="vs-ta"
              style={{ height: 240, minHeight: 120 }}
              dir={lang === "fa-IR" ? "rtl" : "ltr"}
            />
          </div>

          {(interimText || isListening) && (
            <div className="vs-card" style={{ borderColor: isListening ? "rgba(79,140,255,0.18)" : "var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span className="vs-label">Live preview</span>
                <span style={{ fontSize: 11.5, color: "var(--text-sub)" }}>Updates in real-time while you speak</span>
              </div>
              <textarea
                value={interimText}
                readOnly
                placeholder="Interim text appears here while speaking…"
                className="vs-ta vs-ta-interim"
                style={{ height: 82, minHeight: 60, resize: "none" }}
                dir={lang === "fa-IR" ? "rtl" : "ltr"}
              />
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 36, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 11.5, color: "var(--text-sub)", lineHeight: 1.7 }}>
            VoiceScribe uses the Web Speech API · Requires HTTPS + microphone permission · Best in Chrome / Edge
          </p>
          <p style={{ fontSize: 11.5, color: "var(--text-sub)" }}>
            English · Persian · Italian
          </p>
        </footer>
      </div>
    </>
  );
}
