
import sys
import os
import re

try:
    import pypdf
except ImportError:
    print("pypdf not installed.")
    sys.exit(1)

def extract_relevant_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        # Scan first 30 pages
        for i, page in enumerate(reader.pages):
            if i > 30: break
            content = page.extract_text()
            # Look for keywords
            if re.search(r"(SGPA|CGPA|Grade Point|Letter Grade|Formula)", content, re.IGNORECASE):
                text += f"--- Page {i+1} ---\n{content}\n"
        return text
    except Exception as e:
        return str(e)

files = [
    "/Users/raj/CGPA calc/CGPA-SGPA-calculator/B.Tech-Regulation-2018-2.pdf",
    "/Users/raj/CGPA calc/CGPA-SGPA-calculator/R2025.pdf"
]

for f in files:
    print(f"\n\n====== EXTRACT FROM {os.path.basename(f)} ======")
    extracted = extract_relevant_text(f)
    # Print only lines with relevant keywords plus context, or just the whole page if it's dense
    # For now, print full pages that matched, but maybe limit length
    print(extracted[:5000]) # Limit to 5000 chars per file to avoid truncation
    if len(extracted) > 5000: print("\n...[truncated]...")
