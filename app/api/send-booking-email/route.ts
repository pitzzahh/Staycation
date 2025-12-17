import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();

    // Create transporter with your Gmail credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_PASSWORD, // your Gmail App Password
      },
    });

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .total { background: #FF6B35; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .button { background: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏖️ Booking Confirmation</h1>
            <p>Staycation Haven</p>
          </div>
          
          <div class="content">
            <h2>Dear ${bookingData.firstName} ${bookingData.lastName},</h2>
            <p>Thank you for choosing Staycation Haven! Your booking has been received and is pending confirmation.</p>
            
            <div class="booking-details">
              <h3>📋 Booking Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingData.bookingId}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Room:</span>
                <span class="detail-value">${bookingData.roomName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Check-in:</span>
                <span class="detail-value">${bookingData.checkInDate} at ${bookingData.checkInTime}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Check-out:</span>
                <span class="detail-value">${bookingData.checkOutDate} at ${bookingData.checkOutTime}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Guests:</span>
                <span class="detail-value">${bookingData.guests}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${bookingData.paymentMethod === 'gcash' ? 'GCash' : 'Bank Transfer'}</span>
              </div>
            </div>
            
            <div class="total">
              💰 Downpayment: ₱${bookingData.downPayment} | Total: ₱${bookingData.totalAmount}
            </div>
            
            <h3>⚠️ Important Notes:</h3>
            <ul>
              <li>Your booking will be confirmed once we verify your payment</li>
              <li>Please keep this email for your records</li>
              <li>Bring a valid ID during check-in</li>
              <li>Check-in time starts at ${bookingData.checkInTime}</li>
            </ul>
            
            <center>
              <a href="http://localhost:3000" class="button">Visit Our Website</a>
            </center>
          </div>
          
          <div class="footer">
            <p>📧 For inquiries, contact us at: staycationhaven@gmail.com</p>
            <p>📞 Phone: +63 123 456 7890</p>
            <p>&copy; 2025 Staycation Haven. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"Staycation Haven" <${process.env.EMAIL_USER}>`,
      to: bookingData.email,
      subject: `Booking Confirmation - ${bookingData.bookingId}`,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}