import unittest
from main import extract_text_from_pdf, normalize_text, extract_lod_values, extract_sensitivity_values

class TestPDFExtraction(unittest.TestCase):
    def test_extract_text_from_pdf(self):
        pdf_path = 'test_files/sample.pdf'
        extracted_text = extract_text_from_pdf(pdf_path)
        self.assertNotEqual(extracted_text, '')  # Ensure extracted text is not empty
        self.assertIsInstance(extracted_text, str)  # Ensure extracted text is a string

    def test_normalize_text(self):
        text = "   This is a   test   String.    "
        normalized_text = normalize_text(text)
        self.assertEqual(normalized_text, " this is a test string. ")  # Ensure whitespace is normalized
        self.assertIsInstance(normalized_text, str)  # Ensure normalized text is a string

    def test_extract_lod_values(self):
        text = "The LOD is 0.05 μm. The limit of detection is 0.1 mm."
        lod_values = extract_lod_values(text)
        self.assertEqual(len(lod_values), 2)  # Ensure two LOD values are extracted
        self.assertEqual(lod_values['Value'].tolist(), [0.05, 0.1])  # Ensure correct values are extracted
        self.assertEqual(lod_values['Units'].tolist(), ['μm', 'mm'])  # Ensure correct units are extracted

    def test_extract_sensitivity_values(self):
        text = "The sensitivity is 0.02. Sensitivity: 0.03."
        sensitivity_values = extract_sensitivity_values(text)
        self.assertEqual(len(sensitivity_values), 2)  # Ensure two sensitivity values are extracted
        self.assertEqual(sensitivity_values['Value'].tolist(), [0.02, 0.03])  # Ensure correct values are extracted

if __name__ == '__main__':
    unittest.main()

