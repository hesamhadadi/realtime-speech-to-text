const OPENROUTER_API_KEY = "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";
export async function enhanceToNotes(text: string, lang: "fa" | "en") {
  const prompt =
    lang === "fa"
      ? `متن زیر را به یک جزوه تمیز تبدیل کن.
- تیتر کوتاه بده
- نکات کلیدی را بولت کن
- جمله‌ها را کامل و با نقطه‌گذاری درست بنویس
- پاراگراف‌بندی مناسب انجام بده

متن:
${text}`
      : `Turn the following transcript into clean study notes:
- Add a short title
- Bullet key points
- Fix punctuation
- Use paragraphs

Text:
${text}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://hesamhadadi.github.io/",
      "X-Title": "Speech To Text Notes App"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();

  return data.choices?.[0]?.message?.content || "";
}