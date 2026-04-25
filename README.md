<div align="center">

# S.A.R.A — Smart AI Response Agent

### Multilingual AI Voice Agent Platform for Automated Customer Calling Workflows

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Nova_Lite-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/bedrock)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br/>

> **S.A.R.A** is an end-to-end multilingual AI voice calling platform that generates dynamic IVR scripts using Amazon Bedrock Nova Lite, executes real phone calls via Exotel, and provides a community-driven prompt marketplace for reusable agent templates.

</div>

---

## Table of Contents

- [Project Description](#project-description)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Community Skills Marketplace](#community-skills-marketplace)
- [AWS Setup](#aws-setup)
- [Run Locally](#run-locally)
- [Example API Request](#example-api-request)
- [Use Cases](#use-cases)
- [Security Notes](#security-notes)
- [Future Roadmap](#future-roadmap)
- [Contributors](#contributors)
- [License](#license)

---

## Project Description

**S.A.R.A** (Smart AI Response Agent) is a production-ready platform that enables businesses to deploy automated AI voice agents for customer communication — without writing a single line of telephony code.

Users define their agent's behaviour using natural language prompts or Markdown templates. S.A.R.A sends those prompts to **Amazon Bedrock Nova Lite**, which generates a structured IVR (Interactive Voice Response) script. The script is then converted to speech using **Sarvam TTS**, delivered to customers via **Exotel**, and handles responses through both voice recognition (STT) and DTMF keypad fallback.

### Supported Calling Workflows

| Workflow | Description |
|---|---|
| 🛒 Order Confirmation | Confirm pending orders with speech or keypad input |
| 🚚 Delivery Updates | Notify customers of out-for-delivery status with tracking reference |
| 📅 Appointment Reminders | Remind customers of upcoming appointments and collect attendance |
| 💳 Payment Reminders | Politely remind customers of pending dues with SMS payment link option |
| 📣 Promotional Campaigns | Inform customers about offers, discounts, and limited-time deals |
| 🎯 Lead Qualification | Ask structured qualification questions to score sales leads |
| ⭐ Customer Feedback | Collect post-service ratings and optional voice feedback |

---

## Key Features

### 🤖 AI Agent Generation via Amazon Bedrock Nova Lite
Prompts are sent to `apac.amazon.nova-lite-v1:0` which generates structured, multilingual IVR scripts ready for voice execution. Supports custom instructions, use-case templates, and markdown-based prompt input.

### 🌐 Multilingual Voice Support
Full support for **English, Hindi, Kannada, and Marathi** across all agent workflows. Scripts are generated with language-specific blocks and delivered using Sarvam's regional TTS voices.

### 📚 Community Skills Marketplace
A built-in prompt marketplace where users can browse, upload, edit, clone, and instantly execute Markdown-based agent templates. Ships with 10 default skills (5 Starter + 5 Pro) seeded on startup.

### 📞 Real-Time Call Execution with Exotel
Agents are deployed directly to Exotel's telephony infrastructure. Calls are initiated, tracked, and logged in real time with live campaign dashboards powered by WebSockets.

### 🎙️ Speech + DTMF Fallback Interaction
Every agent supports dual-mode interaction — customers can respond by voice (processed via Sarvam STT) or by pressing keypad digits (DTMF). Retry logic handles non-responsive calls gracefully.

### 📊 Retry Logic and Call Tracking Dashboard
Campaigns track every call's status (pending → calling → confirmed / rejected / no-answer / failed), display live progress, and surface analytics including success rate, average duration, and daily trends.

### ✏️ Editable and Shareable Prompt Templates
All agent prompts are stored as Markdown files. Users can share templates publicly, keep private copies, clone community prompts, and edit them before execution — enabling a collaborative prompt engineering workflow.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        S.A.R.A Platform Flow                        │
└─────────────────────────────────────────────────────────────────────┘

  User / Dashboard
        │
        │  1. Define agent via prompt or Community Skill template
        ▼
  ┌─────────────┐
  │  React UI   │  ── POST /api/skills/generate-agent ──►
  │  Dashboard  │  ── POST /api/agents ──────────────────►
  └─────────────┘
        │
        ▼
  ┌──────────────────────────────────────────────────────┐
  │                  FastAPI Backend                      │
  │                                                      │
  │  ┌─────────────┐    ┌──────────────────────────┐    │
  │  │ Skills API  │    │     Agent Builder API     │    │
  │  │ /api/skills │    │     /api/agents           │    │
  │  └──────┬──────┘    └────────────┬─────────────┘    │
  │         │                        │                   │
  │         └──────────┬─────────────┘                   │
  │                    ▼                                  │
  │         ┌─────────────────────┐                      │
  │         │   LLM Service       │                      │
  │         │   (llm_service.py)  │                      │
  │         └──────────┬──────────┘                      │
  └────────────────────┼────────────────────────────────-┘
                       │
                       │  2. Send prompt to Bedrock
                       ▼
  ┌────────────────────────────────────┐
  │       Amazon Bedrock               │
  │   Model: apac.amazon.nova-lite-v1  │
  │   Region: ap-south-1               │
  └────────────────┬───────────────────┘
                   │
                   │  3. Returns structured IVR script
                   ▼
  ┌────────────────────────────────────┐
  │       Script Processing            │
  │  • Language block extraction       │
  │  • DTMF mapping                    │
  │  • Retry logic injection           │
  └────────────────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
  ┌───────────┐        ┌─────────────┐
  │ Sarvam    │        │  MongoDB /  │
  │ TTS / STT │        │  Local Store│
  │ (Voice)   │        │  (Persist)  │
  └─────┬─────┘        └─────────────┘
        │
        │  4. Convert script to speech
        ▼
  ┌───────────────────┐
  │  Exotel Telephony │
  │  (Voice Execution)│
  └────────┬──────────┘
           │
           │  5. Initiate outbound call to customer
           ▼
  ┌───────────────────────────────────┐
  │         Customer Phone            │
  │  • Hears TTS voice message        │
  │  • Responds via speech or keypad  │
  └────────────────┬──────────────────┘
                   │
                   │  6. Response captured
                   ▼
  ┌────────────────────────────────────┐
  │  Sarvam STT / DTMF Handler         │
  │  • Transcribes speech response     │
  │  • Maps keypad digit to intent     │
  └────────────────┬───────────────────┘
                   │
                   ▼
  ┌────────────────────────────────────┐
  │  Campaign Manager + WebSocket      │
  │  • Updates call log status         │
  │  • Broadcasts live progress        │
  │  • Publishes to Kafka queue        │
  └────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework — async, high-performance |
| **MongoDB** | Primary database for agents, campaigns, call logs, skills |
| **Motor** | Async MongoDB driver for Python |
| **Kafka** | Message queue for campaign event streaming |
| **boto3** | AWS SDK — Bedrock runtime invocation |
| **python-jose** | JWT authentication |
| **Pydantic v2** | Request/response validation and serialization |

### Voice Layer
| Technology | Purpose |
|---|---|
| **Exotel** | Outbound call initiation and telephony management |
| **Sarvam TTS** | Text-to-speech in English, Hindi, Kannada, Marathi |
| **Sarvam STT** | Speech-to-text for customer voice response capture |

### AI Layer
| Technology | Purpose |
|---|---|
| **Amazon Bedrock** | Managed AI inference service |
| **Amazon Nova Lite** (`apac.amazon.nova-lite-v1:0`) | IVR script generation from natural language prompts |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **react-markdown** | Markdown rendering in skill preview and editor |
| **Recharts** | Campaign analytics charts |
| **Sonner** | Toast notifications |
| **shadcn/ui** | Accessible component primitives |

### Storage
| Technology | Purpose |
|---|---|
| **MongoDB Atlas / Local** | Agents, campaigns, call logs, community skills |
| **AWS S3** | Voice recording storage (optional) |
| **Bedrock Knowledge Base** | RAG-based context injection (optional) |
| **Local JSON fallback** | `.skills_store.json`, `.agents_store.json` when MongoDB is unavailable |

---

## Community Skills Marketplace

The **Community Skills** section is a built-in prompt marketplace that lets teams collaborate on reusable AI agent templates written in Markdown.

### What Users Can Do

- 📖 **Browse** — explore public skills filtered by tag, language, category, or popularity
- ⬆️ **Upload** — share custom Markdown prompts with the community
- ✏️ **Edit** — modify any owned skill using the built-in Markdown editor with live preview
- 🔁 **Clone** — copy any public skill as a private editable version
- ⚡ **Execute** — click "Use Skill" to instantly generate an AI agent from any template

### Starter Skills (5 included)

| Skill | Tags |
|---|---|
| Multilingual Order Confirmation Agent | order-confirmation, ecommerce, multilingual |
| Delivery Status Update Agent | delivery-update, logistics, tracking |
| Delivery Reschedule Assistant | delivery-reschedule, logistics |
| Promotion Campaign Voice Agent | promotion, marketing, campaign |
| Appointment Reminder Voice Agent | reminder, appointment, healthcare |

### Advanced / Pro Skills (5 included)

| Skill | Tags |
|---|---|
| Payment Reminder Voice Agent | payment-reminder, billing, finance |
| Lead Qualification Calling Agent | sales, lead-qualification, marketing |
| Customer Feedback Collection Agent | feedback, survey, support |
| Support Escalation Voice Agent | support, escalation, helpdesk |
| Service Appointment Confirmation Agent | appointment-confirmation, service |

### Prompt Template Format

All skills are stored as `.md` files with YAML front matter:

```markdown
---
title: Order Confirmation Agent
description: Confirms customer orders via voice call
tags: order-confirmation, multilingual
languages: English, Hindi, Kannada, Marathi
category: starter
is_official: true
---

## Role
You are an AI voice calling agent for order confirmation.

## Call Flow

### 1. Greeting
Greet the customer by name and introduce the brand.

### 2. Order Summary
Read out the order details and total amount.

### 3. Confirmation
Ask the customer to say "Yes" or press 1 to confirm.

## Output Format
Return a structured IVR script for: `English | Hindi | Kannada | Marathi`
```

---

## AWS Setup

S.A.R.A uses **Amazon Bedrock** for AI script generation. Configure your AWS credentials before running the backend.

### Step 1 — Configure AWS CLI

```bash
aws configure
```

Enter when prompted:

```
AWS Access Key ID:     <your-access-key-id>
AWS Secret Access Key: <your-secret-access-key>
Default region name:   ap-south-1
Default output format: json
```

### Step 2 — Set Environment Variables

Create or update `backend/.env`:

```env
# AWS Bedrock
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_DEFAULT_REGION=ap-south-1
BEDROCK_MODEL_ID=apac.amazon.nova-lite-v1:0

# Set to "false" to enable real Nova Lite inference
LLM_MOCK_MODE=false

# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=automaton_nexus

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
```

### Step 3 — Enable Model Access

1. Open the [AWS Bedrock Console](https://console.aws.amazon.com/bedrock)
2. Navigate to **Model access**
3. Enable **Amazon Nova Lite** for your account in `ap-south-1`

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": "*"
    }
  ]
}
```

> **Development mode:** Set `LLM_MOCK_MODE=true` to run without AWS credentials. The system returns pre-built mock IVR scripts for all use cases.

---

## Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+ and Yarn
- MongoDB (optional — falls back to local JSON store)
- AWS credentials (optional — mock mode available)

### Backend

```bash
# Clone the repository
git clone https://github.com/your-org/sara-voice-agent.git
cd sara-voice-agent

# Install Python dependencies
pip install fastapi uvicorn boto3 pymongo motor python-jose[cryptography] \
            pydantic[email] python-dotenv aiohttp

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start the backend server
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at:
```
http://127.0.0.1:8001
```

Interactive API documentation (Swagger UI):
```
http://127.0.0.1:8001/docs
```

### Frontend

```bash
cd frontend

# Install dependencies
yarn install
yarn add react-markdown remark-gfm @tailwindcss/typography

# Start the development server
yarn start
```

The dashboard will be available at:
```
http://localhost:3000
```

### Verify Startup

On backend startup you should see:

```
🚀 Starting Automaton Nexus Backend...
✅ Database connected          (or: ⚠️ Database unavailable, using local store)
✅ Seeded 10 default Community Skills
INFO: Application startup complete.
```

---

## Example API Request

### Generate an AI Voice Agent

**Endpoint:** `POST /api/skills/generate-agent`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "skill_id": "a08f309dee8e48749102da51ce05738b",
  "edited_markdown": "Create a multilingual order confirmation agent with speech and keypad fallback. The agent should greet the customer, read the order summary, ask for confirmation via 'Yes' or Press 1, offer cancellation via Press 2, retry once on no response, and send a confirmation SMS on success.",
  "agent_name": "Order Confirmation Bot",
  "voice": "professional_female"
}
```

**Response:**
```json
{
  "id": "3661e9c41d1a43fc929166b966c436ce",
  "name": "Order Confirmation Bot",
  "generated_script": "Hello! This is {agent_name} from {company_name}...\n\n[ENGLISH]\nGreeting: Hello {customer_name}, this is...\nConfirmation: Press 1 to confirm, Press 2 to cancel...\n\n[HINDI]\nGreeting: नमस्ते {customer_name}...\n\n[KANNADA]\n...\n\n[MARATHI]\n...",
  "status": "draft"
}
```

The response returns an **IVR-ready multilingual script** with separate language blocks, DTMF mappings, and retry logic — ready to be deployed to Exotel for live call execution.

---

## Use Cases

### 🛍️ E-Commerce
Automate order confirmations, delivery updates, and return/refund notifications at scale. Reduce customer service load while maintaining a personal touch through voice.

### 🏥 Healthcare
Send appointment reminders, post-consultation follow-ups, and medication adherence calls in the patient's preferred regional language.

### 🚛 Logistics
Notify customers of shipment status, coordinate delivery rescheduling, and handle failed delivery follow-ups without human intervention.

### 📣 Marketing
Run outbound promotional campaigns, announce flash sales, and qualify inbound leads through structured voice surveys — all from a single dashboard.

### 🎧 Customer Support
Automatically escalate unresolved tickets, collect post-resolution feedback, and route high-priority customers to live agents using intelligent DTMF menus.

---

## Security Notes

- **Rotate AWS credentials regularly** — use short-lived IAM credentials or instance roles in production environments
- **Never commit `.env` files** — add `.env` to `.gitignore` and use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production
- **Use IAM roles in production** — avoid long-lived access keys; attach IAM roles directly to EC2 instances or ECS tasks
- **JWT secret rotation** — change `JWT_SECRET_KEY` from the default value before any deployment; all existing tokens will be invalidated
- **MongoDB authentication** — enable MongoDB authentication and use a dedicated database user with least-privilege access
- **CORS configuration** — restrict `allow_origins` in `server.py` from `["*"]` to your specific frontend domain in production
- **Exotel webhook validation** — verify Exotel webhook signatures to prevent spoofed call status updates

---

## Future Roadmap

| Feature | Status |
|---|---|
| ⭐ Skill rating and review system | Planned |
| 🔖 Prompt versioning and diff viewer | Planned |
| 📊 Agent analytics dashboard with call heatmaps | Planned |
| 🎙️ Voice personalization (custom TTS voice cloning) | Planned |
| 🏢 Enterprise workspace support (multi-tenant) | Planned |
| 🔌 Webhook integrations (Shopify, Salesforce, Zoho CRM) | Planned |
| 🌍 Additional language support (Tamil, Telugu, Bengali) | Planned |
| 📱 Mobile app for campaign monitoring | Planned |
| 🤖 Agent-to-agent handoff (warm transfer) | Planned |
| 📁 Bedrock Knowledge Base RAG integration | In Progress |

---

## Contributors

```
Built for the Automaton AI Infosystem Voice Agent Automation Challenge
Project: S.A.R.A — Smart AI Response Agent
```

| Role | Contribution |
|---|---|
| Platform Architecture | FastAPI backend, MongoDB schema, WebSocket real-time layer |
| AI Integration | Amazon Bedrock Nova Lite, LLM service, prompt engineering |
| Voice Layer | Exotel telephony, Sarvam TTS/STT integration |
| Community Skills | Markdown marketplace, seed templates, clone/edit workflows |
| Frontend | React dashboard, campaign management, skills UI |

---

## License

```
MIT License

Copyright (c) 2026 Automaton AI Infosystem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**S.A.R.A — Smart AI Response Agent**

*Automating customer conversations, one voice call at a time.*

</div>
