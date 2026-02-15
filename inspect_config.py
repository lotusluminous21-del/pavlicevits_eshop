
from google.genai import types
import inspect

print("Fields of CreateBatchJobConfig:")
try:
    # Usually pydantic models or typed dicts
    # Try creating one and see fields, or inspect init
    print(inspect.signature(types.CreateBatchJobConfig))
except Exception as e:
    print(f"Could not inspect signature: {e}")
    # Try dir
    print([d for d in dir(types.CreateBatchJobConfig) if not d.startswith("_")])
