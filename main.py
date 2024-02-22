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

def extract_lods(text):
    # Define a regular expression pattern to match LODs - IN PROGRESS
    lod_pattern = r'[A-Z\s]+:'
    # Find all matches in the text
    lods = re.findall(lod_pattern, text)
    return lods

# Path to your PDF file
pdf_path1 = 'pdf_examples/Cho_and_Park.pdf'
pdf_path2 = 'pdf_examples/Soni_et_al.pdf'
pdf_path3 = 'pdf_examples/Vaquer_et_al.pdf'


# Extract text from PDF
extracted_text = extract_text_from_pdf(pdf_path1)

# Normalize extracted text
normalized_text = normalize_text(extracted_text)

print(normalized_text)

# Extract LODs from the normalized text
# lods = extract_lods(normalized_text)

# Print extracted LODs
# for lod in lods:
    # print(lod.strip())

