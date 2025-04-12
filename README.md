## 📁 Project Structure: Live-Call-Analyzer (Telecom Refactor)

```
Live-Call-Analyzer/
├── call-intelligence-realtime/                 # Core Application
│   ├── ai-app-backend/                         # Node.js API backend
│   │   ├── serverapp.js                        # Express server entrypoint
│   │   ├── routes/
│   │   │   ├── openai-gpt.js                   # GPT summarization logic
│   │   │   ├── azureai-language.js             # Azure Text Analytics integration
│   │   │   └── openai-config.json              # Prompt configuration
│   │   ├── config.json                         # App config file
│   │   └── Template/
│   │       └── ArmTemplateBatch.json           # Optional deployment template
│
│   └── web-app-frontend/                       # React UI frontend
│       ├── public/                             # Static assets (favicon, manifest)
│       ├── src/
│       │   ├── App.js                          # App layout
│       │   ├── batchPage.js                    # Main call analysis UI
│       │   ├── index.js                        # Entry point
│       │   └── token_util.js                   # Token management
│       └── package.json                        # Frontend dependencies
│
├── postcall-analytics-azure/                   # Azure Infrastructure Setup
│   └── postcall-analytics-arm-template.json    # ARM template to deploy cloud resources
│
├── postcall-analytics-powerbi/                 # Power BI Integration
│   ├── SentimentInsights.pbit                  # Power BI dashboard template (sentiment)
│   └── SpeechInsights.pbit                     # Power BI dashboard template (speech insights)
│
└── README.md                                   # Project overview & instructions
```

