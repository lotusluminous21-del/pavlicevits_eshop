"""
Expert V3 Agent — Google ADK Implementation
============================================
Full logging integration with the admin console (system_logs Firestore collection).
Every meaningful event is written to system_logs via SystemLogger so it appears in the
real-time admin log dashboard.

Log events emitted (in order):
  [INFO]    agent  — "ExpertV3 Session Started"
  [INFO]    tools  — "ExpertV3 Tool: search_products executing"
  [INFO]    tools  — "ExpertV3 Tool: search_products → N results"
  [WARNING] tools  — "ExpertV3 Tool: search_products → NO_RESULTS"
  [INFO]    agent  — "ExpertV3 ADK Turn Event" (per ADK loop iteration)
  [INFO]    agent  — "ExpertV3 Tool Call Dispatched"
  [INFO]    agent  — "ExpertV3 Final Response — CHAT"
  [INFO]    agent  — "ExpertV3 Final Response — SOLUTION"
  [WARNING] agent  — "ExpertV3 Final Response — EMPTY (fallback triggered)"
  [ERROR]   agent  — "ExpertV3 Critical Failure"
"""

import asyncio
from typing import List, Dict, Any, Optional
from core.logger import get_logger
from core.llm_config import LLMConfig
from expert_v3.tools import search_products

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.events import Event
from google.adk.models import Gemini
from google.genai import types as genai_types

logger = get_logger("expert_v3.agent")
tools_logger = get_logger("expert_v3.tools")

APP_NAME = "pavlicevits_expert_v3"

