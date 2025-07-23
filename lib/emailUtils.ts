// File: /lib/emailUtils.ts
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

// Configure SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true, // Use pooled connections for better performance
    maxConnections: 5, // Limit concurrent connections for stability
    maxMessages: 100, // Limit messages per connection
    rateDelta: 1000, // Time between messages in ms
    rateLimit: 5, // Max messages per rateDelta
  });
};

// Cache the transporter for reuse
let transporter: nodemailer.Transporter | null = null;

/**
 * Sends an email notification to a user whose activity join request has been accepted
 * 
 * @param userEmail - The email address of the user
 * @param userName - The name of the user
 * @param activityDetails - Object containing activity details
 * @returns Promise resolving to success status
 */
export async function sendActivityAcceptanceEmail(
  userEmail: string,
  userName: string | null,
  activityDetails: {
    title: string;
    location: string;
    startTime: Date;
    description?: string | null;
    endTime?: Date | null;
  }
): Promise<boolean> {
  try {
    // Initialize transporter if not already created
    if (!transporter) {
      transporter = createTransporter();
    }

    // Format dates for display
    const formattedStartTime = format(
      new Date(activityDetails?.startTime),
      'EEEE, MMMM d, yyyy h:mm a'
    );
    
    const formattedEndTime = activityDetails?.endTime
      ? format(new Date(activityDetails?.endTime), 'EEEE, MMMM d, yyyy h:mm a')
      : 'Not specified';

    // Create email content
    const subject = `Your request to join "${activityDetails.title}" has been accepted!`;
    
    // Plain text version
    const textContent = `
      Hello ${userName || 'there'},
      
      Congratulations! Your request to join the activity "${activityDetails?.title}" has been accepted.
      
      Activity Details:
      - Location: ${activityDetails?.location}
      - Start Time: ${formattedStartTime}
      - End Time: ${formattedEndTime}
      ${activityDetails?.description ? `- Description: ${activityDetails?.description}` : ''}
      
      We look forward to your participation!
      
      Best regards,
      The Activity App Team
    `;
    
    // HTML version
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 5px; border: 1px solid #e0e0e0;">
        <h2 style="color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Congratulations!</h2>
        
        <p>Hello ${userName || 'there'},</p>
        
        <p>Your request to join the activity "<strong>${activityDetails?.title}</strong>" has been accepted.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Activity Details</h3>
          <ul style="padding-left: 20px;">
            <li><strong>Location:</strong> ${activityDetails?.location}</li>
            <li><strong>Start Time:</strong> ${formattedStartTime}</li>
            <li><strong>End Time:</strong> ${formattedEndTime}</li>
            ${activityDetails?.description ? `<li><strong>Description:</strong> ${activityDetails?.description}</li>` : ''}
          </ul>
        </div>
        
        <p>We look forward to your participation!</p>
        
        <p style="color: #7f8c8d; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          Best regards,<br>
          The Activity App Team
        </p>
      </div>
    `;

    // Send the email
     await transporter.sendMail({
      from: `"Activity App" <${process.env.SMTP_FROM || 'noreply@activityapp.com'}>`,
      to: userEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
      headers: {
        'X-Priority': '1', // High priority
        'X-Mailer': 'Activity App Mailer'
      }
    });

    // console.log(`Acceptance email sent to ${userEmail} for activity "${activityDetails?.title}". MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send acceptance email to ${userEmail}:`, error);
    return false;
  }
}

// Close transporter connections when shutting down
export function closeEmailConnections(): void {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}