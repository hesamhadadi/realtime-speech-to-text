import jsPDF from "jspdf";

export function exportTextAsPdf(text: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 40;
  const maxWidth = 515;
  const lines = doc.splitTextToSize(text || " ", maxWidth);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  let y = margin;
  const lineHeight = 18;

  for (const line of lines) {
    if (y > 800) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save("transcript.pdf");
}