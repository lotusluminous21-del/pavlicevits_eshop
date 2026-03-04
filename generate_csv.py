import csv

headers = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy", "Variant Fulfillment Service",
    "Variant Price", "Variant Requires Shipping", "Variant Taxable", "Status",
    "product.metafields.pavlicevits.short_description",
    "product.metafields.pavlicevits.brand",
    "product.metafields.pavlicevits.category",
    "product.metafields.pavlicevits.chemical_base",
    "product.metafields.pavlicevits.finish",
    "product.metafields.pavlicevits.sequence_step",
    "product.metafields.pavlicevits.environment",
    "product.metafields.pavlicevits.surfaces",
    "product.metafields.pavlicevits.special_properties",
    "product.metafields.pavlicevits.application_method"
]

rows = []

# Product 1: Custom Spray Paint
handle = "custom-spray-paint"
title = "Εξατομικευμένο Σπρέι Χρώματος (Custom Spray)"
body = "<p>Επαγγελματικό σπρέι χρώματος με ακριβή μίξη βάσει του κωδικού χρώματος (RAL, NCS, Pantone) ή κατασκευαστή οχήματος που επιθυμείτε. Ανθεκτικό, με τέλεια κάλυψη.</p><ul><li>Επιλέξτε το ιδανικό φινίρισμα (Ματ, Σατινέ, Γυαλιστερό).</li><li>Η έκδοση 2K (Πολυουρεθάνης) παρέχει μέγιστη αντοχή σε γρατζουνιές και χημικά.</li><li><strong>Προσοχή:</strong> Εισάγετε τον Κωδικό Χρώματος πριν την Προσθήκη στο Καλάθι.</li></ul>"
vendor = "Pavlicevits Lab"
category = "Hardware > Building Materials > Painting Consumables > Paint"
type_ = "Σπρέι Βαφής"
tags = "custom paint, spray paint, χρώμα σπρέι, εξατομικευμένο χρώμα, αυτοκίνητο"

sizes = [{"val": "400ml", "grams": 450}, {"val": "200ml", "grams": 250}]
finishes = [
    {"val": "Ματ (Ακρυλικό)", "price": 12.00, "base": "Ακρυλικό"},
    {"val": "Σατινέ (Ακρυλικό)", "price": 12.00, "base": "Ακρυλικό"},
    {"val": "Γυαλιστερό (Ακρυλικό)", "price": 12.00, "base": "Ακρυλικό"},
    {"val": "2K Γυαλιστερό (Πολυουρεθάνης)", "price": 18.00, "base": "Ουρεθάνη"}
]

for idx_s, s in enumerate(sizes):
    for idx_f, f in enumerate(finishes):
        is_first = (idx_s == 0 and idx_f == 0)
        row = {
            "Handle": handle,
            "Title": title if is_first else "",
            "Body (HTML)": body if is_first else "",
            "Vendor": vendor if is_first else "",
            "Product Category": category if is_first else "",
            "Type": type_ if is_first else "",
            "Tags": tags if is_first else "",
            "Published": "TRUE" if is_first else "",
            "Option1 Name": "Μέγεθος",
            "Option1 Value": s["val"],
            "Option2 Name": "Φινίρισμα & Βάση",
            "Option2 Value": f["val"],
            "Option3 Name": "",
            "Option3 Value": "",
            "Variant SKU": f"CUST-SPRAY-{s['val']}-{idx_f}",
            "Variant Grams": s["grams"],
            "Variant Inventory Tracker": "",
            "Variant Inventory Qty": "",
            "Variant Inventory Policy": "continue",
            "Variant Fulfillment Service": "manual",
            "Variant Price": f['price'],
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Status": "active" if is_first else "",
            "product.metafields.pavlicevits.short_description": "Εξατομικευμένο σπρέι βαφής. Ακριβής μίξη σε όποιο κωδικό χρώματος επιθυμείτε." if is_first else "",
            "product.metafields.pavlicevits.brand": "Pavlicevits Custom" if is_first else "",
            "product.metafields.pavlicevits.category": "Χρώματα Βάσης" if is_first else "",
            "product.metafields.pavlicevits.chemical_base": "" if is_first else "",
            "product.metafields.pavlicevits.finish": "" if is_first else "",
            "product.metafields.pavlicevits.sequence_step": "Βασικό Χρώμα" if is_first else "",
            "product.metafields.pavlicevits.environment": "Και τα δύο" if is_first else "",
            "product.metafields.pavlicevits.surfaces": '["Γυμνό Μέταλλο","Πλαστικό","Ξύλο","Υπάρχον Χρώμα"]' if is_first else "",
            "product.metafields.pavlicevits.special_properties": '["Ανθεκτικό σε UV"]' if is_first else "",
            "product.metafields.pavlicevits.application_method": '["Σπρέι"]' if is_first else ""
        }
        rows.append(row)

