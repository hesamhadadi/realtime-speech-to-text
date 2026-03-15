export async function enhanceToNotes(
  text: string,
  lang: "fa" | "en" | "it",
  apiKey: string
) {
  const prompts = {
    fa: `متن زیر را به یک جزوه تمیز تبدیل کن.
- تیتر کوتاه بده
- نکات کلیدی را بولت کن
- جمله‌ها را کامل و با نقطه‌گذاری درست بنویس
- پاراگراف‌بندی مناسب انجام بده

متن:
${text}`,
    en: `Turn the following transcript into clean, well-structured study notes:
- Add a short descriptive title
- Bullet key points and takeaways
- Fix punctuation and grammar
- Use clear paragraphs

Transcript:
${text}`,
    it: `Trasforma la seguente trascrizione in appunti chiari e ben strutturati:
- Aggiungi un titolo breve e descrittivo
- Elenca i punti chiave con bullet
- Correggi la punteggiatura e la grammatica
- Usa paragrafi chiari

Trascrizione:
${text}`,
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [{ role: "user", content: prompts[lang] }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.error?.message || "AI request failed");
  }

  return data.choices?.[0]?.message?.content || "";
}
