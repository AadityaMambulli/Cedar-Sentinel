"""Interactive CLI entrypoint for Cedar Sentinel AI Agent.

Orchestrates Strands Agent, Cedar Policy Engine, Action Executor, and OpenSearch Audit Store.
"""

import sys
import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv

# Ensure repo root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

load_dotenv()

from strands import Agent
from agent.model_config import get_model
from agent.tools import authorize_and_execute

# Suppress overly verbose SDK debug logs in CLI mode
logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")

AGENT_SYSTEM_PROMPT = """You are Cedar Sentinel's AI Customer Service Agent.
You assist users with e-commerce operations including retrieving order details and processing refunds.

Security & Authorization Policy:
1. You MUST use the `authorize_and_execute` tool for EVERY operational action (e.g., issuing refunds, reading order details).
2. Never claim an action succeeded, failed, or was processed without invoking `authorize_and_execute`.
3. If an action is permitted ('Allow'), report the success clearly with details (order ID, amount refunded, updated total).
4. If an action is blocked ('Deny'), explain to the user that the action was blocked by security policy and explain why (e.g., amount exceeds maximum threshold).
"""


def create_agent(model=None) -> Agent:
    """Create and return a configured Strands Agent instance."""
    agent_model = model or get_model()
    return Agent(
        model=agent_model,
        system_prompt=AGENT_SYSTEM_PROMPT,
        tools=[authorize_and_execute],
    )


def print_banner():
    """Print a styled CLI banner for demo presentation."""
    print("=" * 70)
    print("  🛡️  CEDAR SENTINEL — AI AGENT PERMISSION & AUDIT LAYER")
    print("  Powered by Strands SDK | Amazon Bedrock / Ollama | Cedar Policies")
    print("=" * 70)
    print("  Example requests:")
    print("   • 'Refund order 12345 for $40'   (Allowed: under $100 policy limit)")
    print("   • 'Refund order 67890 for $150'  (Denied: exceeds $100 policy limit)")
    print("   • 'Check details for order 12345' (Allowed: read order policy)")
    print("   • Type 'exit' or 'quit' to exit.")
    print("=" * 70)
    print()


def run_prompt(agent: Agent, prompt_text: str) -> None:
    """Execute a single prompt through the Strands agent and display structured output."""
    print(f"\n💬 User: {prompt_text}")
    print("-" * 70)
    print("⚙️  Agent evaluating request and consulting Cedar policies...")

    try:
        result = agent(prompt_text)
        print("-" * 70)
        print(f"🤖 Agent Response:\n{result}\n")
    except Exception as e:
        print(f"❌ Error during agent execution: {e}\n")


def main():
    """Main CLI entrypoint supporting both one-shot prompt argument and interactive loop."""
    print_banner()

    agent = create_agent()

    # If prompt supplied as command-line arguments, run it once and exit
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:]).strip()
        if user_input:
            run_prompt(agent, user_input)
            return

    # Interactive loop
    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("\nExiting Cedar Sentinel CLI. Goodbye!")
                break
            run_prompt(agent, user_input)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting Cedar Sentinel CLI. Goodbye!")
            break


if __name__ == "__main__":
    main()