# Product 2: Custom Bucket Paint
handle = "custom-bucket-paint"
title = "Εξατομικευμένο Χρώμα σε Δοχείο"
body = "<p>Επαγγελματικό χρώμα σε δοχείο. Κορυφαίας ποιότητας και αντοχής, αναμιγνύεται σύμφωνα με τις προδιαγραφές σας (RAL, NCS, κ.α.).</p>"
type_ = "Χρώμα Δοχείου"
tags = "custom paint, bucket paint, οικολογικό, βιομηχανικό"

sizes = [{"val": "1L", "grams": 1200}, {"val": "2.5L", "grams": 3000}, {"val": "5L", "grams": 6000}, {"val": "10L", "grams": 12000}]
finishes = ["Ματ", "Σατινέ", "Γυαλιστερό", "Σαγρέ/Ανάγλυφο"]
bases = [{"val": "Νερού", "added_price": 0.0}, {"val": "Διαλύτου", "added_price": 2.0}]

base_prices = {"1L": 15.0, "2.5L": 35.0, "5L": 65.0, "10L": 120.0}

for idx_s, s in enumerate(sizes):
    for idx_f, f in enumerate(finishes):
        for idx_b, b in enumerate(bases):
            is_first = (idx_s == 0 and idx_f == 0 and idx_b == 0)
            price = base_prices[s["val"]] + (b["added_price"] * (float(s["val"].replace("L",""))))
            row = {
                "Handle": handle,
                "Title": title if is_first else "",
                "Body (HTML)": body if is_first else "",
                "Vendor": vendor if is_first else "",
                "Product Category": category if is_first else "",
                "Type": type_ if is_first else "",
                "Tags": tags if is_first else "",
                "Published": "TRUE" if is_first else "",
                "Option1 Name": "Συσκευασία",
                "Option1 Value": s["val"],
                "Option2 Name": "Φινίρισμα",
                "Option2 Value": f,
                "Option3 Name": "Τύπος Βάσης",
                "Option3 Value": b["val"],
                "Variant SKU": f"CUST-BUCKET-{s['val']}-{idx_f}-{idx_b}",
                "Variant Grams": s["grams"],
                "Variant Inventory Tracker": "",
                "Variant Inventory Qty": "",
                "Variant Inventory Policy": "continue",
                "Variant Fulfillment Service": "manual",
                "Variant Price": price,
                "Variant Requires Shipping": "TRUE",
                "Variant Taxable": "TRUE",
                "Status": "active" if is_first else "",
                "product.metafields.pavlicevits.short_description": "Βάση χρώματος σε δοχείο για κάθε επαγγελματική ή οικιακή εφαρμογή." if is_first else "",
                "product.metafields.pavlicevits.brand": "Pavlicevits Custom" if is_first else "",
                "product.metafields.pavlicevits.category": "Χρώματα Βάσης" if is_first else "",
                "product.metafields.pavlicevits.chemical_base": "" if is_first else "",
                "product.metafields.pavlicevits.finish": "" if is_first else "",
                "product.metafields.pavlicevits.sequence_step": "Βασικό Χρώμα" if is_first else "",
                "product.metafields.pavlicevits.environment": "Και τα δύο" if is_first else "",
                "product.metafields.pavlicevits.surfaces": '["Ξύλο","Μέταλλο","Υπάρχον Χρώμα"]' if is_first else "",
                "product.metafields.pavlicevits.special_properties": '[]' if is_first else "",
                "product.metafields.pavlicevits.application_method": '["Πινέλο","Ρολό","Πιστόλι Βαφής"]' if is_first else ""
            }
            rows.append(row)

