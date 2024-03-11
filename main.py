# to activate the environment: venv\Scripts\Activate
# to deactive the environment: deactivate

import PyPDF2
import re
import pandas as pd
import os

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
    
    text = text.lower()
    return text

def extract_lod_values(text, distance=20):
    doi_match = re.search(r'\b(10\.\d+\/[^\s]+)\b', text)

    if doi_match:
        doi = doi_match.group()
    else:
        doi = 'NaN'
        
    # Find all instances of "lod" and extract associated numeric value and units
    matches = re.finditer(r'\b(lod)\b', text, re.IGNORECASE)
    lod_data = []

    for match in matches:
        start, end = match.start(), match.end()
        subtext = text[end:end + distance]
        numeric_match = re.search(r'\b\d+(\.\d+)?\b', subtext)
        if numeric_match:
            value = float(numeric_match.group())
            # List of possible units (lower cased)
            units_match = re.search(r'\b(mg/dl|mm|μm|mg/l)\b', subtext, re.IGNORECASE)
            units = units_match.group() if units_match else 'NaN'
            lod_data.append({'DOI': doi, 'Value': value, 'Units': units})
        else:
            lod_data.append({'DOI': doi, 'Value': 'NaN', 'Units': 'NaN'})

    return pd.DataFrame(lod_data)

def analyze_pdf(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)

    normalized_text = normalize_text(extracted_text)
        
    lod_table = extract_lod_values(normalized_text)
    return lod_table

def analyze_multiple_pdfs(pdf_paths):
    combined_table = pd.DataFrame(columns=['DOI', 'Value', 'Units'])

    for pdf_path in pdf_paths:
        pdf_table = analyze_pdf(pdf_path)
        combined_table = pd.concat([combined_table, pdf_table], ignore_index=True)

    return combined_table
    
def generate_paths(directory_path):
    pdf_files = [f for f in os.listdir(directory_path) if f.endswith('.pdf')]
    pdf_paths = [os.path.join(directory_path, f) for f in pdf_files]
    return pdf_paths



subdirectory_path = './pdfs'
output_path = 'output_table.csv'
second_output_path = 'cleaned_output_table.csv'

# Path to your PDF files
pdf_paths = generate_paths(subdirectory_path)

# Process multiple PDFs and combine data into one table
combined_table = analyze_multiple_pdfs(pdf_paths)
combined_table.to_csv(output_path, index=False)

# Read the original CSV file
df = pd.read_csv(output_path)

# Drop rows with NaN values
cleaned_df = df.dropna()

# Count the duplicates for each DOI
cleaned_df['Count'] = cleaned_df.groupby(['DOI', 'Value', 'Units'])['DOI'].transform('count')

# Get the maximum count for each DOI
max_counts = cleaned_df.groupby(['DOI', 'Value', 'Units'])['Count'].max()

# Group the data by DOI and filter each group to keep rows with the maximum count value
cleaned_df = cleaned_df.groupby('DOI').apply(lambda x: x[x['Count'] == x['Count'].max()])

cleaned_df = cleaned_df.reset_index(drop=True)

# Filter to keep only the first rows within each unique doi
cleaned_df = cleaned_df.drop_duplicates(['DOI', 'Value'])

# Drop the 'Count' column
# result = result.drop(columns=['Count'])

# Save the result to a new CSV file
cleaned_df.to_csv(second_output_path, index=False)