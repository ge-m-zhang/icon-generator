# AI Icon Generator

Generate professional icon sets using AI. Create 8 consistent, themed icons in multiple styles using OpenAI and Replicate Flux-Schnell.

🌐 **[Live Demo](https://icon-generator-f7n02c47s-melodys-projects-b4357c60.vercel.app/)** - Try it now!

![AI Icon Styles](public/images/style-examples.png)

## ✨ Features

- **4 Icon Styles**: Business, Cartoon, 3D Model, and Gradient
- **AI-Powered**: OpenAI GPT-4 + Replicate Flux-Schnell
- **Professional Quality**: 512×512 PNG format
- **Consistent Sets**: 8 thematically related icons per request
- **Type-Safe**: Built with Next.js 15 + TypeScript

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd icon-generator
pnpm install

# Set up environment variables
cp .env.example .env
# Add your OPENAI_API_KEY and REPLICATE_API_TOKEN

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start generating!

## 📖 Usage

1. Enter a prompt (e.g., "office supplies")
2. Choose a style
3. Generate your 8-icon set
4. Download individual icons

### Styles

- **Business**: Professional glyph icons with colored badges
- **Cartoon**: Friendly, rounded kawaii-style icons
- **3D Model**: Photorealistic 3D rendered icons
- **Gradient**: Modern vector icons with smooth color transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: @gmzh/react-ui + Tailwind CSS
- **AI**: OpenAI GPT-4o-mini + Replicate Flux-Schnell
- **Language**: TypeScript
- **Testing**: Jest + Testing Library

## 📚 API

**POST** `/api/generate-icons`

```typescript
// Request
{
  prompt: string;    // 2-30 characters
  style: "Business" | "Cartoon" | "ThreeDModel" | "Gradient";
}

// Response
{
  success: boolean;
  images: GeneratedIcon[];
  metadata: { originalPrompt: string; style: string; generatedItems: string[]; };
}
```

## � Cost

~$0.024 per 8-icon set ($0.003 per image + OpenAI costs)

## 🤝 Development

- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Docs**: See [API.md](API.md)

```bash
pnpm test        # Run tests
pnpm lint        # Lint code
pnpm build       # Build for production
```
