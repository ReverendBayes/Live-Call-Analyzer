## Live-Call-Analyzer (Telecom)

- ### Use This If You Need:

- Real-time speech-to-text pipelines that actually work
- Transcription with actionable insights for telecom calls  
- LLM-powered analysis: sentiment, intent, summaries, classification, churn risk, and escalation detection  
- Live escalation mapping and resolution tactic recommendations  
- Azure-centric architecture that scales without duct tape  
- Power BI as a plug-and-play analytics frontend for post-call insights

---
### 🔍 Overview

**Live-Call-Analyzer** is a modular application that analyzes telecom customer service conversations using a real-time AI pipeline built on:

- **Azure Speech Services** for audio transcription  
- **Azure AI Language** for PII redaction and entity extraction  
- **Azure OpenAI (GPT-4o)** for structured summarization, sentiment analysis, and escalation strategy  
- **Power BI** for post-call visualization of customer sentiment, issue types, agent performance, and resolution patterns

It functions as a **reference solution** — or **accelerator** — that can be extended into production use cases or customized for related domains (e.g., finance, healthcare).

---

### `telecom_prompt`: Structured Call Intelligence

This specialized prompt extracts **business and behavioral signals** from raw transcripts. It’s designed for live agent QA, retention analysis, and escalation monitoring — not just summaries.

The model extracts:
1. **Core Issue Reported** (e.g., billing error, signal loss, equipment failure)  
2. **Issue Classification**:
   - Billing
   - Connectivity
   - Retention
   - General Inquiry
   - Cancel
3. **Agent Resolution Actions** (e.g., issued refund, dispatched technician)  
4. **Customer Satisfaction at End** (choose: Satisfied, Dissatisfied, Angry, Frustrated, Neutral)  
5. **Follow-Up Offered or Promised** (Yes/No, with details)  
6. **PII Elements Mentioned** (e.g., phone number, account ID, email)  
7. **Emotional Tone Progression** (e.g., Calm → Angry, Angry → Calmed)  
8. **Recommended Resolution Tactic** based on behavioral trajectory  

---

#### 💡 Resolution Tactic Mapping (Key Takeaways Across multiple Studies)

| Emotional Progression         | Recommended Strategy                               | Why It Matters                         |
|------------------------------|----------------------------------------------------|----------------------------------------|
| Calm → Angry                 | 🔥 Early empathy and proactive follow-up           | Prevents full escalation               |
| Angry → Calmed               | 👍 Quick fixes and firm responses                  | Reinforces trust post-conflict         |
| Neutral                      | 🔍 Monitor for emotional volatility                | Signals for passive churn risk         |
| Slow escalation              | 💣 Intervene before escalation completes           | Avoids churn blowouts                  |
| Negative but passive         | 💰 Offer apology or tangible credit                | Retention requires preemptive value    |

---

### Why This Matters

- Uses **behavioral reasoning**, not just topic classification  
- Enables **real-time coaching**, **QA auditing**, and **escalation prediction**  
- Connects to **Power BI dashboards** for trend analysis across calls, agents, and categories  
- Designed to be modular and customizable — prompt logic and model settings are easily extensible

> 📌 This prompt powers a real-time **behavioral insight engine**, not just a summarizer.

---

### Project Layout

```bash
Live-Call-Analyzer/
├── call-intelligence-realtime/                 # Core application runtime
│   ├── ai-app-backend/                         # Node.js API backend
│   │   ├── serverapp.js                        # Express server entrypoint
│   │   ├── routes/
│   │   │   ├── openai-gpt.js                   # GPT-4o summarization logic
│   │   │   ├── azureai-language.js             # Azure Text Analytics integration
│   │   │   └── openai-config.json              # Prompt & model settings
│   │   ├── config.json                         # Credential and region configuration
│   │   └── Template/
│   │       └── ArmTemplateBatch.json           # Optional ARM deployment template
│
│   └── web-app-frontend/                       # React UI frontend
│       ├── public/                             # Static assets
│       ├── src/
│       │   ├── App.js                          # Layout container
│       │   ├── batchPage.js                    # Main call analysis UI
│       │   ├── index.js                        # Frontend entrypoint
│       │   └── token_util.js                   # Token management
│       └── package.json                        # Frontend dependencies
│
├── postcall-analytics-azure/                   # Azure resource definitions
│   └── postcall-analytics-arm-template.json    # ARM template for cloud infra
│
├── postcall-analytics-powerbi/                 # Power BI dashboards
│   ├── SentimentInsights.pbit                  # Sentiment dashboard template
│   └── SpeechInsights.pbit                     # Speech + topic dashboard template
│
└── README.md                                   # Project overview and instructions
```


