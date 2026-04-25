"""
LLM Service - AWS Bedrock Integration (with mock fallback)
Handles AI reasoning for agent conversations
"""

import os
import json
from typing import Dict, Any, Optional
import asyncio

# Mock mode for demo (set to False when you have AWS Bedrock credentials)
MOCK_MODE = os.environ.get("LLM_MOCK_MODE", "true").lower() == "true"


class LLMService:
    """Service for LLM interactions using AWS Bedrock"""
    
    def __init__(self):
        self.model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
        
        if not MOCK_MODE:
            import boto3
            self.client = boto3.client(
                'bedrock-runtime',
                region_name=os.environ.get("AWS_REGION", "us-east-1"),
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY")
            )
        else:
            self.client = None
    
    async def generate_agent_script(
        self,
        use_case: str,
        language: str,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Generate a conversation script for the agent"""
        
        if MOCK_MODE:
            return self._mock_generate_script(use_case, language, custom_instructions)
        
        prompt = f"""Generate a professional voice agent script for the following use case:
        
Use Case: {use_case}
Language: {language}
Custom Instructions: {custom_instructions or 'None'}

The script should include:
1. Greeting
2. Purpose statement
3. Main conversation flow with decision points
4. Closing statement

Format the script with placeholders like {{customer_name}}, {{order_id}}, etc.
"""
        
        response = await self._call_bedrock(prompt)
        return response
    
    async def process_conversation(
        self,
        agent_prompt: str,
        user_input: str,
        conversation_history: list,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a conversation turn and generate response"""
        
        if MOCK_MODE:
            return self._mock_process_conversation(user_input, context)
        
        history_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history[-10:]  # Last 10 messages
        ])
        
        prompt = f"""You are an AI voice agent. Your instructions:
{agent_prompt}

Context: {json.dumps(context)}

Conversation History:
{history_text}

User's latest input: {user_input}

Respond naturally and helpfully. Also detect the user's intent.
Return a JSON with: {{"response": "your response", "intent": "detected_intent", "should_end_call": boolean}}
"""
        
        response_text = await self._call_bedrock(prompt)
        
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return {
                "response": response_text,
                "intent": "unknown",
                "should_end_call": False
            }
    
    async def detect_intent(self, text: str, possible_intents: list) -> str:
        """Detect user intent from text"""
        
        if MOCK_MODE:
            return self._mock_detect_intent(text)
        
        prompt = f"""Classify the following text into one of these intents: {', '.join(possible_intents)}

Text: "{text}"

Return only the intent name, nothing else.
"""
        
        response = await self._call_bedrock(prompt)
        return response.strip().lower()
    
    async def _call_bedrock(self, prompt: str) -> str:
        """Make a call to AWS Bedrock"""
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        })
        
        response = self.client.invoke_model(
            modelId=self.model_id,
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']
    
    def _mock_generate_script(
        self,
        use_case: str,
        language: str,
        custom_instructions: Optional[str]
    ) -> str:
        """Generate a mock script for demo purposes"""
        
        scripts = {
            "order_confirmation": """Hello! This is {{agent_name}} from {{company_name}}. Am I speaking with {{customer_name}}?

Great! I'm calling to confirm your recent order #{{order_id}} placed on {{order_date}}.

Your order includes:
{{order_items}}

The total amount is {{order_total}}, and it's scheduled for delivery on {{delivery_date}}.

Would you like to confirm this order?

[If YES] Wonderful! Your order has been confirmed. You'll receive a confirmation SMS shortly. Is there anything else I can help you with?

[If NO] I understand. Could you please let me know what changes you'd like to make?

Thank you for choosing {{company_name}}. Have a great day!""",
            
            "appointment_reminder": """Hello! This is {{agent_name}} calling from {{company_name}}. Am I speaking with {{customer_name}}?

I'm calling to remind you about your upcoming appointment scheduled for {{appointment_date}} at {{appointment_time}}.

Your appointment is with {{provider_name}} at {{location}}.

Can you confirm your attendance?

[If YES] Great! We look forward to seeing you. Please arrive 10 minutes early.

[If NO] I understand. Would you like to reschedule?

Thank you! Have a wonderful day!""",
            
            "delivery_update": """Hello! This is {{agent_name}} from {{company_name}}. Am I speaking with {{customer_name}}?

I'm calling with an update about your order #{{order_id}}.

Your package is currently {{delivery_status}} and is expected to arrive {{delivery_date}}.

The delivery address we have is {{delivery_address}}. Is this correct?

[If YES] Perfect! You'll receive a notification when the delivery is out for delivery.

[If NO] Let me help you update the address.

Thank you for your patience!""",
            
            "feedback_collection": """Hello! This is {{agent_name}} from {{company_name}}. Am I speaking with {{customer_name}}?

I'm calling to get your feedback about your recent experience with us regarding order #{{order_id}}.

On a scale of 1 to 5, how would you rate your overall experience?

Thank you for your rating! Is there anything specific you'd like to share about your experience?

We really appreciate your feedback. It helps us improve our service.

Thank you for your time! Have a great day!""",
            
            "payment_reminder": """Hello! This is {{agent_name}} from {{company_name}}. Am I speaking with {{customer_name}}?

I'm calling regarding your pending payment of {{amount}} for invoice #{{invoice_id}}, which was due on {{due_date}}.

Would you like to make the payment now, or do you need assistance with payment options?

[If NOW] Great! I'll send you a secure payment link via SMS right away.

[If LATER] I understand. When would be a convenient time to follow up?

Thank you for your attention to this matter!"""
        }
        
        use_case_key = use_case.lower().replace(" ", "_")
        return scripts.get(use_case_key, scripts["order_confirmation"])
    
    def _mock_process_conversation(
        self,
        user_input: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Mock conversation processing for demo"""
        
        user_lower = user_input.lower()
        
        # Simple intent detection
        if any(word in user_lower for word in ["yes", "confirm", "okay", "ok", "sure", "haan", "ha"]):
            return {
                "response": "Wonderful! Your order has been confirmed. You'll receive a confirmation SMS shortly. Is there anything else I can help you with?",
                "intent": "confirm",
                "should_end_call": False
            }
        elif any(word in user_lower for word in ["no", "cancel", "don't", "nahi", "nako"]):
            return {
                "response": "I understand. Could you please let me know what changes you'd like to make, or would you like to cancel the order?",
                "intent": "reject",
                "should_end_call": False
            }
        elif any(word in user_lower for word in ["bye", "thank", "done", "nothing"]):
            return {
                "response": "Thank you for your time! Have a wonderful day. Goodbye!",
                "intent": "end",
                "should_end_call": True
            }
        else:
            return {
                "response": "I'm sorry, I didn't quite catch that. Could you please repeat? Would you like to confirm your order?",
                "intent": "unclear",
                "should_end_call": False
            }
    
    def _mock_detect_intent(self, text: str) -> str:
        """Mock intent detection"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["yes", "confirm", "okay", "sure"]):
            return "confirm"
        elif any(word in text_lower for word in ["no", "cancel", "don't"]):
            return "reject"
        elif any(word in text_lower for word in ["bye", "thanks", "done"]):
            return "end"
        else:
            return "unknown"


# Singleton instance
llm_service = LLMService()
