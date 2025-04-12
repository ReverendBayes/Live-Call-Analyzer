// Express routes for Azure AI Language API (Key Phrase Extraction, Entity Recognition, PII Detection)

const express = require('express');
const router = express.Router();
const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');
const config = require('../config.json');

// Load Azure Text Analytics credentials
const textAnalyticsKey = config[0].text_analytics_key;
const textAnalyticsEndpoint = config[0].text_analytics_endpoint;

// Health check route
router.get('/ta/sayhello', async (req, res) => {
  res.send('Hello World from the Azure Language TA backend! ' + new Date());
});

// Key phrases, entity recognition, and PII redaction route
router.post('/ta-key-phrases', async (req, res) => {
  const requestText = req.body.transcript;

  if (!requestText || typeof requestText !== 'string') {
    return res.status(400).send('Invalid or missing transcript');
  }

  try {
    const inputArray = [requestText];
    const client = new TextAnalyticsClient(textAnalyticsEndpoint, new AzureKeyCredential(textAnalyticsKey));

    // Key phrase extraction
    const keyPhraseResult = await client.extractKeyPhrases(inputArray);
    let keyPhrasesText = "KEY PHRASES: ";
    keyPhraseResult.forEach(document => {
      if (!document.error) {
        keyPhrasesText += document.keyPhrases.join(', ') + ' ';
      }
    });

    // Entity recognition (non-PII)
    const entityResults = await client.recognizeEntities(inputArray);
    let entityText = "ENTITIES: ";
    entityResults.forEach(document => {
      if (!document.error) {
        document.entities.forEach(entity => {
          if (entity.confidenceScore > 0.5) {
            const currentEntity = `${entity.category}: ${entity.text}`;
            entityText += currentEntity + ' | ';
          }
        });
      }
    });

    // PII recognition
    const piiResults = await client.recognizePiiEntities(inputArray, "en");
    let piiText = "PII (Redacted): ";
    piiResults.forEach(result => {
      if (!result.error && result.redactedText.includes('*')) {
        piiText += result.redactedText;
      }
    });

    // Final JSON response
    res.status(200).json({
      keyPhrasesExtracted: keyPhrasesText.trim(),
      entityExtracted: entityText.trim(),
      piiExtracted: piiText.trim()
    });

  } catch (err) {
    console.error('Azure TA error:', err.message || err);
    res.status(500).send('Azure Text Analytics error. Check keys, endpoint, and API availability.');
  }
});

module.exports = router;
