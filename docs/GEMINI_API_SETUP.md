# Getting Your Gemini API Key

To enable AI-powered match predictions, you need to get a Gemini API key from Google.

## Steps to Get Your API Key:

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with Your Google Account**
   - Use your Google account to sign in

3. **Create API Key**
   - Click "Create API Key" button
   - Select "Create API key in new project" or choose an existing project
   - Copy the generated API key

4. **Add to Your Project**
   - Open the `.env.local` file in your project
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
   - Save the file

## Example:

```bash
GOOGLE_API_KEY=AIzaSyB... (your actual key here)
GEMINI_API_KEY=AIzaSyB... (your actual key here)
```

## Important Notes:

- Keep your API key secure and never commit it to version control
- The `.env.local` file is already in `.gitignore` to protect your keys
- Free tier allows 60 requests per minute
- For production use, consider upgrading to a paid plan

## Restart Development Server:

After adding the API key, restart your development server:

```bash
npm run dev
```

The match prediction feature will now work correctly!
