import json

with open('scratch_china_parsed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

lines = []
for sheet_name, rows in data.items():
    lines.append(f"\n================ SHEET: {sheet_name} ================")
    for r in rows:
        row_num = r["row"]
        vals = r["values"]
        forms = r["formulas"]
        non_none = [v for v in vals if v is not None]
        # Ignore empty template rows with just an ID
        if len(non_none) >= 2 or row_num <= 25:
            while vals and vals[-1] is None:
                vals.pop()
            lines.append(f"R{row_num}: {vals}")
            # If there are interesting formulas, show them
            form_dict = {f"C{idx+1}": f for idx, f in enumerate(forms) if f is not None and str(f).startswith('=')}
            if form_dict:
                lines.append(f"    Formulas: {form_dict}")

with open('scratch_china_dump.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("Dumped to scratch_china_dump.txt successfully!")
