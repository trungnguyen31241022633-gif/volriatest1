import { PdfExtractResult } from '../types';

// We access the global pdfjsLib injected via script tag in index.html
// to avoid complex bundler worker configuration for this specific environment.
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const extractTextFromPdf = async (file: File): Promise<PdfExtractResult> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return {
      text: fullText.trim(),
      pageCount: pdf.numPages
    };
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from the PDF file. Please ensure it is a valid text-based PDF.");
  }
};
