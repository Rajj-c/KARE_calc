
import sys
import os

try:
    import pypdf
except ImportError:
    print("pypdf not installed. Attempting to install...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

def extract_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        # Limit to first 20 pages as regulations are usually at the beginning, 
        # scanning entire book might be too much text for context window
        count = 0
        for page in reader.pages:
            text += page.extract_text() + "\n"
            count += 1
            if count > 20: break 
        return text
    except Exception as e:
        return str(e)

files = [
    "/Users/raj/CGPA calc/CGPA-SGPA-calculator/B.Tech-Regulation-2018-2.pdf",
    "/Users/raj/CGPA calc/CGPA-SGPA-calculator/R2025.pdf"
]

for f in files:
    print(f"--- START OF {os.path.basename(f)} ---")
    print(extract_text(f))
    print(f"--- END OF {os.path.basename(f)} ---")
