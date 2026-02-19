import { Router, Response, NextFunction } from 'express';
import { sendContactFormEmail } from '../services/email.service';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

interface ContactRequest {
  body: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  };
}

router.post('/', async (req: ContactRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      sendError(res as any, 'All fields are required', 400);
      return;
    }

    await sendContactFormEmail(
      `${firstName} ${lastName}`,
      email,
      subject,
      message
    );

    sendSuccess(res as any, null, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
