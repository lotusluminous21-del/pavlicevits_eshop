import os
import json
from firebase_functions import https_fn, options
from firebase_admin import firestore, initialize_app
from google import genai
from google.genai import types

# Initialize Firebase if not already done
# Initialize Firebase if not already done - moved inside
# try:
#     initialize_app()
# except ValueError:
#     pass

# Decorator moved to main.py
def chat_assistant(req: https_fn.CallableRequest) -> dict:
    """
    AI Buyer Assistant that uses RAG to answer questions about products.
    """
    # Lazy init
    try:
        initialize_app()
    except ValueError:
        pass

    # 1. Parse Request
    data = req.data
    message = data.get("message")
    session_id = data.get("sessionId")
    
    if not message:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Message is required"
        )
        
    db = firestore.client()
    
    # 2. Setup Gemini Client & Tools
    client = genai.Client(
        vertexai=True, 
        project=os.environ.get("GOOGLE_CLOUD_PROJECT"), 
        location=os.environ.get("GOOGLE_CLOUD_LOCATION", "europe-west1")
    )

    # Define the Search Tool function using Vertex AI Search
    def search_products(query: str) -> list[dict]:
        """
        Searches the product knowledge base using Vertex AI Search (RAG).
        Args:
            query: The customer's question or search query.
        Returns:
            A list of relevant products with descriptions.
        """
        try:
            import google.auth
            import google.auth.transport.requests
            import requests

            # 1. Get Auth
            credentials, project = google.auth.default()
            auth_request = google.auth.transport.requests.Request()
            credentials.refresh(auth_request)
            token = credentials.token

            # 2. Call Vertex AI Search
            # Constants
            PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT", "pavlicevits-9a889")
            LOCATION = "global"
            DATA_STORE_ID = "product-search-store"
            
            url = f"https://discoveryengine.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/collections/default_collection/dataStores/{DATA_STORE_ID}/servingConfigs/default_search:search"
            
            payload = {
                "query": query,
                "pageSize": 5,
                "contentSearchSpec": {
                    "snippetSpec": {
                        "maxSnippetCount": 1
                    },
                    "summarySpec": {
                        "summaryResultCount": 5,
                        "includeCitations": True
                    }
                }
            }

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get("results", []):
                doc = item.get("document", {})
                struct_data = doc.get("structData", {})
                results.append({
                    "id": doc.get("id"),
                    "title": struct_data.get("title"),
                    "description": struct_data.get("description"),
                    "price": struct_data.get("price"),
                    "url": struct_data.get("url"),
                    "image_url": struct_data.get("image_url")
                })
            
            print(f"Vertex AI Search found {len(results)} results for: {query}")
            return results

        except Exception as e:
            print(f"Vertex AI Search failed: {e}")
            return []

    # 3. Retrieve Conversation History
    # We store history in: chats/{sessionId}/messages/{messageId}
    history = []
    if session_id:
        messages_ref = db.collection("chats").document(session_id).collection("messages").order_by("created_at").limit(10)
        docs = messages_ref.get()
        for doc in docs:
            msg_data = doc.to_dict()
            role = msg_data.get("role") # 'user' or 'model'
            content = msg_data.get("content")
            if role and content:
                history.append(types.Content(role=role, parts=[types.Part.from_text(text=content)]))

    # 4. Generate Response with Tools
    # First, let the model decide if it needs to search
    tool_config = types.ToolConfig(
        function_calling_config=types.FunctionCallingConfig(
            mode=types.FunctionCallingMode.AUTO
        )
    )
    
    # Add user message to history
    history.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))
    
    response = client.models.generate_content(
        model="gemini-1.5-flash-001",
        contents=history,
        tools=[search_products], # Expose the python function as a tool
        config=types.GenerateContentConfig(
            temperature=0.7,
            tools=[types.Tool(function_declarations=[search_products])],
             # We just pass the function directly in updated SDKs or wrap it
        )
    )
    
    # Simple single-turn tool use handling (loop needed for multi-turn)
    # The SDK handles function execution if configured, or we handle it manually.
    # For simplicity in this "plug-and-play" helper, we'll manually execute if the model asks.
    
    final_text = ""
    
    # Check if function call was generated
    if response.function_calls:
        for call in response.function_calls:
            if call.name == "search_products":
                # Execute tool
                query_arg = call.args.get("query")
                search_results = search_products(query_arg)
                
                # Send tool output back to model
                tool_output = types.Part.from_function_response(
                    name="search_products",
                    response={"products": search_results}
                )
                
                # Append intermediate steps to history (conceptually)
                # Generate final answer based on tool output
                final_resp = client.models.generate_content(
                    model="gemini-1.5-flash-001",
                    contents=[
                        *history, # Original context
                        response.candidates[0].content, # The function call
                        types.Content(role="tool", parts=[tool_output]) # The result
                    ]
                )
                final_text = final_resp.text
    else:
        final_text = response.text

    # 5. Persist History
    if session_id:
        # Save User Message
        db.collection("chats").document(session_id).collection("messages").add({
            "role": "user",
            "content": message,
            "created_at": firestore.SERVER_TIMESTAMP
        })
        # Save AI Response
        db.collection("chats").document(session_id).collection("messages").add({
            "role": "model",
            "content": final_text,
            "created_at": firestore.SERVER_TIMESTAMP
        })

    return {
        "response": final_text,
        "sessionId": session_id or "new_session" # In reality generate a real ID
    }
