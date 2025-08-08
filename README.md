# chatset

A fast AI chat app that allows users to chat with models via OpenRouter, OpenAI, Groq, Anthropic (not tested) and Google (not tested).

Developed as a clone of [T3 Chat](https://t3.chat) for the T3 Chat Cloneathon.

Try it out at [chatset.johannesschiessl.com](https://chatset.johannesschiessl.com)

## Supported Models

See [models.ts](models.ts) for the list of supported models.

## Self Host

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- A Convex account
- Google Cloud Console account (for OAuth)
- Groq account (for Groq API for the chat title generation)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/johannesschiessl/chatset.git
   cd chatset
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables (see `.env.example` for reference)

4. **Set up Convex**

   ```bash
   # For development
   pnpm dev:convex

   # For production deployment
   pnpm deploy:convex
   ```

   You will need to add an environment variable for the API_KEY_ENCRYPTION_SECRET and GROQ_API_KEY to your Convex project. You get one here: [Groq Console](https://console.groq.com/keys).

5. **Set up Google OAuth**

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID
   - Add your domain to authorized origins
   - Copy the Client ID and Client Secret to your `.env.local` file

6. **Build and run**

   ```bash
   # For development
   pnpm dev

   # For production
   pnpm build
   pnpm start
   ```

That's it! Your chatset instance should now be running.

## Contributing

Feel free to contribute by creating issues or pull requests. Suggestions for new features are always welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
