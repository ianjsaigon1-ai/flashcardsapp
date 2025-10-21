const express = require('express');
const cors = require('cors');

const app = express();
// Render sets the PORT environment variable for you.
const port = process.env.PORT || 3001; 

if (!process.env.PEXELS_API_KEY) {
  console.error("CRITICAL ERROR: PEXELS_API_KEY is not defined in the environment.");
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('The server is awake and running!');
});

app.post('/api/generate-image', async (req, res) => {
  console.log('Request for:', req.body.prompt);
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=1`;

    const response = await fetch(pexelsUrl, {
      headers: { 'Authorization': process.env.PEXELS_API_KEY }
    });

    if (!response.ok) throw new Error(`Pexels API Error: ${response.status}`);

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      res.json({ success: true, imageUrl: data.photos[0].src.large });
    } else {
      res.status(404).json({ error: 'No image found' });
    }

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    res.status(500).json({ error: 'Failed to get image from Pexels' });
  }
});

app.listen(port, () => {
  console.log(`✅ Pexels server is alive and listening on port ${port}`);
});
