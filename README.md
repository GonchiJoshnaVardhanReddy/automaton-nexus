
# Automaton Nexus — Multilingual AI Voice Agent Platform

### Automated Customer Calling Workflows Powered by Generative AI

![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat-square\&logo=fastapi\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square\&logo=python\&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS_Bedrock-Nova_Lite-FF9900?style=flat-square\&logo=amazonaws\&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Overview

**Automaton Nexus** is a production‑ready multilingual AI voice automation platform that enables organizations to deploy intelligent outbound calling agents without building telephony pipelines from scratch.

Using natural‑language prompts or reusable Markdown templates, teams can generate dynamic IVR workflows powered by **Amazon Bedrock Nova Lite**, convert them into speech using **Sarvam TTS**, and execute real customer calls through **Exotel**.

Automaton Nexus is designed for scale, extensibility, and rapid experimentation with AI voice workflows across industries such as e‑commerce, logistics, healthcare, marketing, and customer support.

---

## Key Capabilities

### AI Voice Agent Generation

Automaton Nexus converts structured prompts into multilingual IVR scripts using Amazon Bedrock Nova Lite. These scripts are automatically formatted for real‑world execution with retry logic and keypad fallback support.

### Multilingual Calling Support

Supports regional communication in:

* English
* Hindi
* Kannada
* Marathi

Additional languages such as Tamil, Telugu, and Bengali are planned.

### Community Skills Marketplace

A built‑in prompt marketplace allows teams to:

* browse reusable agent templates
* upload custom skills
* clone community workflows
* edit Markdown prompts with live preview
* instantly deploy generated agents

### Real‑Time Campaign Execution

Outbound calls are initiated using Exotel and tracked through a live dashboard with streaming campaign updates via WebSockets.

### Dual Interaction Modes

Customers can respond through:

* speech recognition (Sarvam STT)
* keypad input (DTMF fallback)

Ensuring reliability even in low‑quality audio environments.

### Campaign Analytics Dashboard

Monitor:

* delivery status
* confirmation rates
* retries
* failures
* average call duration
* campaign progress in real time

---

## Supported Workflow Types

Automaton Nexus agents can automate:

| Workflow              | Description                                              |
| --------------------- | -------------------------------------------------------- |
| Order Confirmation    | Confirm pending purchases with speech or keypad response |
| Delivery Updates      | Notify customers of shipment status                      |
| Appointment Reminders | Improve attendance through automated reminders           |
| Payment Reminders     | Share dues and payment links via voice + SMS             |
| Promotional Campaigns | Broadcast marketing announcements                        |
| Lead Qualification    | Capture structured responses from prospects              |
| Customer Feedback     | Collect ratings and voice reviews                        |

---

## Platform Architecture

Automaton Nexus follows a modular AI‑first pipeline:

1. User defines agent via dashboard prompt or skill template
2. Backend sends request to Amazon Bedrock Nova Lite
3. Model generates structured IVR script
4. Script processed into language blocks + retry logic
5. Sarvam converts script to speech
6. Exotel executes outbound calls
7. Customer responds via speech or keypad
8. Results streamed to dashboard analytics layer

<img width="1536" height="1024" alt="initial diagram" src="https://github.com/user-attachments/assets/f4432188-70e0-4fb4-9b2c-bf7c700d98db" />
---

## Technology Stack

### Backend

| Technology  | Purpose                              |
| ----------- | ------------------------------------ |
| FastAPI     | Async REST API framework             |
| MongoDB     | Agents, campaigns, skills storage    |
| Motor       | Async MongoDB driver                 |
| Kafka       | Event streaming for campaign updates |
| boto3       | AWS Bedrock runtime access           |
| python‑jose | JWT authentication                   |
| Pydantic v2 | Validation and serialization         |

### Voice Layer

| Technology | Purpose                      |
| ---------- | ---------------------------- |
| Exotel     | Telephony infrastructure     |
| Sarvam TTS | Multilingual voice synthesis |
| Sarvam STT | Speech recognition           |

### AI Layer

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| Amazon Bedrock | Managed LLM inference platform   |
| Nova Lite      | Structured IVR script generation |

### Frontend

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| React 19       | UI framework                     |
| Tailwind CSS   | Styling system                   |
| Framer Motion  | UI animations                    |
| react‑markdown | Markdown rendering               |
| Recharts       | Campaign analytics visualization |
| shadcn/ui      | Accessible component primitives  |

---

## Community Skills Marketplace

The Community Skills Marketplace enables collaborative prompt engineering using Markdown‑based templates.

### Features

Users can:

* explore categorized public skills
* upload reusable templates
* clone workflows instantly
* customize prompts before execution
* generate agents with one click

### Included Starter Skills

* Multilingual Order Confirmation Agent
* Delivery Status Update Agent
* Delivery Reschedule Assistant
* Promotion Campaign Voice Agent
* Appointment Reminder Voice Agent

### Included Advanced Skills

* Payment Reminder Voice Agent
* Lead Qualification Calling Agent
* Customer Feedback Collection Agent
* Support Escalation Voice Agent
* Service Appointment Confirmation Agent

---

## Example Prompt Template Format

All skills are stored as Markdown files with YAML metadata.

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
You are an AI voice agent confirming a customer order.

## Call Flow

### Greeting
Introduce yourself and greet the customer.

### Order Summary
Read order details clearly.

### Confirmation
Ask customer to say Yes or press 1 to confirm.

## Output Format
Return multilingual IVR script.
```

---

## AWS Setup

Automaton Nexus uses Amazon Bedrock Nova Lite for agent generation.

### Configure AWS CLI

```bash
aws configure
```

Provide:

```
AWS Access Key ID
AWS Secret Access Key
Region: ap-south-1
Output: json
```

### Environment Variables

Create `backend/.env`

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=ap-south-1
BEDROCK_MODEL_ID=apac.amazon.nova-lite-v1:0

LLM_MOCK_MODE=false

MONGO_URL=mongodb://localhost:27017
DB_NAME=automaton_nexus

JWT_SECRET_KEY=change-this-in-production
```

### Enable Model Access

1. Open AWS Bedrock Console
2. Navigate to Model Access
3. Enable Nova Lite in ap-south-1 region

---

## Running Locally

### Requirements

* Python 3.10+
* Node.js 18+
* MongoDB (optional)
* AWS credentials (optional in mock mode)

### Backend Setup

```bash
git clone https://github.com/your-org/automaton-nexus.git
cd automaton-nexus

pip install fastapi uvicorn boto3 pymongo motor python-jose[cryptography] \
            pydantic[email] python-dotenv aiohttp

cp backend/.env.example backend/.env

cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

API available at:

```
http://127.0.0.1:8001
```



### Frontend Setup

```bash
cd frontend

yarn install
yarn start
```

Dashboard:

```
http://localhost:3000
```

---

## Example API Request

Generate a voice agent:

**POST** `/api/skills/generate-agent`

```json
{
  "skill_id": "example_skill_id",
  "edited_markdown": "Create multilingual order confirmation agent with keypad fallback",
  "agent_name": "Order Confirmation Bot",
  "voice": "professional_female"
}
```

Response:

```json
{
  "id": "generated_agent_id",
  "name": "Order Confirmation Bot",
  "status": "draft"
}
```

---

## Use Cases

### E‑Commerce

Automate confirmations, delivery updates, and refund notifications at scale.

### Healthcare

Send reminders, follow‑ups, and adherence tracking calls in regional languages.

### Logistics

Coordinate deliveries and rescheduling without manual intervention.

### Marketing

Broadcast promotions and capture structured lead responses.

### Customer Support

Collect feedback and escalate unresolved tickets automatically.

---

## Security Best Practices

Recommended production safeguards:

* rotate AWS credentials regularly
* never commit `.env` files
* use IAM roles instead of static keys
* change JWT secrets before deployment
* enable MongoDB authentication
* restrict CORS origins
* validate Exotel webhook signatures

---

## Future Roadmap

| Feature                    | Status      |
| -------------------------- | ----------- |
| Skill rating system        | Planned     |
| Prompt version history     | Planned     |
| Call heatmap analytics     | Planned     |
| Voice cloning support      | Planned     |
| Enterprise workspace mode  | Planned     |
| CRM integrations           | Planned     |
| Additional language packs  | In Progress |
| Mobile monitoring app      | Planned     |
| Agent handoff workflows    | Planned     |
| Knowledge Base RAG support | In Progress |

---

## Contributors

Built for the Automaton AI Infosystem Voice Agent Automation Challenge.

Primary contributions include:

* backend architecture
* AI orchestration layer
* telephony integration
* skills marketplace
* campaign analytics dashboard

---

## License

MIT License

Copyright (c) 2026 Automaton AI Infosystem

Permission is hereby gr
