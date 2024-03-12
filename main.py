# to activate the environment: venv\Scripts\Activate
# to deactive the environment: deactivate

import PyPDF2
import re
import pandas as pd
import os

def extract_text_from_pdf(pdf_path):
    """
    Extract text content from a PDF file.

    Args:
    - pdf_path (str): Path to the PDF file.

    Returns:
    - str: Extracted text content from the PDF.
    """
    text = ''
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text()
    return text

def normalize_text(text):
    """
    Normalize text by removing extra whitespaces and converting to lowercase.

    Args:
    - text (str): Input text to be normalized.

    Returns:
    - str: Normalized text.
    """
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    
    text = text.lower()
    return text

def extract_lod_values(text, distance=20):
    """
    Extract LOD (Limit of Detection) values from text.

    Args:
    - text (str): Text to search for LOD values.
    - distance (int): Maximum number of characters to search after the term "lod" for the value and units.

    Returns:
    - pandas.DataFrame: DataFrame containing extracted LOD values, associated DOI, value, and units.
    """
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
    """
    Analyze a PDF file to extract LOD values.

    Args:
    - pdf_path (str): Path to the PDF file.

    Returns:
    - pandas.DataFrame: DataFrame containing extracted LOD values, associated DOI, value, and units.
    """
    extracted_text = extract_text_from_pdf(pdf_path)

    normalized_text = normalize_text(extracted_text)
        
    lod_table = extract_lod_values(normalized_text)
    return lod_table

def analyze_multiple_pdfs(pdf_paths):
    """
    Analyze multiple PDF files to extract LOD values.

    Args:
    - pdf_paths (list): List of paths to the PDF files.

    Returns:
    - pandas.DataFrame: DataFrame containing combined extracted LOD values from all PDFs.
    """
    combined_lod_table = pd.DataFrame(columns=['DOI', 'Value', 'Units'])

    for pdf_path in pdf_paths:
        pdf_lod_table = analyze_pdf(pdf_path)
        combined_lod_table = pd.concat([combined_lod_table, pdf_lod_table], ignore_index=True)

    return combined_lod_table
    
def generate_paths(directory_path):
    """
    Generate paths for all PDF files in a directory.

    Args:
    - directory_path (str): Path to the directory containing PDF files.

    Returns:
    - list: List of paths to the PDF files in the directory.
    """
    pdf_files = [f for f in os.listdir(directory_path) if f.endswith('.pdf')]
    pdf_paths = [os.path.join(directory_path, f) for f in pdf_files]
    return pdf_paths

def clean_data(raw_lod_csv):
    """
    Clean the raw LOD data CSV file.

    Args:
    - raw_lod_csv (str): Path to the raw LOD data CSV file.

    Returns:
    - pandas.DataFrame: DataFrame containing cleaned LOD data.
    """
    
    df = pd.read_csv(raw_lod_csv)

    # Drop rows with NaN values
    df = df.dropna()

    # Count the duplicates for each DOI
    df['Count'] = df.groupby(['DOI', 'Value', 'Units'])['DOI'].transform('count')

    # Group the data by DOI and filter each group to keep rows with the maximum count value
    df = df.groupby('DOI').apply(lambda x: x[x['Count'] == x['Count'].max()])

    df = df.reset_index(drop=True)

    # Filter to keep only the first rows within each unique doi
    df = df.drop_duplicates(['DOI', 'Value'])
    
    return df
    



subdirectory_path = './pdfs'
output_path = 'raw_lod_table.csv'
second_output_path = 'cleaned_lod_table.csv'

pdf_paths = generate_paths(subdirectory_path)

combined_table = analyze_multiple_pdfs(pdf_paths)
combined_table.to_csv(output_path, index=False)

cleaned_df = clean_data(output_path)
cleaned_df.to_csv(second_output_path, index=False)