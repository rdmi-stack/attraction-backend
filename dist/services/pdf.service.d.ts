interface TicketData {
    reference: string;
    attractionTitle: string;
    date: string;
    time?: string;
    guestName: string;
    email: string;
    items: Array<{
        optionName: string;
        quantities: {
            adults: number;
            children: number;
            infants: number;
        };
    }>;
    total: number;
    currency: string;
    meetingPoint?: {
        address: string;
        instructions: string;
    };
}
export declare const generateTicketPdf: (data: TicketData) => Promise<Buffer>;
export {};
//# sourceMappingURL=pdf.service.d.ts.map