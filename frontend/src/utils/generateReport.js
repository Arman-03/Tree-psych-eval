import jsPDF from 'jspdf';
// import { logoBase64 } from '../assets/logoBase64'; 

/**
 * Generates and downloads a professionally formatted PDF report for a given case.
 * This version includes a smart text renderer that converts **bold** markdown into actual bold text.
 * @param {object} caseData - The full case object.
 */
export const generatePdfReport = (caseData) => {
    // --- 1. Configuration & Setup ---
    const MARGIN = 50;
    const FONT_SIZES = { title: 18, header: 13, body: 11, small: 9 };
    const LINE_HEIGHT = 1.4;

    const doc = new jsPDF('p', 'pt', 'a4');
    const contentWidth = doc.internal.pageSize.getWidth() - MARGIN * 2;
    let cursorY = MARGIN;

    // --- Helper Functions for Clean Code ---
    const addPageIfNeeded = (spaceNeeded) => {
        if (cursorY + spaceNeeded > doc.internal.pageSize.getHeight() - MARGIN) {
            doc.addPage();
            cursorY = MARGIN;
            addHeaderAndFooter();
        }
    };

    // ==================================================================
    // NEW & IMPROVED HELPER: This function parses **bold** markdown.
    // ==================================================================
    const addFormattedText = (text, size, indent = 0) => {
        doc.setFontSize(size);
        
        // 1. Let jsPDF handle the complex line wrapping first.
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        
        addPageIfNeeded(lines.length * size * LINE_HEIGHT);

        // 2. Now, iterate through each wrapped line and apply formatting.
        for (const line of lines) {
            let currentX = MARGIN + indent;
            // Split the line by the bold delimiter `**`
            const parts = line.split('**');

            parts.forEach((part, index) => {
                // If the index is odd, the text is between two asterisks, so it should be bold.
                const isBold = index % 2 === 1;
                doc.setFont(undefined, isBold ? 'bold' : 'normal');
                
                // Render the part at the current position
                doc.text(part, currentX, cursorY);
                
                // Move the X cursor for the next part on the same line
                currentX += doc.getTextWidth(part);
            });

            cursorY += size * LINE_HEIGHT; // Move to the next line
        }
        // Reset to normal font weight after processing
        doc.setFont(undefined, 'normal');
    };

    const addSectionTitle = (title) => {
        addPageIfNeeded(30);
        cursorY += 15;
        doc.setFontSize(FONT_SIZES.header);
        doc.setFont(undefined, 'bold');
        doc.text(title, MARGIN, cursorY);
        cursorY += FONT_SIZES.header * LINE_HEIGHT;
        doc.setDrawColor(222, 226, 230);
        doc.line(MARGIN, cursorY, MARGIN + contentWidth, cursorY);
        cursorY += 15;
    };

    const addHeaderAndFooter = () => {
        doc.setFontSize(FONT_SIZES.small);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(108, 117, 125);
        doc.text('Confidential Psychology Assessment Report', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

        const pageStr = `Page ${doc.internal.getCurrentPageInfo().pageNumber}`;
        doc.text(pageStr, doc.internal.pageSize.getWidth() - MARGIN, doc.internal.pageSize.getHeight() - 30);
    };

    // --- 2. Build the Document ---
    addHeaderAndFooter();

    // Main Title
    doc.setFontSize(FONT_SIZES.title);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('Psychology Assessment Report', MARGIN, cursorY);
    cursorY += 40;

    // Subject Details Section
    const childName = caseData.drawing.childName || caseData.drawing.childId;
    const childId = caseData.drawing.childId || 'N/A';
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont(undefined, 'normal');
    doc.text(`Child’s Name: ${childName}`, MARGIN, cursorY);
    doc.text(`UID: ${childId}`, MARGIN + 280, cursorY);
    cursorY += FONT_SIZES.body * LINE_HEIGHT;
    doc.text(`Age: ${caseData.drawing.childAge || 'N/A'} years`, MARGIN, cursorY);
    doc.text(`Date of Report: ${new Date().toLocaleDateString()}`, MARGIN + 280, cursorY);
    
    // Test Administered Section
    addSectionTitle('Test Administered');
    addFormattedText('House-Tree-Person (HTP) Test - Tree Drawing', FONT_SIZES.body);

    // Initial Automated Analysis Section
    addSectionTitle('Initial Interpretation');
    const initialInterpretation = caseData.mlOutput?.psychIndicators?.[0]?.interpretation || 'No automated interpretation was generated for this case.';
    addFormattedText(initialInterpretation, FONT_SIZES.body); // Use the new formatted text function
    doc.setFontSize(FONT_SIZES.small);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(108, 117, 125);
    addFormattedText('\nNote: This initial analysis requires professional validation and is not a substitute for clinical judgment.', FONT_SIZES.small);
    doc.setTextColor(33, 37, 41);

    // Assessor's Final Report Section
    addSectionTitle("Assessor's Final Report & Interpretation");
    const finalReport = caseData.assessorReport?.trim() || 'No final report was written by the assessor for this case.';
    addFormattedText(finalReport, FONT_SIZES.body); // Use the new formatted text function

    // Final Disposition Section
    addSectionTitle('Final Disposition');
    const finalStatus = caseData.status || 'Status Not Recorded';
    doc.setFont(undefined, 'bold');
    addFormattedText(finalStatus, FONT_SIZES.body);

    // --- Signature Section ---
    if (cursorY > doc.internal.pageSize.getHeight() - 120) {
        doc.addPage();
        cursorY = doc.internal.pageSize.getHeight() - 120;
        addHeaderAndFooter();
    } else {
        cursorY = doc.internal.pageSize.getHeight() - 120;
    }

    doc.setDrawColor(0, 0, 0);
    doc.line(MARGIN, cursorY, MARGIN + 220, cursorY);
    cursorY += 20;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(FONT_SIZES.body);
    const assessorName = caseData.assessor?.username || 'Unspecified Assessor';
    doc.text(assessorName, MARGIN, cursorY);
    cursorY += FONT_SIZES.body * LINE_HEIGHT;
    
    doc.setFont(undefined, 'normal');
    doc.text('Clinical Psychologist', MARGIN, cursorY);

    // Final update of page numbers
    // const totalPages = doc.internal.getNumberOfPages();
    // for (let i = 1; i <= totalPages; i++) {
    //     doc.setPage(i);
    //     doc.setFontSize(FONT_SIZES.small);
    //     doc.setTextColor(108, 117, 125);
    //     doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - MARGIN - doc.getTextWidth(`Page ${i} of ${totalPages}`), doc.internal.pageSize.getHeight() - 30);
    // }

    // --- 3. Save the PDF ---
    doc.save(`Psychology-Report-${childId}.pdf`);
};