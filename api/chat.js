export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemPrompt } = req.body;

  const models = [
    process.env.AI_MODEL_PRIMARY,
    process.env.AI_MODEL_FALLBACK
  ];

  for (const model of models) {
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
            model: model,
            messages: [
              { role: 'system', content: systemPrompt || 'Ты умный ассистент.' },
              { role: 'user', content: message }
            ]
          })
        }
      );

      const data = await response.json();
      console.log(`Model ${model} response:`, JSON.stringify(data));

      if (data.choices && data.choices.length > 0) {
        const text = data.choices[0].message.content;
        return res.json({ reply: text, model: model });
      }

      console.log(`Model ${model} failed, trying next...`);

    } catch (err) {
      console.error(`Model ${model} error:`, err);
    }
  }

  res.status(500).json({ error: 'Все модели недоступны' });
}