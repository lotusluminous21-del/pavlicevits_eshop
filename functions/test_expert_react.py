import sys, json
import logging
sys.path.insert(0, r'c:\Users\lotus\Documents\pavlicevits\functions')
from dotenv import load_dotenv
load_dotenv(r'c:\Users\lotus\Documents\pavlicevits\functions\.env')
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test")

from expert_v3.agent import ExpertV3Agent

try:
    agent = ExpertV3Agent()
    print("\n--- TEST: Rusty Galvanized Steel ---")
    result = agent.process_chat("Hello, I need to paint over a rusty galvanized steel pipe. What do you recommend?", [])
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print("\n--- TEST: Teak Wood Deck ---")
    history = [{"role": "user", "content": "I have an old teak deck"}, {"role": "model", "content": "Great, what condition is it in?"}]
    result2 = agent.process_chat("It is weathered and grey, never painted.", history)
    print(json.dumps(result2, indent=2, ensure_ascii=False))
except Exception as e:
    import traceback
    traceback.print_exc()
