import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface TicketData {
  reference: string;
  attractionTitle: string;
  date: string;
  time?: string;
  guestName: string;
  email: string;
  items: Array<{
    optionName: string;
    quantities: { adults: number; children: number; infants: number };
  }>;
  total: number;
  currency: string;
  meetingPoint?: {
    address: string;
    instructions: string;
  };
}

export const generateTicketPdf = async (data: TicketData): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(data.reference, {
        width: 150,
        margin: 1,
      });
      const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

      // Colors
      const primaryColor = '#7c3aed';
      const textColor = '#1f2937';
      const mutedColor = '#6b7280';

      // Header
      doc
        .fillColor(primaryColor)
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('E-TICKET', 50, 50);

      doc
        .fillColor(mutedColor)
        .fontSize(12)
        .font('Helvetica')
        .text('Attractions Network', 50, 85);

      // QR Code
      doc.image(qrCodeBuffer, 420, 40, { width: 120 });

      // Divider
      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, 180)
        .lineTo(545, 180)
        .stroke();

      // Booking Reference
      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .text('BOOKING REFERENCE', 50, 200);
      
      doc
        .fillColor(textColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(data.reference, 50, 215);

      // Experience Title
      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('EXPERIENCE', 50, 260);
      
      doc
        .fillColor(textColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(data.attractionTitle, 50, 275, { width: 400 });

      // Date & Time
      const yPos = 330;
      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('DATE', 50, yPos);
      
      doc
        .fillColor(textColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(data.date, 50, yPos + 15);

      if (data.time) {
        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text('TIME', 200, yPos);
        
        doc
          .fillColor(textColor)
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(data.time, 200, yPos + 15);
      }

      // Guest Details
      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('GUEST NAME', 350, yPos);
      
      doc
        .fillColor(textColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(data.guestName, 350, yPos + 15);

      // Tickets
      let ticketY = 400;
      doc
        .fillColor(mutedColor)
        .fontSize(10)
        .font('Helvetica')
        .text('TICKETS', 50, ticketY);

      ticketY += 20;
      data.items.forEach((item) => {
        const guests = [];
        if (item.quantities.adults > 0) guests.push(`${item.quantities.adults} Adult(s)`);
        if (item.quantities.children > 0) guests.push(`${item.quantities.children} Child(ren)`);
        if (item.quantities.infants > 0) guests.push(`${item.quantities.infants} Infant(s)`);

        doc
          .fillColor(textColor)
          .fontSize(12)
          .font('Helvetica')
          .text(`${item.optionName}: ${guests.join(', ')}`, 50, ticketY);
        ticketY += 20;
      });

      // Total
      doc
        .fillColor(primaryColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`Total: ${data.currency} ${data.total.toFixed(2)}`, 50, ticketY + 10);

      // Meeting Point
      if (data.meetingPoint) {
        const meetingY = ticketY + 60;
        
        doc
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .moveTo(50, meetingY - 10)
          .lineTo(545, meetingY - 10)
          .stroke();

        doc
          .fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text('MEETING POINT', 50, meetingY);
        
        doc
          .fillColor(textColor)
          .fontSize(11)
          .font('Helvetica')
          .text(data.meetingPoint.address, 50, meetingY + 15, { width: 495 });
        
        if (data.meetingPoint.instructions) {
          doc
            .fillColor(mutedColor)
            .fontSize(10)
            .text(data.meetingPoint.instructions, 50, meetingY + 40, { width: 495 });
        }
      }

      // Footer
      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .text(
          'Please show this e-ticket on your mobile device at the venue. No printing required.',
          50,
          750,
          { align: 'center', width: 495 }
        );

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .text(
          `Generated on ${new Date().toISOString().split('T')[0]} | Powered by Attractions Network`,
          50,
          770,
          { align: 'center', width: 495 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