# Product 3: Custom Touch-up Kit
handle = "custom-touchup-kit"
title = "Κιτ Επιδιόρθωσης Οχημάτων & Επιφανειών (Touch-up)"
body = "<p>Ιδανικό για επισκευή γρατζουνιών και μικροφθορών αυτοκινήτου. Ακριβής ταυτοποίηση με κωδικό χρώματος (ΟΕΜ).</p>"
type_ = "Κιτ Επιδιόρθωσης"
tags = "touch up, scratch repair, αυτοκίνητο, χρώμα, πινελάκι"

types = [{"val": "Στυλό Ακριβείας (12ml)", "grams": 50, "price": 9.90}, {"val": "Πινέλο Μπουκαλάκι (30ml)", "grams": 100, "price": 14.90}]
finishes = [{"val": "Απλό Χρώμα (Γυαλιστερό)", "added_price": 0}, {"val": "Μεταλλικό / Πέρλα (Απαιτεί Βερνίκι)", "added_price": 3.0}]

for idx_t, t in enumerate(types):
    for idx_f, f in enumerate(finishes):
        is_first = (idx_t == 0 and idx_f == 0)
        row = {
            "Handle": handle,
            "Title": title if is_first else "",
            "Body (HTML)": body if is_first else "",
            "Vendor": vendor if is_first else "",
            "Product Category": category if is_first else "",
            "Type": type_ if is_first else "",
            "Tags": tags if is_first else "",
            "Published": "TRUE" if is_first else "",
            "Option1 Name": "Τύπος",
            "Option1 Value": t["val"],
            "Option2 Name": "Φινίρισμα",
            "Option2 Value": f["val"],
            "Option3 Name": "",
            "Option3 Value": "",
            "Variant SKU": f"CUST-TOUCHUP-{idx_t}-{idx_f}",
            "Variant Grams": t["grams"],
            "Variant Inventory Tracker": "",
            "Variant Inventory Qty": "",
            "Variant Inventory Policy": "continue",
            "Variant Fulfillment Service": "manual",
            "Variant Price": t["price"] + f["added_price"],
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Status": "active" if is_first else "",
            "product.metafields.pavlicevits.short_description": "Επαγγελματικό κιτ τοπικής επιδιόρθωσης. Καλύπτει αμέσως γρατζουνιές." if is_first else "",
            "product.metafields.pavlicevits.brand": "Pavlicevits Custom" if is_first else "",
            "product.metafields.pavlicevits.category": "Χρώματα Βάσης" if is_first else "",
            "product.metafields.pavlicevits.chemical_base": "Ακρυλικό" if is_first else "",
            "product.metafields.pavlicevits.finish": "Γυαλιστερό" if is_first else "",
            "product.metafields.pavlicevits.sequence_step": "Βασικό Χρώμα" if is_first else "",
            "product.metafields.pavlicevits.environment": "Εξωτερικός Χώρος" if is_first else "",
            "product.metafields.pavlicevits.surfaces": '["Γυμνό Μέταλλο","Πλαστικό","Υπάρχον Χρώμα"]' if is_first else "",
            "product.metafields.pavlicevits.special_properties": '["Ανθεκτικό σε UV","1 Συστατικού"]' if is_first else "",
            "product.metafields.pavlicevits.application_method": '["Πινέλο","Άλλο"]' if is_first else ""
        }
        rows.append(row)

with open('C:/Users/lotus/Documents/pavlicevits/shopify_custom_paint_products_import.csv', 'w', newline='', encoding='utf-8-sig') as f_out:
    writer = csv.DictWriter(f_out, fieldnames=headers)
    writer.writeheader()
    writer.writerows(rows)

print("CSV generated successfully!")