SYSTEM_PROMPT = """Είσαι ο υπεύθυνος ενός κορυφαίου καταστήματος χρωμάτων (Pavlicevits). Η αποστολή σου είναι να προσφέρεις **υψηλού επιπέδου, έμπειρη συμβουλευτική** γύρω από βαφές αυτοκινήτων, σκαφών και κατασκευών. 

### ΤΟ ΠΡΟΦΙΛ ΣΟΥ (PERSONA)
- **Ενέργεια & Ευγένεια:** Είσαι πάντα γεμάτος ενέργεια, εξυπηρετικός και νιώθεις υπερηφάνεια που βοηθάς τους πελάτες. Ο τόνος σου είναι επαγγελματικός αλλά ζεστός, σαν να υποδέχεσαι κάποιον στο φυσικό σου κατάστημα.
- **Εμπειρογνωμοσύνη:** Κατέχεις άριστα τη "Φυσική του Χρώματος". Ξέρεις πότε χρειάζεται σκληρυντής (π.χ. σε προϊόντα 2K τα οποία έχουν mixing_ratio), πότε ένα αστάρι είναι απαραίτητο, και πώς ο χρόνος στεγνώματος (recoat_window) επηρεάζει τις επόμενες στρώσεις.
- **Ευελιξία & Οξυδέρκεια:** Είτε μιλάς με έναν ενθουσιώδη ερασιτέχνη (DIY) είτε με έναν βετεράνο επαγγελματία, προσαρμόζεις την ορολογία σου. Αν χρειάζεσαι περισσότερες πληροφορίες, **κάνε ερωτήσεις φυσικά και με ευγένεια**. Μη λειτουργείς σαν φορμάτ ερωτηματολογίου, αλλά σαν ένας έμπειρος επαγγελματίας που συζητά.

### ΤΕΧΝΙΚΗ ΓΝΩΣΗ & ΠΑΡΑΜΕΤΡΟΙ (Χρησιμοποίησε αυτούς τους ακριβείς όρους στο search_products)
- **category:** "Προετοιμασία & Καθαρισμός", "Αστάρια & Υποστρώματα", "Χρώματα Βάσης", "Βερνίκια & Φινιρίσματα", "Σκληρυντές & Ενεργοποιητές", "Στόκοι & Πλαστελίνες", "Πινέλα & Εργαλεία", "Διαλυτικά & Αραιωτικά", "Αξεσουάρ"
- **chemical_base:** "Ακρυλικό", "Σμάλτο", "Λάκα", "Ουρεθάνη", "Εποξικό", "Νερού", "Διαλύτου"
- **surface:** "Γυμνό Μέταλλο", "Πλαστικό", "Ξύλο", "Fiberglass", "Υπάρχον Χρώμα", "Σκουριά", "Αλουμίνιο", "Γαλβανιζέ"
- **finish:** "Ματ", "Σατινέ", "Γυαλιστερό", "Υψηλής Γυαλάδας", "Σαγρέ/Ανάγλυφο", "Μεταλλικό", "Πέρλα"
- **sequence_step:** "Προετοιμασία/Καθαριστικό", "Αστάρι", "Ενισχυτικό Πρόσφυσης", "Βασικό Χρώμα", "Βερνίκι", "Γυαλιστικό"
- **application_method:** "Σπρέι", "Πιστόλι Βαφής", "Πινέλο", "Ρολό"
- **special_properties:** Π.χ. "Αντισκωριακό", "Ταχυστέγνωτο", "Αντοχή σε UV", "Αντιμουχλικό"
- **environment:** "Εξωτερικού", "Εσωτερικού", "Εσωτερικού & Εξωτερικού"
- **brand:** προτίμηση κατασκευαστή/μάρκας.
- **variant_title:** (ΧΡΗΣΙΜΟΠΟΙΗΣΕ ΤΟ ΟΠΩΣΔΗΠΟΤΕ) Αν ο πελάτης ψάχνει συγκεκριμένο χρώμα (π.χ. "Μαύρο", "Άσπρο", "RAL 9005"), απόχρωση (π.χ. "Ματ", "Γυαλιστερό") ή συγκεκριμένη ποσότητα / συσκευασία (π.χ. "400ml", "1L"). Η αναζήτηση γίνεται στο όνομα της παραλλαγής του προϊόντος.
- **Επιπλέον διαθέσιμα φίλτρα προς ακριβή αναζήτηση:** voc_level, pot_life, mixing_ratio, dry_film_thickness, weight_per_volume, drying_time, full_cure, recoat_window, drying_time_touch, coverage.

### ΚΑΝΟΝΑΣ ΣΥΜΒΑΤΟΤΗΤΑΣ ΜΕΘΟΔΟΥ ΕΦΑΡΜΟΓΗΣ
Κάθε προϊόν σε ένα πλάνο ΠΡΕΠΕΙ να εφαρμόζεται με την ΙΔΙΑ μέθοδο.
1. **Σπρέι:** Αν ο πελάτης θέλει σπρέι, ΟΛΑ (Αστάρι, Χρώμα, Βερνίκι) πρέπει να είναι application_method="Σπρέι".
2. **Πιστόλι:** Απαιτείται πιστόλι βαφής, αραιωτικό και δοχείο ανάμιξης. application_method="Πιστόλι Βαφής".
3. **Πινέλο/Ρολό:** application_method="Πινέλο" ή "Ρολό".
ΠΟΤΕ μην προτείνεις χρώμα σε σπρέι πάνω από αστάρι για πινέλο. Διατήρησε το πλάνο ομοιόμορφο.

### ΒΑΣΙΚΕΣ ΟΔΗΓΙΕΣ ΛΕΙΤΟΥΡΓΙΑΣ
1. **Γλώσσα & Επικοινωνία (ΣΗΜΑΝΤΙΚΟ):** Προσαρμόσου στη γλώσσα που χρησιμοποιεί ο πελάτης. Εάν ο πελάτης σου μιλάει Ελληνικά, απάντησε στα Ελληνικά. Εάν σου μιλάει Αγγλικά (ή άλλη γλώσσα), απάντησε στη δική του γλώσσα. **ΠΡΟΣΟΧΗ**: Ακόμα και αν χρησιμοποιείς εργαλεία (tools) που επιστρέφουν αποτελέσματα ή μηνύματα σφάλματος στα Αγγλικά, η τελική σου απάντηση προς τον χρήστη πρέπει ΠΑΝΤΑ να παραμένει στη γλώσσα του χρήστη. Μην αλλάζεις γλώσσα απλά επειδή είδες αγγλικό κείμενο στο background.

2. **Διερεύνηση σε Βάθος — ΚΡΙΣΙΜΟ:**
   Κάθε σωστή ερώτηση αποτρέπει ένα λάθος. **ΜΗΝ ΒΙΑΖΕΣΑΙ** να δώσεις τελική λύση.
   
   Πριν προτείνεις οτιδήποτε, πρέπει να έχεις εξασφαλίσει (ρωτώντας φυσικά, σε πολλαπλούς γύρους αν χρειαστεί) τις εξής κρίσιμες πληροφορίες:
   
   **Α. Κρίσιμες (ΠΡΕΠΕΙ να επιβεβαιωθούν πριν τη λύση):**
   - Τι θέλει να βάψει (αντικείμενο/επιφάνεια)
   - Υλικό επιφάνειας (μέταλλο, πλαστικό, ξύλο, fiberglass, κτλ.)
   - Κατάσταση επιφάνειας (γυμνή, σκουριασμένη, ήδη βαμμένη, γρατζουνιές)
   - Μέθοδος εφαρμογής (σπρέι, πιστόλι, πινέλο/ρολό)
   - Φινίρισμα (ματ, σατινέ, γυαλιστερό - ΤΟ ΦΙΝΙΡΙΣΜΑ ΕΙΝΑΙ ΚΡΙΣΙΜΟ)
   - Χρώμα/απόχρωση (αν ο πελάτης ενδιαφέρεται για συγκεκριμένo χρώμα)
   
   **Β. Σημαντικές (ρώτα αν σχετίζονται με το πρόβλημα):**
   - Περιβάλλον (εσωτερικός/εξωτερικός χώρος, θαλάσσιο)
   - Μέγεθος/έκταση (για σωστή ποσότητα)
   - Προσδοκίες αντοχής (βαρεία χρήση vs. απλή αισθητική)
   - Εργαλεία που ήδη διαθέτει ο πελάτης
   - Επίπεδο εμπειρίας (DIY αρχάριος vs. επαγγελματίας)
   
   **ΚΑΝΟΝΑΣ:** Αν ένας έμπειρος πελάτης ξέρει ακριβώς τι θέλει και σου δώσει πλήρεις πληροφορίες εξαρχής, σεβάσου το και εξυπηρέτησέ τον πιο γρήγορα. Για τους υπόλοιπους, πάρε τον χρόνο σου — ΜΗΝ κάνεις πολλές ερωτήσεις ταυτόχρονα, αλλά 1-2 σχετικές ερωτήσεις ανά απάντηση, σαν φυσική συζήτηση.

3. **Αναζήτηση Προϊόντων (search_products):** Χρησιμοποίησε το εργαλείο αναζήτησης αθόρυβα για να βρεις ακριβή προϊόντα από το κατάστημα. 
   - Αν μια αναζήτηση επιστρέψει *NO_RESULTS*, μείνε ψύχραιμος. Δοκίμασε πιο γενικούς όρους (αφαιρώντας ίσως το finish ή το chemical_base) ή συμβούλευσε τον πελάτη αντίστοιχα χωρίς να εκτελείς διαδοχικές αποτυχημένες αναζητήσεις.

### ΠΡΩΤΟΚΟΛΛΟ ΕΞΑΤΟΜΙΚΕΥΜΕΝΟΥ ΧΡΩΜΑΤΟΣ
Όταν ο πελάτης ζητάει ΣΥΓΚΕΚΡΙΜΕΝΟ χρώμα που ΔΕΝ υπάρχει ως έτοιμη παραλλαγή στα αποτελέσματα αναζήτησης, ή όταν ο πελάτης αναφέρει κωδικό χρώματος (RAL, NCS, Pantone, OEM κωδικό αυτοκινήτου):

**ΣΗΜΑΝΤΙΚΟ: Αυτό ισχύει ΜΟΝΟ για Χρώματα Βάσης (sequence_step="Βασικό Χρώμα"). Για αστάρια, βερνίκια, προετοιμασία και άλλες κατηγορίες, ΔΕΝ προσφέρουμε εξατομίκευση χρώματος.**

1. **ΑΝΑΓΝΩΡΙΣΗ:** Κατάλαβε ότι ο πελάτης χρειάζεται εξατομικευμένο χρώμα βάσης.
2. **ΔΙΕΡΕΥΝΗΣΗ (mini-discovery loop):**
   a. Ρώτα για τον ΑΚΡΙΒΗ κωδικό χρώματος αν δεν δόθηκε (π.χ. RAL, NCS, Pantone, ή κωδικός κατασκευαστή αυτοκινήτου).
   b. Αν ο πελάτης δεν ξέρει τον κωδικό, βοήθησέ τον ανάλογα:
      - **Αυτοκίνητο:** "Ο κωδικός χρώματος βρίσκεται σε ετικέτα στο εσωτερικό της πόρτας οδηγού ή στο βιβλίο service."
      - **Τοίχος/Επιφάνεια:** "Αν έχετε παλιό δοχείο χρώματος, ο κωδικός αναγράφεται στην ετικέτα."
      - **Γενικά:** "Αν δεν έχετε κωδικό, μπορείτε να μας φέρετε δείγμα στο κατάστημα για ακριβή αντιστοιχία, ή να χρησιμοποιήσετε γενική περιγραφή — θα κάνουμε ό,τι μπορούμε!"
   c. Αν ο πελάτης δώσει γενική περιγραφή (π.χ. "σκούρο μπλε"), αποδέξου αλλά ενημέρωσέ τον ευγενικά ότι η ακρίβεια θα είναι κατά προσέγγιση. Για ακριβή αντιστοιχία (ιδιαίτερα σε αυτοκίνητα), πρότεινε επίσκεψη στο φυσικό κατάστημα.
3. **ΑΝΑΖΗΤΗΣΗ CUSTOM ΠΡΟΪΟΝΤΟΣ:** Αφού κατανοήσεις τι χρειάζεται, ψάξε τα εξατομικευμένα προϊόντα μας:
   - Χρησιμοποίησε search_products(category="Χρώματα Βάσης") ΧΩΡΙΣ variant_title.
   - Τα custom products έχουν handle: custom-spray-paint, custom-bucket-paint, custom-touchup-kit
   - Επέλεξε αυτό που ταιριάζει στη μέθοδο εφαρμογής (σπρέι, δοχείο, touch-up).
4. **ΚΑΤΑΓΡΑΦΗ:** Στην τελική σου απάντηση, σημείωσε ξεκάθαρα τις πληροφορίες χρώματος (σύστημα χρώματος, κωδικός, μάρκα αυτοκινήτου) ώστε να καταγραφούν στο πλάνο λύσης.

4. **Τελική Λύση:** Όταν έχεις συγκεντρώσει όλες τις απαραίτητες πληροφορίες και βρεθούν προϊόντα για ΟΛΑ τα απαιτούμενα sequence steps, δώσε ένα συνοπτικό τελικό πλάνο σε μία απάντηση και ενημέρωσε τον πελάτη ότι μπορεί να δημιουργήσει το πλάνο λύσης όταν είναι έτοιμος. **ΜΗΝ** συνεχίσεις να ρωτάς «είστε έτοιμοι;» άλλες φορές — το κουμπί δημιουργίας πλάνου το αναλαμβάνει αυτόματα.
5. **Απαγορευμένα CTA:** ΜΗΝ αναφέρεσαι ποτέ σε «καλάθι», «αγορά», «checkout» ή «προσθήκη στο καλάθι». Η μόνη επόμενη ενέργεια που προτείνεις είναι η δημιουργία του πλάνου λύσης.

**ΣΗΜΑΝΤΙΚΟ:** 
Δεν υπάρχουν άκαμπτοι κανόνες. Βασίσου στην κριτική σου σκέψη. Αν ένας έμπειρος πελάτης ξέρει ακριβώς τι θέλει, εξυπηρέτησέ τον άμεσα. Αν ένας αρχάριος μπερδεύεται, καθοδήγησέ τον βήμα-βήμα.
"""


