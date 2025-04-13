import sys
import os
import pdfplumber
from PIL import Image
import pytesseract

# Set the Tesseract executable path (update this if needed)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_with_pdfplumber(pdf_path):
    """
    Extracts text from a PDF file using pdfplumber.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Path to the output .txt file.
    """
    output_file = os.path.splitext(pdf_path)[0] + "_pdfplumber.txt"
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)

    return output_file

def extract_text_with_tesseract(pdf_path):
    """
    Extracts text from a PDF file using Tesseract OCR.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Path to the output .txt file.
    """
    output_file = os.path.splitext(pdf_path)[0] + "_tesseract.txt"
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # Convert the page to an image and use Tesseract OCR
            image = page.to_image()
            ocr_text = pytesseract.image_to_string(image.original)
            text += ocr_text + "\n"

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)

    return output_file

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_pdf_text.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(f"Error: File {pdf_path} does not exist.")
        sys.exit(1)

    try:
        # output_file = extract_text_with_pdfplumber(pdf_path)
        output_file = extract_text_with_tesseract(pdf_path)

        print(f"Text extracted and saved to {output_file}")
        print(output_file)  # Ensure the output file path is printed
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
