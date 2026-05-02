import { emailTransporter } from './email.config.js';
import { envVars } from '../../config/index.js';
import { redisService } from '../../db/index.js';
import { EmailType } from '../enums/index.js';

interface ISendEmailArgs {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html }: ISendEmailArgs) => {
    const mailOptions = {
        from: `"Social media App" <${envVars.email.user}>`,
        to,
        subject,
        html,
    };

    return await emailTransporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (email: string, emailType: EmailType) => {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Get the Redis Key for this OTP type
    const otpKey = redisService.getOtpKey(email, emailType);

    // 3. Save OTP to Redis with 5 minutes expiration (300 seconds)
    await redisService.set(otpKey, otp, 5 * 60);

    // 4. Determine subject based on EmailType
    let subject = 'Your OTP Code';
    if (emailType === EmailType.CONFIRM_EMAIL) subject = 'Confirm Your Email';
    if (emailType === EmailType.FORGOT_PASSWORD) subject = 'Reset Your Password';

    // 5. Build HTML content
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #f9f9f9;
                    padding: 20px;
                    border-radius: 12px;
                }
                .card {
                    background: white;
                    padding: 40px;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    text-align: center;
                }
                .header {
                    color: #1a1a1a;
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 20px;
                }
                .otp-box {
                    background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
                    color: white;
                    font-size: 42px;
                    font-weight: 800;
                    padding: 20px;
                    border-radius: 12px;
                    margin: 30px 0;
                    letter-spacing: 8px;
                    box-shadow: 0 4px 10px rgba(110, 142, 251, 0.3);
                }
                .footer {
                    color: #777;
                    font-size: 14px;
                    margin-top: 30px;
                    line-height: 1.6;
                }
                .highlight {
                    color: #6e8efb;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">Social Media App</div>
                    <p style="color: #444; font-size: 16px;">Hello,</p>
                    <p style="color: #666; font-size: 16px;">${emailType === EmailType.CONFIRM_EMAIL ? 'To complete your registration, please use the following verification code:' : 'We received a request to reset your password. Use the code below to proceed:'}</p>
                    
                    <div class="otp-box">${otp}</div>
                    
                    <p style="color: #666; font-size: 14px;">This code is valid for <span class="highlight">5 minutes</span>.</p>
                    
                    <div class="footer">
                        <p>If you didn't request this, you can safely ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p>&copy; ${new Date().getFullYear()} Social Media App. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // 6. Send the email
    await sendEmail({
        to: email,
        subject,
        html
    });

    return true;
};
