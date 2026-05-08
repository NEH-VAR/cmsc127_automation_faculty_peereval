import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

// Create a local interface so we don't have to rewrite your controller payloads
export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not set in the environment variables.');
    }

    // Initialize Resend Client
    this.resend = new Resend(apiKey);
    
    // Set the default sender
    this.fromEmail = 
      this.configService.get<string>('EMAIL_FROM') || 
      'onboarding@resend.dev'; // Fallback for testing on unverified accounts
  }

async sendMail(options: SendMailOptions): Promise<void> {
    try {
      // Dynamically build the payload to satisfy Resend's strict TypeScript unions
      const payload: any = {
        from: this.fromEmail,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
      };

      // Add ONLY the property that actually exists
      if (options.html) {
        payload.html = options.html;
      } else if (options.text) {
        payload.text = options.text;
      } else {
        // Fallback in case both are accidentally omitted
        payload.text = ' '; 
      }

      // Send via Resend
      const { data, error } = await this.resend.emails.send(payload);

      if (error) {
        this.logger.error(`Resend API Error: ${error.message}`, JSON.stringify(error));
        throw new Error(error.message);
      }

      this.logger.log(`Email sent successfully via Resend. ID: ${data?.id}`);
    } catch (error) {
      this.logger.error('Failed to send email', JSON.stringify(error));
      throw error;
    }
  }
  async sendReminderEmail(
    to: string,
    fullName: string,
    reminder: string,
    subject = 'Reminder',
  ): Promise<void> {
    const text = `Good day ${fullName}!\n\nThis email is a reminder to ${reminder}.`;

    await this.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendNominationMagicLinkEmail(
    to: string,
    fullName: string,
    magicLinkUrl: string,
    cycleName: string,
  ): Promise<void> {
    const subject = 'Faculty Nomination Required - Peer Evaluation System';

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Good day ${fullName}!</h2>
          
          <p>You have been invited to participate in the <strong>${cycleName}</strong> peer evaluation cycle.</p>
          
          <p>As part of this process, we need you to <strong>nominate 5 of your peers</strong> for evaluation. This is an important step in ensuring comprehensive feedback.</p>
          
          <p>Please click the link below to begin the nomination process:</p>
          
          <p>
            <a href="${magicLinkUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Start Nominating
            </a>
          </p>
          
          <p><strong>Note:</strong> This link will expire in 31 days. If you do not complete the nominations within this timeframe, you will need to request a new link.</p>
          
          <p>If you have any questions, please contact the administration team.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 0.9em; color: #666;">
            This is an automated message from the Peer Evaluation System. Please do not reply to this email.
          </p>
        </body>
      </html>
    `;

    await this.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendEvaluationMagicLinkEmail(
    to: string,
    fullName: string,
    evaluateeName: string,
    magicLinkUrl: string,
    cycleName: string,
  ): Promise<void> {
    const subject = 'Evaluation Form Required - Peer Evaluation System';

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Good day ${fullName}!</h2>
          
          <p>You have been assigned to evaluate <strong>${evaluateeName}</strong> for the <strong>${cycleName}</strong> peer evaluation cycle.</p>
          
          <p>Your feedback is crucial in providing comprehensive and balanced evaluations. Please take time to provide thoughtful responses.</p>
          
          <p>Please click the link below to access and complete the evaluation form:</p>
          
          <p>
            <a href="${magicLinkUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Complete Evaluation
            </a>
          </p>
          
          <p><strong>Note:</strong> This link will expire in 31 days. Please complete your evaluation before the deadline.</p>
          
          <p>If you have any questions, please contact the administration team.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 0.9em; color: #666;">
            This is an automated message from the Peer Evaluation System. Please do not reply to this email.
          </p>
        </body>
      </html>
    `;

    await this.sendMail({
      to,
      subject,
      html,
    });
  }
}