# Sketchbook

3D playground built on three.js and cannon.js with AI-powered content generation.

**Transform your game ideas into reality with our revolutionary AI game creator. No coding required - just describe your vision and watch it come to life.**

## Watch how AI brings a fantasy forest scene to life with an interactive talking ogre character:

https://github.com/user-attachments/assets/c269e842-af3a-4074-90cd-7d830c08ddbf


### Additional Demo Videos

<details>
<summary>🎮 Two-player gameplay demo</summary>

https://github.com/user-attachments/assets/2820a003-fe04-4991-8da4-d586fba6340b
</details>

<details>
<summary>🚗 Car bazooka action demo</summary>

https://github.com/user-attachments/assets/174439e5-7e38-48a9-a5db-a696a44b346a
</details>

<details>
<summary>⚽ Football game demo</summary>

https://github.com/user-attachments/assets/89767c20-cb88-4522-b68a-086ebf6cbf20
</details>

<details>
<summary>👤 Character demo</summary>

https://github.com/user-attachments/assets/bafb82d3-600d-4f7d-a40c-3bee0c757c88
</details>

<details>
<summary>🧱 Minecraft-style gameplay</summary>

https://github.com/user-attachments/assets/5c4e0de8-1b8f-4416-a452-536ad3279790
</details>

<details>
<summary>✨ Particle effects showcase</summary>

https://github.com/user-attachments/assets/e6587e2c-3bcc-4abb-8a21-f19a770c1bf4
</details>

<details>
<summary>🏎️ Racing game demo</summary>

https://github.com/user-attachments/assets/ac41d7ad-f710-4d06-b6a7-be7ceda86619
</details>

<details>
<summary>🧟 Zombie game demo</summary>

https://github.com/user-attachments/assets/624d1793-f9e5-4734-ad86-9dfec28250da
</details>

## Quick Start

**🎮 Live Demo**: [Play Online](https://friuns2.github.io/sketchbook/)

**📱 Download APK**: [Latest Release](https://github.com/friuns2/Sketchbook/releases/latest)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:8080 in your browser.

## 🤖 Update Without a PC - AI-Powered Development

This project features **automated GitHub Actions** that compile and publish your code automatically on every push. You can develop and update the entire project from anywhere using AI coding assistants - no local PC setup required!

### How It Works

The GitHub Actions workflow automatically:
- ✅ Builds the web application
- ✅ Compiles signed Android APK
- ✅ Generates Android App Bundle (AAB) for Google Play
- ✅ Creates a GitHub Release with downloadable artifacts
- ✅ Deploys to GitHub Pages (if configured)

**Triggered on**: Every push to `master` branch or manual workflow dispatch

### Update from Anywhere with AI Assistants

You can edit code directly on GitHub using these AI-powered tools:

1. **GitHub Copilot** (github.com/copilot)
   - Edit files directly in your browser on GitHub.com
   - AI suggestions appear as you type
   - Commit changes directly to trigger automatic build

2. **Cursor Web Agent** (cursor.com)
   - Use Cursor's web interface to edit GitHub repositories
   - Full AI assistance with context awareness
   - Push changes to automatically trigger builds

3. **Google Jules** (jules.google.com)
   - Google's AI coding assistant
   - Can directly interact with GitHub repositories
   - Make changes that automatically trigger the build pipeline

### Workflow Steps

1. **Make changes** using any AI assistant (or GitHub's web editor)
2. **Commit to master** branch
3. **Automatic build** starts via GitHub Actions
4. **Download APK** from the new release (appears in ~5-10 minutes)
5. **Install on device** or publish to Google Play Store

No local development environment needed - code, compile, and deploy all from the cloud! 🚀

## Running Tests

To test the application:

1. Start the development server: `npm run dev`
2. Open http://localhost:8080 in your browser
3. Use the controls to interact with the 3D world:
   - **WASD** - Movement
   - **Shift** - Run
   - **Space** - Jump
   - **F** - Enter vehicle
   - **G** - Enter as passenger
   - **X** - Switch seat
   - **E** - Interact
   - **Alt + ←** - Undo
   - **Alt + →** - Redo
   - **Shift + C** - Free camera

## LLM API Keys Configuration

LLM keys are configured in `localSettings.js`. Create this file in the project root if it doesn't exist:

```javascript
// localSettings.js
settings.model.selected = "anthropic/claude-3-haiku";  // or your preferred model
settings.apiUrl = "https://openrouter.ai/api/v1/chat/completions";  // API endpoint
settings.apiKey = "your-api-key-here";  // Your API key
```

## Build

```bash
# Production build
npm run build
```

## License

License: TBD

No license is granted yet. I will choose an open-source license later.

