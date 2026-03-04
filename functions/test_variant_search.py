import os
import sys
import asyncio

# Ensure project root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Mock env setup to allow Vertex AI fallback
os.environ["ADK_LOG_LEVEL"] = "DEBUG"

from expert_v3.agent import ExpertV3Agent

agent = ExpertV3Agent()

print("\n--- TEST: Asking for a specific color/volume variant ---")
res = agent.process_chat("Γεια, ψάχνω για ακρυλικό σπρέι αλλά το θέλω συγκεκριμένα σε Μαύρο Ματ χρώμα 400ml. Έχεις κάτι τέτοιο να μου προτείνεις;")
print(res)

print("\n--- TEST: Fallback search behavior ---")
res2 = agent.process_chat("Τέλεια. Μπορούμε να τα κάνουμε πλάνο εφαρμογής για να βάψω τον καθρέφτη μου;")
print(res2)
