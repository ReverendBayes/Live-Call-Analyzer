// Express routes for Azure OpenAI GPT-4o Mini (Telecom-specific)
// This file powers all GPT-related summarization routes for telecom calls.
// It handles long transcripts, applies truncation, optional pre-summarization,
// and routes data to Azure's Chat Completion endpoint using a deployed GPT-4o Mini model.

const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config.json');               // API keys and deployment settings
const openaiconfig = require('./openai-config.json');   // Prompt tuning and token limits
const { writeData } = require('../data/data-logging.js');

// Load Azure OpenAI credentials and deployment info
const openaiKey = config[0].openai_key;
const openaiEndpoint = config[0].openai_endpoint;
const openaiDeploymentName = config[0].openai_deployment_name; // Deployment name registered in Azure OpenAI for the model 'gpt-4o-mini-2024-07-18'

// Load model tuning parameters from config
const openaiMaxTokens = openaiconfig[0].openai_max_tokens;
const openaiTemperature = openaiconfig[0].openai_temperature;
const openaiTopP = openaiconfig[0].openai_top_p;
const openaiFrequencyPenalty = openaiconfig[0].openai_frequency_penalty;
const openaiPresencePenalty = openaiconfig[0].openai_presence_penalty;
const openaiApiVersion = openaiconfig[0].openai_api_version;

// Default telecom prompt fallback
const telecomPrompt = openaiconfig[0].telecom_prompt || "Summarize this telecom customer support call with key issues, resolution steps, and any sentiment cues.";
const generalPrompt = openaiconfig[0].general_prompt;

// Health check route
// Used to confirm the backend is alive and reachable by frontend or monitoring
router.get('/gpt/sayhello', async (req, res) => {
  res.send('Hello from the Azure GPT-4o Mini backend! ' + new Date());
});

// Main route for custom prompts
// 1. Receives a transcript + user-defined prompt
// 2. Truncates the transcript if it's too long
// 3. Summarizes the start if truncated to preserve context
// 4. Appends prompt, sends to Azure OpenAI GPT-4o Mini
router.post('/gpt/customPrompt', async (req, res) => {
  const requestText = JSON.stringify(req.body.transcript);
  const requestCustomPrompt = req.body.customPrompt;

  const maxTokenLimit = 3000; // Custom limit for model buffer
  let truncatedTranscript = truncateText(requestText, maxTokenLimit);

  // If we had to trim, summarize the front to keep context
  if (truncatedTranscript.length < requestText.length) {
    const summary = await generateSummary(truncatedTranscript);
    truncatedTranscript = summary + requestText.substring(truncatedTranscript.length);
  }

  const fullPrompt = truncatedTranscript + "\n\n" + requestCustomPrompt;
  const url = `${openaiEndpoint}openai/deployments/${openaiDeploymentName}/chat/completions?api-version=${openaiApiVersion}`;
  const headers = { 'Content-Type': 'application/json', 'api-key': openaiKey };

  const body = {
    messages: [
      { role: "system", content: "You are a helpful assistant summarizing telecom support calls." },
      { role: "user", content: fullPrompt }
    ],
    max_tokens: 1000,
    temperature: openaiTemperature,
    top_p: openaiTopP,
    frequency_penalty: openaiFrequencyPenalty,
    presence_penalty: openaiPresencePenalty
  };

  try {
    const completion = await axios.post(url, body, { headers });
    res.send(completion.data.choices[0].message);
    writeData(req.body.transcript, requestCustomPrompt, completion.data.choices[0].message, req.ip);
  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.send(error.message);
    writeData(req.body.transcript, requestCustomPrompt, error, req.ip);
  }
});

// Route to summarize full transcript with a "tl;dr"
// Simpler endpoint if user wants automatic summary only
router.post('/gpt/summarize', async (req, res) => {
  const requestText = JSON.stringify(req.body.transcript);
  const truncatedTranscript = truncateText(requestText, openaiMaxTokens);

  const fullPrompt = truncatedTranscript + "\n\nTl;dr";
  const url = `${openaiEndpoint}openai/deployments/${openaiDeploymentName}/chat/completions?api-version=${openaiApiVersion}`;
  const headers = { 'Content-Type': 'application/json', 'api-key': openaiKey };

  const body = {
    messages: [
      { role: "system", content: "You are a helpful assistant summarizing telecom support calls." },
      { role: "user", content: fullPrompt }
    ],
    max_tokens: openaiMaxTokens,
    temperature: openaiTemperature,
    top_p: openaiTopP,
    frequency_penalty: openaiFrequencyPenalty,
    presence_penalty: openaiPresencePenalty
  };

  try {
    const response = await axios.post(url, body, { headers });
    res.send(response.data.choices[0].message);
  } catch (error) {
    console.error('Summarization error:', error.message);
    res.send(error.message);
  }
});

// Transcript text clipper
// Shortens content to avoid hitting GPT token limits — preserves sentence endings
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastDot = slice.lastIndexOf(".");
  return lastDot !== -1 ? slice.slice(0, lastDot + 1) : slice;
}

// Pre-summarizer
// When a transcript is too long, this creates a summary chunk GPT can use as compressed context
async function generateSummary(text) {
  const summaryPrompt = JSON.stringify(text) + "\n\nSummarize the key parts of this telecom support call, naming agent and customer if possible.";
  const url = `${openaiEndpoint}openai/deployments/${openaiDeploymentName}/chat/completions?api-version=${openaiApiVersion}`;
  const headers = { 'Content-Type': 'application/json', 'api-key': openaiKey };

  const body = {
    messages: [
      { role: "system", content: "You are a summarizer for telecom support calls." },
      { role: "user", content: summaryPrompt }
    ],
    max_tokens: 1000,
    temperature: openaiTemperature,
    top_p: openaiTopP,
    frequency_penalty: openaiFrequencyPenalty,
    presence_penalty: openaiPresencePenalty
  };

  try {
    const res = await axios.post(url, body, { headers });
    return res.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Summary fallback failed:', error.message);
    return '';
  }
}

module.exports = router;
