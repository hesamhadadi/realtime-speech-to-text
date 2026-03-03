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
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.error?.message || "AI request failed");
  }

  return data.choices?.[0]?.message?.content || "";
}