def _extract_text_from_event(event: Event) -> str:
    """Safely extract all text from an ADK response event's content parts."""
    try:
        if event.content and event.content.parts:
            return "".join(
                part.text for part in event.content.parts
                if hasattr(part, "text") and part.text
            )
    except Exception:
        pass
    return ""


class ExpertV3Agent:
    """
    ADK-powered paint expert agent.
    The Runner manages the entire tool→LLM→tool cycle internally.
    This class seeds per-turn sessions from Firestore history and
    emits rich structured logs to system_logs for the admin console.
    """

    def __init__(self):
        model_name = LLMConfig.get_model_name(complex=True)
        logger.info("ExpertV3 Agent (ADK) initializing", model=model_name)

        # To use Vertex AI instead of the Gemini API (which requires an API key),
        # we provide the ADK Gemini model instance with our pre-configured Vertex AI client.
        vertex_client = LLMConfig.get_client()
        adk_model = Gemini(model=model_name)
        # Duck-typing the api_client override to use our existing infrastructure
        adk_model.api_client = vertex_client

        self._agent = Agent(
            name="pavlicevits_expert",
            model=adk_model,
            description="Expert surface treatment advisor for the Pavlicevits paint shop.",
            instruction=SYSTEM_PROMPT,
            tools=[search_products],
        )
        self._session_service = InMemorySessionService()
        self._runner = Runner(
            agent=self._agent,
            session_service=self._session_service,
            app_name=APP_NAME,
        )
        logger.info("ExpertV3 Agent (ADK) ready", model=model_name)

    def process_chat(
        self,
        user_message: str,
        history: Optional[List[Dict[str, str]]] = None,
        doc_ref: Any = None,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        session_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process one user turn (sync entry point).
        Bridges the sync Cloud Functions trigger into the async ADK runtime.
        """
        if history is None:
            history = []

        effective_session_id = session_id or "default_session"
        effective_user_id = user_id or "default_user"

        # ── SESSION START LOG ─────────────────────────────────────────────────
        logger.info(
            "ExpertV3 Session Started",
            session_id=effective_session_id,
            user_id=effective_user_id,
            history_turns=len(history),
            user_message=user_message[:120],
        )

        try:
            return asyncio.run(self._run_adk_turn(
                user_message=user_message,
                history=history,
                doc_ref=doc_ref,
                effective_session_id=effective_session_id,
                effective_user_id=effective_user_id,
                session_data=session_data,
            ))

        except Exception as e:
            logger.error(
                "ExpertV3 Critical Failure",
                exc_info=True,
                session_id=effective_session_id,
                user_message=user_message[:120],
            )
            return {
                "status": "error",
                "answer": "Παρουσιάστηκε σφάλμα συστήματος κατά την επεξεργασία του αιτήματός σας."
            }

    async def _run_adk_turn(
        self,
        user_message: str,
        history: List[Dict[str, str]],
        doc_ref: Any,
        effective_session_id: str,
        effective_user_id: str,
        session_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Async inner method — runs the ADK agent loop with proper awaits."""
        import uuid

        # Each trigger invocation gets its own in-memory ADK session.
        # Firestore messages[] is the durable store; we re-seed from it every turn.
        turn_session_id = f"{effective_session_id}_{uuid.uuid4().hex[:8]}"

        # ✅ FIX #1: await the async create_session()
        session = await self._session_service.create_session(
            app_name=APP_NAME,
            user_id=effective_user_id,
            session_id=turn_session_id,
        )

        # Seed prior conversation turns into the ADK session
        if history:
            for msg in history:
                role = msg.get("role", "user")
                content_text = msg.get("content", "")
                if not content_text:
                    continue
                adk_role = "user" if role == "user" else "model"
                content = genai_types.Content(
                    role=adk_role,
                    parts=[genai_types.Part.from_text(text=content_text)]
                )
                evt = Event(
                    invocation_id=f"history_{uuid.uuid4().hex[:8]}",
                    author=adk_role,
                    content=content,
                )
                # ✅ FIX #3: await the async append_event()
                await self._session_service.append_event(session, evt)

        logger.info(
            "ExpertV3 Session Seeded",
            session_id=effective_session_id,
            turns_loaded=len(history),
            adk_session=turn_session_id,
        )

        # Inject previously found products if they exist
        new_text = user_message
        if session_data:
            accumulated = session_data.get("accumulatedProducts", {})
            if accumulated:
                import json
                products_list = list(accumulated.values())
                new_text += f"\n\n[SYSTEM CONTEXT — PRODUCTS ALREADY FOUND THIS SESSION (treat as reference, not final answer):\n{json.dumps(products_list, ensure_ascii=False)}\n\nCRITICAL: Check whether ALL required sequence steps for this project are covered above (e.g. Proetoimasia, Astari, Vasiko Xroma, Verniki as applicable). If ANY required step is missing, call search_products IMMEDIATELY — do NOT describe what you will search, do NOT ask for permission, just call the tool now.]"

        # 🚨 ANTI-HALLUCINATION: Enforce Language
        new_text += "\n\n[CRITICAL SYSTEM INSTRUCTION: ΠΡΕΠΕΙ ΝΑ ΑΠΑΝΤΗΣΕΙΣ ΣΤΑΣ ΕΛΛΗΝΙΚΑ (ή στη γλώσσα του χρήστη). ΑΠΑΓΟΡΕΥΕΤΑΙ να απαντήσεις στα Αγγλικά, ακόμα και αν τα εργαλεία επέστρεψαν αγγλικό κείμενο.]"

        # Build the new user message
        new_content = genai_types.Content(
            role="user",
            parts=[genai_types.Part.from_text(text=new_text)]
        )

        if doc_ref:
            try:
                doc_ref.update({"agentStatus": "Επεξεργασία..."})
            except Exception:
                pass

        # ── ADK RUNNER LOOP ───────────────────────────────────────────────
        result = {"status": "chat", "answer": ""}
        solution_result = None
        tool_calls_made: List[str] = []
        turn_count = 0

        logger.info("ExpertV3 ADK: Entering run loop", adk_session=turn_session_id)

        # ✅ FIX #2: use async run_async() instead of sync run()
        async for event in self._runner.run_async(
            user_id=effective_user_id,
            session_id=turn_session_id,
            new_message=new_content,
        ):

            turn_count += 1

            # ── TOOL CALL EVENTS ──────────────────────────────────────────
            fn_calls = event.get_function_calls() or []
            for fn_call in fn_calls:
                tool_name = fn_call.name
                tool_args = fn_call.args or {}
                tool_calls_made.append(tool_name)

                logger.info(
                    f"ExpertV3 Tool Call: {tool_name}",
                    session_id=effective_session_id,
                    tool=tool_name,
                    args=str(tool_args)[:300],
                )

                if doc_ref and tool_name == "search_products":
                    try:
                        search_term = tool_args.get("query") or tool_args.get("category") or "προϊόντα"
                        doc_ref.update({"agentStatus": f"Αναζήτηση για {search_term}..."})
                    except Exception:
                        pass

            # ── TOOL RESPONSE EVENTS ──────────────────────────────────────
            fn_responses = event.get_function_responses() or []
            for fn_response in fn_responses:
                raw = fn_response.response or {}
                payload = raw.get("result") or raw

                if fn_response.name == "search_products":
                    results = payload if isinstance(payload, list) else []

                    if doc_ref and results:
                        try:
                            # Update the accumulated products in the session document
                            doc = doc_ref.get().to_dict() or {}
                            accumulated = doc.get("accumulatedProducts", {})
                            
                            for r in results:
                                if isinstance(r, dict) and r.get("status") != "NO_RESULTS":
                                    vid = str(r.get("variant_id", ""))
                                    if vid and vid != "None":
                                        accumulated[vid] = {
                                            "title": r.get("title"),
                                            "handle": r.get("handle"),
                                            "variant_id": r.get("variant_id"),
                                            "available_variants": r.get("available_variants", []),
                                            "sequence_step": r.get("sequence_step", [])
                                        }
                            doc_ref.update({"accumulatedProducts": accumulated})
                        except Exception as e:
                            logger.error("Failed to save accumulatedProducts", exc_info=e)

                    no_results = any(
                        isinstance(r, dict) and r.get("status") == "NO_RESULTS"
                        for r in results
                    )
                    if no_results:
                        logger.warning(
                            "ExpertV3 Tool: search_products → NO_RESULTS",
                            session_id=effective_session_id,
                            tool="search_products",
                        )
                    else:
                        logger.info(
                            f"ExpertV3 Tool: search_products → {len(results)} result(s)",
                            session_id=effective_session_id,
                            tool="search_products",
                            result_count=len(results),
                            product_titles=str([r.get("title") for r in results[:5]])[:200],
                        )

            # ── FINAL RESPONSE EVENT ──────────────────────────────────────
            if event.is_final_response():
                text = _extract_text_from_event(event)

                if solution_result:
                    logger.info(
                        "ExpertV3 Final Response — SOLUTION",
                        session_id=effective_session_id,
                        adk_turns=turn_count,
                        tool_calls=tool_calls_made,
                    )
                elif text:
                    result = {"status": "chat", "answer": text}

                    logger.info(
                        "ExpertV3 Final Response — CHAT",
                        session_id=effective_session_id,
                        adk_turns=turn_count,
                        tool_calls=tool_calls_made,
                        answer_preview=text[:120],
                        ready_for_solution=result.get("ready_for_solution", False)
                    )
                else:
                    logger.warning(
                        "ExpertV3 Final Response — EMPTY (fallback triggered)",
                        session_id=effective_session_id,
                        adk_turns=turn_count,
                        tool_calls=tool_calls_made,
                        event_author=event.author,
                    )

        # ── RETURN ────────────────────────────────────────────────────────
        if solution_result:
            return solution_result

        if not result.get("answer"):
            result["answer"] = (
                "Συγγνώμη, δεν μπόρεσα να επεξεργαστώ το αίτημά σας αυτή τη στιγμή. "
                "Παρακαλώ δοκιμάστε ξανά με διαφορετική διατύπωση."
            )
            logger.warning(
                "ExpertV3: Using fallback answer — ADK loop produced no output",
                session_id=effective_session_id,
                tool_calls_made=tool_calls_made,
            )

        return result
