export async function enhanceToNotes(
    text: string,
    lang: "fa" | "en",
    apiKey: string
  ) {
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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [{ role: "user", content: prompt }]
      })
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      console.error(data);
      throw new Error(data?.error?.message || "AI request failed");
    }
  
    return data.choices?.[0]?.message?.content || "";
  }