import unittest
from unittest.mock import patch, mock_open
import pandas as pd
from main import *

# python -m unittest unit_tests.py
test_text = '''Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
labore et dolore magna aliqua. Id venenatis a condimentum vitae sapien pellentesque. Adipiscing 
at in tellus integer feugiat scelerisque varius morbi. Vel orci porta non pulvinar. Porttitor rhoncus 
dolor purus non enim praesent elementum facilisis leo. The sensitivity is 0.5. Sensitivity: 0.75. 
Massa placerat duis ultricies lacus sed. Enim ut sem viverra aliquet eget. Volutpat est velit egestas 
dui id. In iaculis nunc sed augue lacus viverra vitae congue eu. Rhoncus mattis rhoncus urna 
neque. 
 
The sensitivity is 0.5. Sensitivity: 0.75. Nunc aliquet bibendum enim facilisis gravida neque 
convallis a. A scelerisque purus semper eget duis at tellus at urna. Viverra accumsan in nisl nisi 
scelerisque eu. Ipsum nunc aliquet bibendum enim facilisis gravida. Sit amet massa vitae tortor 
condimentum lacinia quis vel eros. The LOD is 5 mg/dl. The limit of detection is 10 μm. At varius vel 
pharetra vel turpis nunc. Dictum at tempor commodo ullamcorper a lacus. Turpis nunc eget lorem 
dolor sed viverra ipsum. Arcu ac tortor dignissim convallis aenean et tortor. Urna duis convallis 
convallis tellus id interdum velit laoreet id. In hac habitasse platea dictumst quisque sagittis purus. 
Urna nunc id cursus metus. 
 
Est ullamcorper eget nulla facilisi etiam dignissim diam. Placerat orci nulla pellentesque dignissim 
enim. Senectus et netus et malesuada fames ac turpis. Et malesuada fames ac turpis egestas 
integer eget aliquet nibh. Ut morbi tincidunt augue interdum velit euismod. A pellentesque sit amet 
porttitor eget. Blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Turpis massa 
sed elementum tempus egestas sed sed risus. Gravida neque convallis a cras semper auctor 
neque. The LOD is 5 mg/dl. The limit of detection is 10 μm. Vel risus commodo viverra maecenas 
accumsan lacus vel facilisis volutpat. Sit amet est placerat in egestas erat imperdiet sed euismod. 
Turpis cursus in hac habitasse platea. Arcu non odio euismod lacinia at quis risus sed vulputate.'''

class TestPDFAnalysis(unittest.TestCase):

    @patch('builtins.open', new_callable=mock_open, read_data='Sample text')
    def test_extract_text_from_pdf(self, mock_open):
        text = extract_text_from_pdf('test_pdfs/test3.pdf')
        self.assertNotEqual(text, 'This is an extraction test.')

    def test_normalize_text(self):
        text = normalize_text('  Hello  World  ')
        self.assertEqual(text, ' hello world ')

    def test_extract_lod_values(self):
        text = 'The LOD is 5 mg/dl. The limit of detection is 10 μm.'
        df = extract_lod_values(text)
        expected_df = pd.DataFrame({'DOI': ['NaN', 'NaN'], 'Value': [5.0, 10.0], 'Units': ['mg/dl', 'μm']})
        pd.testing.assert_frame_equal(df, expected_df)

    def test_extract_sensitivity_values(self):
        text = 'The sensitivity is 0.5. Sensitivity: 0.75'
        df = extract_sensitivity_values(text)
        expected_df = pd.DataFrame({'DOI': ['NaN', 'NaN'], 'Value': [0.5, 0.75]})
        pd.testing.assert_frame_equal(df, expected_df)

    def test_analyze_pdf(self):
        with patch('main.extract_text_from_pdf', return_value=test_text):
            lod_table, sensitivity_table = analyze_pdf('test.pdf')
            print(lod_table)
            self.assertIsInstance(lod_table, pd.DataFrame)
            self.assertIsInstance(sensitivity_table, pd.DataFrame)

    def test_analyze_multiple_pdfs(self):
        pdf_paths = ['test_pdfs/test1.pdf', 'test_pdfs/test2.pdf']
        with patch('main.analyze_pdf', side_effect=[(pd.DataFrame(), pd.DataFrame()), (pd.DataFrame(), pd.DataFrame())]):
            lod_table, sensitivity_table = analyze_multiple_pdfs(pdf_paths)
            self.assertIsInstance(lod_table, pd.DataFrame)
            self.assertIsInstance(sensitivity_table, pd.DataFrame)

    def test_generate_paths(self):
        pdf_paths = generate_paths("test_pdfs")
        self.assertEqual(pdf_paths, ['test_pdfs\\test1.pdf', 'test_pdfs\\test2.pdf', 'test_pdfs\\test3.pdf'])

    def test_clean_lod_data(self):
        raw_lod_csv = 'test_csvs/raw_lod_table.csv'
        df = clean_lod_data(raw_lod_csv)
        self.assertIsInstance(df, pd.DataFrame)

    def test_clean_sensitivity_data(self):
        raw_sensitivity_csv = 'test_csvs/raw_sensitivity_table.csv'
        df = clean_sensitivity_data(raw_sensitivity_csv)
        self.assertIsInstance(df, pd.DataFrame)
    

if __name__ == '__main__':
    unittest.main()
