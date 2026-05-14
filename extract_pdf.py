import sys
import subprocess

# Install pypdf if not present
try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

def extract_text(pdf_path, output_txt):
    try:
        reader = pypdf.PdfReader(pdf_path)
        with open(output_txt, "w", encoding="utf-8") as f:
            for page in reader.pages:
                f.write(page.extract_text() + "\n")
        print(f"Successfully extracted text to {output_txt}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_text("d:/fyp/FYP-I_Report.pdf", "d:/fyp/temp_pdf_content.txt")
