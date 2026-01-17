# Fix OpenAI API Quota Error (429)

## Problem
You're seeing this error:
```
429 You exceeded your current quota, please check your plan and billing details.
```

This means your OpenAI API key has run out of credits or has no billing method set up.

## Solutions

### Option 1: Add Credits to Your OpenAI Account (Recommended)

1. **Go to OpenAI Billing:**
   - Visit: https://platform.openai.com/account/billing
   - Log in with the account that owns the API key

2. **Add Payment Method:**
   - Click "Add payment method"
   - Enter your credit card details
   - Set up auto-recharge (optional but recommended)

3. **Add Credits:**
   - Click "Add credits" or "Add funds"
   - Enter the amount you want to add (minimum is usually $5)
   - Confirm the payment

4. **Verify API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Make sure your API key is active
   - Check usage limits and quotas

### Option 2: Update API Key in Render

If you have a different API key with credits:

1. **Get Your New API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Create a new key or copy an existing one
   - Make sure it starts with `sk-`

2. **Update in Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Open your `medioracle-ai` service
   - Go to **Environment** tab
   - Find `OPENAI_API_KEY`
   - Click **Edit** and paste your new API key
   - Click **Save Changes**
   - The service will automatically redeploy

### Option 3: Check API Key Usage

1. **Check Usage:**
   - Visit: https://platform.openai.com/usage
   - See how much you've used
   - Check rate limits

2. **Check Billing:**
   - Visit: https://platform.openai.com/account/billing
   - Verify payment method is active
   - Check for any billing issues

## After Fixing

Once you've added credits or updated the API key:

1. **Wait for Render to Redeploy:**
   - If you updated the environment variable, Render will auto-redeploy
   - Or manually trigger: **Manual Deploy** → **Deploy latest commit**

2. **Test the Application:**
   - Go to your app: `https://medioracle-ai.onrender.com`
   - Try the Symptom Analyzer again
   - The error should be gone

## Cost Estimate

OpenAI API costs vary by model:
- **GPT-3.5-turbo**: ~$0.0015 per 1K tokens (very affordable)
- **GPT-4**: ~$0.03 per 1K tokens (more expensive)

For symptom analysis, each request uses approximately:
- 500-1000 input tokens
- 500-1500 output tokens
- **Cost per analysis: ~$0.001-0.003** (less than 1 cent)

**Example:** $5 credit = ~1,500-5,000 symptom analyses

## Prevention

1. **Set Usage Limits:**
   - Go to: https://platform.openai.com/account/limits
   - Set monthly spending limits
   - Set rate limits

2. **Monitor Usage:**
   - Check usage regularly: https://platform.openai.com/usage
   - Set up email alerts for high usage

3. **Use GPT-3.5-turbo:**
   - The app is configured to use `gpt-3.5-turbo` by default (cheaper)
   - You can change this in `backend/.env` if needed

## Need Help?

- OpenAI Support: https://help.openai.com
- OpenAI Discord: https://discord.gg/openai
- Check API status: https://status.openai.com

