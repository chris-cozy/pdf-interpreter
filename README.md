# pdf-interpreter

pdf-interpreter is a Python program designed to extract text from PDF documents, normalize the extracted text, and analyze it for various purposes, such as extracting Levels of Details (LODs) or other structured information.

## Installation
1. Clone the repository:

```
git clone https://github.com/your-username/pdf-interpreter.git
```
2. Install the required dependencies:

```
pip install PyPDF2
```

## Usage
1. Replace 'path/to/your/pdf/file.pdf' in pdf_interpreter.py with the path to your PDF file.

2. Run the program:
```
python pdf_interpreter.py
```
3. The program will extract text from the PDF, normalize it, and analyze it according to the defined rules.

## Examples
Here are some examples of the program's output:

- Extracted text: "This is the extracted text from the PDF."
- Normalized text: "this is the extracted text from the pdf."
- Extracted LODs: ["INTRODUCTION:", "METHODS:", "RESULTS:"]
  
## Contributing
Contributions are welcome! If you have ideas for improvements or new features, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.