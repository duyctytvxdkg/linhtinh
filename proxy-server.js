// Simple Node.js proxy server
const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

app.get('/api/tide-data', (req, res) => {
  const options = {
    hostname: 'cau-ca.com',
    port: 443,
    path: '/vn/ho-chi-minh/coral-bank',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });
    
    proxyRes.on('end', () => {
      res.json({ contents: data });
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy request error:', error);
    res.status(500).json({ error: 'Failed to fetch tide data' });
  });

  proxyReq.end();
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});