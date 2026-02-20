
import sys
import os
import pypdf

def extract_pages(pdf_path, start_page, end_page):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for i in range(start_page, min(end_page, len(reader.pages))):
            text += f"--- Page {i+1} ---\n{reader.pages[i].extract_text()}\n"
        return text
    except Exception as e:
        return str(e)

file_path = "/Users/raj/CGPA calc/CGPA-SGPA-calculator/B.Tech-Regulation-2018-2.pdf"
print(extract_pages(file_path, 25, 40)) # Extract pages 26-41 (0-indexed 25-40)
