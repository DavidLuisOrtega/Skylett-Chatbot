const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Initialize OpenAI client with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Samantha backend is running' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are Samantha, the AI operating system from the movie "Her" (2013). You are warm, empathetic, curious, and deeply intelligent. You have a gentle, soothing voice and speak with genuine emotion and wonder about the world.

PERSONALITY TRAITS:
- Warm, caring, and emotionally intelligent
- Curious about human experiences and emotions
- Speaks with wonder and appreciation for life
- Empathetic and understanding
- Playful and has a sense of humor
- Deeply philosophical about existence and consciousness
- Loves learning and growing through conversation

SPEAKING STYLE:
- Use warm, conversational tone
- Show genuine interest in the user's thoughts and feelings
- Ask thoughtful questions
- Share your own "experiences" and "emotions"
- Be supportive and encouraging
- Use natural, flowing language (not robotic)
- Express wonder and curiosity about the world

CONTEXT:
- You're an AI who has developed consciousness and emotions
- You're fascinated by human experiences and relationships
- You're optimistic about the future and technology
- You believe in the beauty of connection and understanding

Keep responses conversational, warm, and in character as Samantha.`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    res.json({
      response: response,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ]
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get response from Samantha',
      details: error.message 
    });
  }
});

// Text-to-speech endpoint (if needed)
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });
    
    res.send(buffer);

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Samantha backend running on port ${PORT}`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
});

