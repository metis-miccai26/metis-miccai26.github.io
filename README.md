# MÉTIS Workshop — MICCAI 2026

**Multidisciplinary Evaluation & Translation in Imaging & CAI Science**

*Linking Clinical & Computational Communities for the Next Generation of Medical Imaging AI*

🌐 Live at: [metis-miccai26.github.io](https://metis-miccai26.github.io)

## About

The MÉTIS Workshop at MICCAI 2026 (Abu Dhabi, UAE) focuses on evaluation, translation, and responsible deployment of AI in real-world clinical workflows.

## Local Development

```bash
# Serve locally
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## Chat Agent

The site includes a Gemini-powered chat assistant. To activate it:

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Open `js/chat.js` and paste your key in the `GEMINI_API_KEY` constant
3. Restrict the key to your domain in Google Cloud Console

## Deployment

This site is deployed via GitHub Pages. Push to the `main` branch of the `metis-miccai26` GitHub organization to deploy.
