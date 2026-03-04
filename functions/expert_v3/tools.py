import json as _json
from typing import List, Dict, Any, Optional
from shopify.client import ShopifyClient
from core.logger import get_logger

logger = get_logger("expert_v3.tools")


def _parse_list_metafield(raw: str) -> list:
    """
    Shopify stores list metafields (surfaces, application_method, special_properties)
    as JSON-encoded strings like '["Σπρέι","Πινέλο"]'.
    Returns a proper Python list, gracefully handles None or plain strings.
    """
    if not raw:
        return []
    try:
        return _json.loads(raw)
    except Exception:
        return [raw]


def _norm_to_list(val) -> list:
    if isinstance(val, list):
        return [str(v) for v in val if v]
    elif val:
        return [str(val)]
    return []



def build_search_query(kwargs: dict) -> str:
    """Helper to convert kwargs to a GraphQL query string, handling hallucinative lists."""
    parts = []

    def _as_list(val) -> list:
        if isinstance(val, list):
            return [str(v) for v in val if v]
        elif val:
            return [str(val)]
        return []

    categories = _as_list(kwargs.get("category"))
    if categories:
        cat_parts = [f"(tag:'{c}' OR product_type:'{c}')" for c in categories]
        if len(cat_parts) > 1:
            parts.append("(" + " OR ".join(cat_parts) + ")")
        else:
            parts.append(cat_parts[0])

    variant_titles = _as_list(kwargs.get("variant_title"))
    if variant_titles:
        vt_parts = [f"variants.title:'{vt}'" for vt in variant_titles]
        if len(vt_parts) > 1:
            parts.append("(" + " OR ".join(vt_parts) + ")")
        else:
            parts.append(vt_parts[0])

    # Metafields — maps Python param name → Shopify metafield key
    metafield_map = {
        "chemical_base":      "chemical_base",
        "surface":            "surfaces",
        "finish":             "finish",
        "sequence_step":      "sequence_step",
        "application_method": "application_method",
    }

    for key, api_key in metafield_map.items():
        vals = _as_list(kwargs.get(key))
        if vals:
            m_parts = [f"metafield.pavlicevits.{api_key}:'{v}'" for v in vals]
            if len(m_parts) > 1:
                parts.append("(" + " OR ".join(m_parts) + ")")
            else:
                parts.append(m_parts[0])

    return " AND ".join(parts) if parts else ""


