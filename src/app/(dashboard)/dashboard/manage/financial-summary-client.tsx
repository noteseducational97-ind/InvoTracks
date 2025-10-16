'use client';
import { Button } from "@/components/ui/button";
import { FileDown, Pencil } from "lucide-react";
import Link from "next/link";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function FinancialSummaryClient({ children }: { children: React.ReactNode }) {
  
  const handleExport = () => {
    const input = document.getElementById('pdf-content');
    if (input) {
      // Add a temporary class to set a white background for PDF generation
      input.classList.add('pdf-export-bg');
      
      html2canvas(input, { scale: 2, backgroundColor: '#ffffff' }).then((canvas) => {
        // Remove the class after canvas is generated
        input.classList.remove('pdf-export-bg');
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;
        
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();
        let heightLeft = height;

        pdf.addImage(imgData, 'PNG', 0, position, width, height);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - height;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, width, height);
            heightLeft -= pageHeight;
        }

        pdf.save('financial-summary.pdf');
      });
    }
  };

  return (
    <>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Manage Your Finances</h1>
                <p className="text-muted-foreground">A centralized view of your financial details and commitments.</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/manage/edit"><Pencil className="h-4 w-4 mr-2" />Edit Details</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to PDF
                </Button>
            </div>
        </div>
        {children}
        <style jsx global>{`
          .pdf-export-bg {
            background-color: #ffffff !important;
          }
          .pdf-export-bg .dark, .dark .pdf-export-bg {
            --background: 0 0% 100%;
            --foreground: 224 71% 4%;
            --card: 0 0% 100%;
            --card-foreground: 224 71% 4%;
            --popover: 0 0% 100%;
            --popover-foreground: 224 71% 4%;
            --secondary: 220 14.3% 95.9%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 220 14.3% 95.9%;
            --muted-foreground: 220 8.9% 46.1%;
            --accent: 220 14.3% 95.9%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --border: 220 13% 91%;
            --input: 220 13% 91%;
          }
          .pdf-export-bg .bg-muted\\/50 {
             background-color: hsl(220 14.3% 95.9% / 0.5) !important;
          }
        `}</style>
    </>
  );
}
