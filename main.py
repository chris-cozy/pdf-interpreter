# to activate the environment: venv\Scripts\Activate
# to deactive the environment: deactivate

import PyPDF2
import re
import pandas as pd

def extract_text_from_pdf(pdf_path):
    text = ''
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
    return text

def normalize_text(text):
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    # Convert to lowercase
    text = text.lower()
    return text

def extract_lod_values(text, distance=20):
    # Find all instances of "lod" and extract associated numeric value and units
    matches = re.finditer(r'\b(lod)\b', text, re.IGNORECASE)
    lod_data = []
    
    # Find DOI
    doi_match = re.search(r'\b(10\.\d+\/[^\s]+)\b', text)

    if doi_match:
        doi = doi_match.group()
    else:
        doi = 'NaN'

    for match in matches:
        start, end = match.start(), match.end()
        subtext = text[end:end + distance]  # Adjust window size as needed
        numeric_match = re.search(r'\b\d+(\.\d+)?\b', subtext)
        if numeric_match:
            value = float(numeric_match.group())
            units_match = re.search(r'\b(mg/dl|mm)\b', subtext, re.IGNORECASE)
            units = units_match.group() if units_match else 'NaN'
            lod_data.append({'DOI': doi, 'Value': value, 'Units': units})
        else:
            lod_data.append({'DOI': doi, 'Value': 'NaN', 'Units': 'NaN'})

    return pd.DataFrame(lod_data)


def analyze_pdf(pdf_path):
    # Extract text from PDF
    extracted_text = extract_text_from_pdf(pdf_path)

    # Normalize extracted text
    normalized_text = normalize_text(extracted_text)
        
    # Extract and display LOD values
    lod_table = extract_lod_values(normalized_text)
    return lod_table

def analyze_multiple_pdfs(pdf_paths):
    combined_table = pd.DataFrame(columns=['DOI', 'Value', 'Units'])

    for pdf_path in pdf_paths:
        pdf_table = analyze_pdf(pdf_path)
        combined_table = pd.concat([combined_table, pdf_table], ignore_index=True)

    return combined_table
    

# Path to your PDF files
pdf_paths = ['pdf_examples/Soni_et_al.pdf', 'pdf_examples/Vaquer_et_al.pdf']

# Process multiple PDFs and combine data into one table
combined_table = analyze_multiple_pdfs(pdf_paths)
print(combined_table)