def search_products(
    category: Optional[str] = None,
    chemical_base: Optional[str] = None,
    surface: Optional[str] = None,
    finish: Optional[str] = None,
    sequence_step: Optional[str] = None,
    application_method: Optional[str] = None,
    special_properties: Optional[str] = None,
    environment: Optional[str] = None,
    brand: Optional[str] = None,
    voc_level: Optional[str] = None,
    pot_life: Optional[str] = None,
    mixing_ratio: Optional[str] = None,
    dry_film_thickness: Optional[str] = None,
    weight_per_volume: Optional[str] = None,
    drying_time: Optional[str] = None,
    full_cure: Optional[str] = None,
    recoat_window: Optional[str] = None,
    drying_time_touch: Optional[str] = None,
    coverage: Optional[str] = None,
    variant_title: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Search the Shopify store for products using technical attributes.
    
    Use this tool to explore available options gracefully. If a search yields NO_RESULTS,
    do not get stuck; adjust your strategy (e.g., make the search broader) or provide
    alternative advice.

    Args:
        category: Product category — "Προετοιμασία & Καθαρισμός", "Αστάρια & Υποστρώματα",
                  "Χρώματα Βάσης", "Βερνίκια & Φινιρίσματα", "Σκληρυντές & Ενεργοποιητές",
                  "Στόκοι & Πλαστελίνες", "Πινέλα & Εργαλεία", "Διαλυτικά & Αραιωτικά", "Αξεσουάρ"
        chemical_base: "Ακρυλικό", "Σμάλτο", "Λάκα", "Ουρεθάνη", "Εποξικό", "Νερού", "Διαλύτου"
        surface: "Γυμνό Μέταλλο", "Πλαστικό", "Ξύλο", "Fiberglass", "Υπάρχον Χρώμα", "Σκουριά", "Αλουμίνιο", "Γαλβανιζέ"
        finish: "Ματ", "Σατινέ", "Γυαλιστερό", "Υψηλής Γυαλάδας", "Σαγρέ/Ανάγλυφο", "Μεταλλικό", "Πέρλα"
        sequence_step: "Προετοιμασία/Καθαριστικό", "Αστάρι", "Ενισχυτικό Πρόσφυσης", "Βασικό Χρώμα", "Βερνίκι", "Γυαλιστικό"
        application_method: "Σπρέι", "Πιστόλι Βαφής", "Πινέλο", "Ρολό"
        special_properties: e.g., "Αντισκωριακό", "Ταχυστέγνωτο", "Αντοχή σε UV", κτλ.
        environment: "Εξωτερικού", "Εσωτερικού", "Εσωτερικού & Εξωτερικού"
        brand: The brand name explicitly.
        voc_level: VOC classification.
        pot_life: "Χρόνος Ζωής Μίγματος / Pot Life"
        mixing_ratio: "Αναλογία Ανάμιξης / Mixing Ratio"
        dry_film_thickness: "Πάχος Στεγνού Φιλμ / Dry Film Thickness"
        weight_per_volume: "Ειδικό Βάρος / Weight per Volume"
        drying_time: "Χρόνος Στεγνώματος / Drying Time"
        full_cure: "Πλήρης Σκλήρυνση / Full Cure"
        recoat_window: "Επαναβαφή / Recoat Window"
        drying_time_touch: "Στέγνωμα στην Αφή / Touch Dry"
        coverage: "Κάλυψη / Coverage"
        variant_title: Optional keyword(s) for deep-selecting a specific color, shade, volume, or size (e.g. 'Μαύρο', 'Ματ', '400ml', 'RAL')
    """
    client = ShopifyClient()
    search_query = build_search_query({
        "category":           category,
        "chemical_base":      chemical_base,
        "surface":            surface,
        "finish":             finish,
        "sequence_step":      sequence_step,
        "application_method": application_method,
        "special_properties": special_properties,
        "environment":        environment,
        "brand":              brand,
        "voc_level":          voc_level,
        "pot_life":           pot_life,
        "mixing_ratio":       mixing_ratio,
        "dry_film_thickness": dry_film_thickness,
        "weight_per_volume":  weight_per_volume,
        "drying_time":        drying_time,
        "full_cure":          full_cure,
        "recoat_window":      recoat_window,
        "drying_time_touch":  drying_time_touch,
        "coverage":           coverage,
        "variant_title":      variant_title
    })

    logger.info(
        "ExpertV3 Tool: search_products executing",
        search_query=search_query,
        filters={
            "category":           category,
            "chemical_base":      chemical_base,
            "surface":            surface,
            "finish":             finish,
            "sequence_step":      sequence_step,
            "application_method": application_method,
            "variant_title":      variant_title
        }
    )

    try:
        results = client.search_products_by_query(search_query, limit=50)

        # We pass Shopify's GraphQL results directly to the LLM.
        # Python-side strict filtering has been REMOVED entirely 
        # to ensure we don't drop viable options mistakenly and let 
        # the LLM analyze raw product data and variant matching.
        simplified = []
        for p in results:
            m = p["metafields"]

            # Standardized payload for the LLM
            simplified.append({
                # --- Identity ---
                "title":              p["title"],
                "handle":             p["handle"],
                "brand":              m.get("brand"),
                "price":              p["variants"][0]["price"] if p["variants"] else "0",
                "variant_id":         p["variants"][0]["id"] if p["variants"] else None,
                "available_variants": [{"id": v["id"], "title": v.get("title", ""), "price": v.get("price", "0")} for v in p.get("variants", [])],

                # --- Technical Classification ---
                "chemical_base":      _parse_list_metafield(m.get("chemical_base", "")),
                "sequence_step":      _parse_list_metafield(m.get("sequence_step", "")),
                "finish":             _parse_list_metafield(m.get("finish", "")),
                "surfaces":           _parse_list_metafield(m.get("surfaces", "[]")),
                "application_method": _parse_list_metafield(m.get("application_method", "[]")),
                "special_properties": _parse_list_metafield(m.get("special_properties", "[]")),
                "environment":        _parse_list_metafield(m.get("environment", "")),   # Indoor / Outdoor / Both

                # --- Practical Workflow (drying & scheduling) ---
                "drying_time_touch":  m.get("drying_time_touch"),  # e.g. "10-15 min"
                "recoat_window":      m.get("recoat_window"),       # e.g. "30 min–24h"
                "drying_time":        m.get("drying_time"),
                "full_cure":          m.get("full_cure"),           # e.g. "7 days"

                # --- 2K / Multi-component (CRITICAL) ---
                "mixing_ratio":       m.get("mixing_ratio"),        # e.g. "4:1 vol" → needs hardener
                "pot_life":           m.get("pot_life"),            # e.g. "4 hours" → work window

                # --- Quantity Planning ---
                "coverage":           m.get("coverage"),            # e.g. "10-12 m²/L"

                # --- Advanced Technical ---
                "voc_level":          m.get("voc_level"),
                "dry_film_thickness": m.get("dry_film_thickness"),
                "weight_per_volume":  m.get("weight_per_volume"),
                "spray_nozzle_type":  m.get("spray_nozzle_type"),
            })

        logger.info("ExpertV3 Tool: successfully retrieved matching products", count=len(simplified))

        # Fix C: Enrich zero-result response with actionable guidance instead of silent []
        if not simplified:
            # Base instruction for no results
            base_instruction = (
                "Zero products found for this exact query. "
                "Do NOT chat or apologize. Take one of these actions immediately: "
                "1) Drop any text in the 'variant_title' parameter. "
                "2) Drop the most specific filter (chemical_base or finish) and retry. "
                "3) If this is an OPTIONAL item (tool, accessory), note its unavailability "
                "in the 'tips' array of finalize_solution and move on. "
                "CRITICAL: YOUR NEXT RESPONSE MUST BE IN THE USER'S NATIVE LANGUAGE (e.g., Greek)."
            )

            # Custom color fallback: ONLY for Χρώματα Βάσης when a specific color was searched
            if category and "Χρώματα Βάσης" in category and variant_title:
                base_instruction += (
                    " IMPORTANT: Since this was a Χρώματα Βάσης search with a specific color/variant, "
                    "the color might not exist as a ready-made variant. BEFORE giving up, "
                    "search again with category='Χρώματα Βάσης' WITHOUT variant_title to find our "
                    "custom paint products (handles: custom-spray-paint, custom-bucket-paint, custom-touchup-kit). "
                    "These can be mixed to ANY color the customer wants. "
                    "NOTE: This custom color option is EXCLUSIVELY for base paints. "
                    "Do NOT offer custom coloring for primers, varnishes, or other categories."
                )

            return [{
                "status":      "NO_RESULTS",
                "category":    category or "unknown",
                "instruction": base_instruction
            }]

        # Dual-pass enrichment: if variant_title was used (usually a color/shade),
        # also fetch broader results (without variant_title) so the LLM can see
        # what's available regardless of color. Color-specific results are tagged
        # so the agent knows to confirm the color with the customer first.
        if variant_title:
            broad_query = build_search_query({
                "category":           category,
                "chemical_base":      chemical_base,
                "surface":            surface,
                "finish":             finish,
                "sequence_step":      sequence_step,
                "application_method": application_method,
                "special_properties": special_properties,
                "environment":        environment,
                "brand":              brand,
            })
            try:
                broad_results = client.search_products_by_query(broad_query, limit=20) if broad_query else []
                for p in broad_results:
                    m = p["metafields"]
                    handle = p["handle"]
                    # Don't duplicate products already in color-specific results
                    if any(s["handle"] == handle for s in simplified):
                        continue
                    simplified.append({
                        "title":              p["title"],
                        "handle":             handle,
                        "brand":              m.get("brand"),
                        "price":              p["variants"][0]["price"] if p["variants"] else "0",
                        "variant_id":         p["variants"][0]["id"] if p["variants"] else None,
                        "available_variants": [{"id": v["id"], "title": v.get("title", ""), "price": v.get("price", "0")} for v in p.get("variants", [])],
                        "chemical_base":      _parse_list_metafield(m.get("chemical_base", "")),
                        "sequence_step":      _parse_list_metafield(m.get("sequence_step", "")),
                        "finish":             _parse_list_metafield(m.get("finish", "")),
                        "surfaces":           _parse_list_metafield(m.get("surfaces", "[]")),
                        "application_method": _parse_list_metafield(m.get("application_method", "[]")),
                        "special_properties": _parse_list_metafield(m.get("special_properties", "[]")),
                        "environment":        _parse_list_metafield(m.get("environment", "")),
                        "drying_time_touch":  m.get("drying_time_touch"),
                        "recoat_window":      m.get("recoat_window"),
                        "drying_time":        m.get("drying_time"),
                        "full_cure":          m.get("full_cure"),
                        "mixing_ratio":       m.get("mixing_ratio"),
                        "pot_life":           m.get("pot_life"),
                        "coverage":           m.get("coverage"),
                        "voc_level":          m.get("voc_level"),
                        "dry_film_thickness": m.get("dry_film_thickness"),
                        "weight_per_volume":  m.get("weight_per_volume"),
                        "spray_nozzle_type":  m.get("spray_nozzle_type"),
                        "color_not_yet_confirmed": True,
                        "note": "Color/shade not yet confirmed by customer — present this product and ask customer to specify their color/shade before recommending.",
                    })
            except Exception:
                pass  # Broad search failure is non-critical

        return simplified

    except Exception as e:
        logger.error("search_products tool failed", exc_info=True)
        return [{
            "status":      "ERROR",
            "message":     str(e),
            "instruction": "A system error occurred during search. Retry with simpler/broader parameters. CRITICAL: YOUR NEXT RESPONSE MUST BE IN THE USER'S NATIVE LANGUAGE (e.g., Greek)."
        }]


