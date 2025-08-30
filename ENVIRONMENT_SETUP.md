# Environment Setup Guide

## Required Environment Variables

To make the chatbot and other features work properly, you need to set up the following environment variables in a `.env.local` file in your project root:

### 1. Gemini AI API Key (for Chatbot)
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to your `.env.local` file

### 2. Supabase Configuration (for Database & Auth)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get them:**
1. Go to [Supabase](https://supabase.com)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key
5. Add them to your `.env.local` file

## File Structure
Your `.env.local` file should look like this:
```
VITE_GEMINI_API_KEY=AIzaSyC...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Features Status

### ✅ Working Without API Keys:
- Currency Converter
- Basic UI and navigation
- Profile page (login details only)

### 🔧 Requires API Keys:
- **Chatbot**: Needs `VITE_GEMINI_API_KEY`
- **Chat History**: Needs Supabase configuration
- **Share Data**: Needs both API keys
- **User Authentication**: Needs Supabase configuration

## Troubleshooting

### Chatbot Not Working
- Check if `VITE_GEMINI_API_KEY` is set correctly
- Verify the API key is valid and has proper permissions
- Check browser console for error messages

### History Not Working
- Check if Supabase environment variables are set
- Verify Supabase project is active
- Check if database tables are created (see `database_setup.sql`)

### Share Data Not Working
- Ensure both Gemini and Supabase API keys are configured
- Check if user is authenticated
- Verify financial data service is working

## Quick Test

After setting up the environment variables:

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Test the chatbot**:
   - Go to the Chat tab
   - Try sending a message
   - You should see a response (either AI or fallback)

3. **Test chat history**:
   - Send a few messages
   - Click the "History" button
   - You should see your chat history

4. **Test currency converter**:
   - Go to the Currency tab
   - Try converting between currencies
   - Should work without any API keys

## Fallback Mode

If API keys are not configured, the chatbot will work in "fallback mode" with basic responses. This allows you to test the interface even without the full AI capabilities.
