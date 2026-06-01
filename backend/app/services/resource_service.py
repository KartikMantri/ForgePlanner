import httpx
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
from io import BytesIO
# pyrefly: ignore [missing-import]
import PyPDF2
import re

class ResourceService:
    @staticmethod
    async def extract_text_from_url(url: str) -> str:
        """Fetches a URL and extracts readable text using BeautifulSoup."""
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
                response.raise_for_status()
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts, styles, nav, footer
            for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
                element.decompose()
                
            text = soup.get_text(separator='\n')
            # Collapse multiple newlines and spaces
            text = re.sub(r'\n+', '\n', text)
            text = re.sub(r' +', ' ', text)
            
            return text.strip()[:15000] # Cap at 15k chars to save context window
        except Exception as e:
            raise RuntimeError(f"Failed to extract URL: {str(e)}")

    @staticmethod
    async def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extracts text from a PDF file byte array."""
        try:
            pdf_file = BytesIO(file_bytes)
            reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
                    
            return text.strip()[:15000]
        except Exception as e:
            raise RuntimeError(f"Failed to extract PDF: {str(e)}")
