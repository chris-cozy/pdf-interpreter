# to activate the environment: venv\Scripts\Activate
# to deactive the environment: deactivate

import PyPDF2
import re

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

def extract_acronym(text, acronym):
    # Define a regular expression pattern to match the acronym
    pattern = r'\b{}\b'.format(acronym)
    # Find all matches in the text
    matches = re.findall(pattern, text)
    return matches

def extract_nearby_numeric_value(text, term, distance=7):
    # Find all matches of the term
    matches = re.finditer(r'\b{}\b'.format(term), text, re.IGNORECASE)
    numeric_values = []

    # For each match, find the nearest numeric value within the specified distance
    for match in matches:
        start, end = match.start(), match.end()
        subtext = text[max(0, start - distance):min(len(text), end + distance)]
        numeric_match = re.search(r'\b\d+(\.\d+)?\b', subtext)
        if numeric_match:
            numeric_values.append(float(numeric_match.group()))

    return numeric_values

# Path to your PDF file
pdf_path2 = 'pdf_examples/Soni_et_al.pdf'
pdf_path3 = 'pdf_examples/Vaquer_et_al.pdf'


# Extract text from PDF
extracted_text = extract_text_from_pdf(pdf_path2)

# Normalize extracted text
normalized_text = normalize_text(extracted_text)

print(normalized_text)

# Extract LODs from the normalized text
lods = extract_acronym(normalized_text, 'lod')

# Print extracted LODs
for lod in lods:
    print(lod.strip())
    
    
# Extract LODs from the normalized text
numbers = extract_nearby_numeric_value(normalized_text, 'lod')

# Print extracted LODs
for number in numbers:
    print(number)

