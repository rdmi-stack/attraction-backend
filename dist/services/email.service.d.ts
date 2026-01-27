interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
    }>;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendBookingConfirmation: (email: string, bookingDetails: {
    reference: string;
    attractionTitle: string;
    date: string;
    time?: string;
    guestName: string;
    total: number;
    currency: string;
}, ticketPdf?: Buffer) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, resetToken: string, userName: string) => Promise<void>;
export declare const sendUserInvitation: (email: string, invitationToken: string, inviterName: string, role: string) => Promise<void>;
export {};
//# sourceMappingURL=email.service.d.ts.map