# Chronicles of Shadow (Chroniques de l'Ombre)

A dark fantasy narrative game powered by AI. Every playthrough is unique.

![Version](https://img.shields.io/badge/version-1.1.0-5a8ab5)
![License](https://img.shields.io/badge/license-MIT-blue)

## About

You play as a wanderer with no memory who awakens at the gates of **Ombrath**, a kingdom consumed by an ancient curse. An artifact — the **Crown of Twilight** — holds the key to breaking or dominating the curse. Your choices shape the story, and every decision has real consequences.

- **5 chapters** with structured narrative progression
- **4 possible endings** (Heroic, Corrupted, Sacrifice, Tragic)
- **~30 minutes** per playthrough
- **Real-time ambient sound** generated with Web Audio API (dark fantasy, BotW-inspired)
- **Bilingual** — French and English
- **No server needed** — runs entirely in the browser

## How to Play

1. Get a free API key from [Groq](https://console.groq.com/keys) or [Google AI Studio](https://aistudio.google.com/apikey)
2. Open the game in your browser
3. Select your AI provider, enter your key, and begin

## Tech Stack

- **Frontend:** HTML / CSS / Vanilla JS (zero dependencies)
- **AI:** Groq (Llama 3.3 70B) or Google Gemini 2.0 Flash
- **Audio:** Web Audio API — procedural drone, spectral wind, sparse piano notes, convolution reverb
- **i18n:** Custom lightweight system with full FR/EN support

## Run Locally

```bash
cd chroniques-de-lombre
python3 -m http.server 8000
```

Then open `http://localhost:8000`

## Project Structure

```
chroniques-de-lombre/
├── index.html   — Game screens (title, game, game over, victory)
├── style.css    — Dark fantasy theme, responsive, animations
├── game.js      — Game engine, AI integration, save system
├── audio.js     — Procedural ambient sound engine
├── i18n.js      — Translations (FR/EN) and system prompts
└── README.md
```

## Features

- **AI-powered narrative** — The AI acts as Game Master, generating story, choices, and stat changes in structured JSON
- **Save system** — Auto-saves to localStorage. Resume after refresh or browser close
- **Stat system** — Health, Sanity, Gold. Stats below 30 trigger danger animations
- **Responsive** — Desktop, tablet, mobile, landscape. Safe area support for notched phones
- **Ambient audio** — Detuned oscillator drone, bandpass-filtered noise wind, random minor-scale piano notes with cathedral reverb

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Author

**ekd**

## License

MIT
