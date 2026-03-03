const HF_TOKEN = "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"; // ← اینجا توکن خودتو بذار

export async function enhanceToNotes(text: string, lang: "fa" | "en") {
  const model = "google/flan-t5-base";

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

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();

  const generated =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : data.generated_text;

  return generated?.trim() || "";
}