# PDF Text Analysis Tool

The PDF Text Analysis Tool is a Python application that extracts and analyzes text from PDF files, focusing on extracting LOD (Limit of Detection) values and associated units, as well as DOIs (Digital Object Identifiers). It provides functionalities to clean and process the extracted data, generating a cleaned and normalized output for further analysis.

## Features
- Extracts text from PDF files
- Normalizes text for consistent processing
- Identifies LOD values and associated units
- Extracts DOIs from PDF text
- Cleans and processes extracted data
- Generates cleaned and normalized output in CSV format

## Installation
1. Clone the repository:

```
git clone https://github.com/your-username/pdf-interpreter.git
```
2. Install the required dependencies:

```
pip install PyPDF2 pandas
```

3. Run the program:
```
python main.py
```
## Usage
1. Place your PDF files in the pdfs directory.
2. Run the application using the installation instructions above.
3. The application will extract text from the PDFs, analyze the text for LOD values, units, and DOIs, and generate both a raw data CSV file (raw_lod_table.csv) and a cleaned/normalized CSV file (cleaned_lod_table.csv).

## Sample Output
```
DOI,Value,Units,Count
10.1016/j.snb.2018.11.055,0.04,μm,2
10.1016/j.snb.2018.11.055,0.08,μm,2
10.1016/j.bios.2014.09.042,22.2,mg/dl,3
10.1039/d1an00283j,0.01,mm,2
10.1021/acs.analchem.5b00012,1.07,μm,1
```
  
## Contributing
Contributions are welcome! If you have ideas for improvements or new features, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.