export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemPrompt } = req.body;

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: systemPrompt || 'Ты — персональный ИИ-помощник в приложении Smart Life Balance. Отвечай всегда на языке пользователя (преимущественно на русском). Будь дружелюбным, используй уместное количество эмодзи.' },
            { role: 'user', content: message }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data));

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ error: 'No choices', details: data });
    }

    const text = data.choices[0].message.content;
    res.json({ reply: text });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
}