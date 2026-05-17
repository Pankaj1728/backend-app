import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

export const sendEmail = async (options: EmailOptions) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured');
            return { success: false, error: 'Email credentials not configured' };
        }

        const transporter = getTransporter();

        const mailOptions = {
            from: `"CRM System" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

export const generateStaffWelcomeEmail = (staffData: {
    name: string;
    email: string;
    username: string;
}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CRM Team</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,112C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
            background-size: cover;
            opacity: 0.3;
        }
        .header h1 {
            color: white;
            font-size: 32px;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
            position: relative;
            z-index: 1;
        }
        .profile-section {
            text-align: center;
            padding: 40px 30px;
            background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
        }
        .welcome-text {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .credentials-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 30px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        .credentials-title {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        .credential-item {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 15px 20px;
            margin-bottom: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .credential-item:last-child {
            margin-bottom: 0;
        }
        .credential-label {
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        .credential-value {
            color: white;
            font-size: 16px;
            font-weight: 600;
            word-break: break-all;
        }
        .info-section {
            padding: 30px;
            color: #555;
            line-height: 1.8;
        }
        .info-section p {
            margin-bottom: 15px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        @media only screen and (max-width: 600px) {
            .header h1 {
                font-size: 24px;
            }
            .credentials-box {
                margin: 20px 15px;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p>Welcome to Our Amazing Team</p>
        </div>
        
        <div class="profile-section">
            <div class="welcome-text">Welcome, ${staffData.name}! 👋</div>
            <div class="subtitle">You've been added as a Staff Member</div>
        </div>

        <div class="credentials-box">
            <div class="credentials-title">🔐 Your Login Credentials</div>
            <div class="credential-item">
                <div class="credential-label">Email</div>
                <div class="credential-value">${staffData.email}</div>
            </div>
            <div class="credential-item">
                <div class="credential-label">Username</div>
                <div class="credential-value">${staffData.username}</div>
            </div>
        </div>

        <div class="info-section">
            <p><strong>Dear ${staffData.name},</strong></p>
            <p>We're thrilled to have you join our team! Your account has been successfully created and you can now access the CRM system.</p>
            <p>🔒 <strong>Important Security Note:</strong> Your temporary password has been set by the administrator. Please contact them to get your password and change it after your first login for security purposes.</p>
            <p>✨ <strong>What's Next?</strong></p>
            <ul style="margin-left: 20px; margin-bottom: 20px;">
                <li>Contact the administrator to get your temporary password</li>
                <li>Log in to your account using the credentials above</li>
                <li>Change your password immediately after first login</li>
                <li>Complete your profile information</li>
                <li>Explore the dashboard and familiarize yourself with the system</li>
                <li>Start managing your assigned users</li>
            </ul>
            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="cta-button" style="color: white;">
                    Access CRM System →
                </a>
            </center>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to your administrator.</p>
        </div>

        <div class="footer">
            <p><strong>CRM Management System</strong></p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 20px;">
                © ${new Date().getFullYear()} CRM System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export const generateAdminNotificationEmail = (staffData: {
    name: string;
    email: string;
    username: string;
}, adminName: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Staff Member Added</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .staff-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 15px;
            padding: 30px;
            margin: 20px 0;
            text-align: center;
        }
        .staff-name {
            color: #333;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .staff-info {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            text-align: left;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #6c757d;
            font-weight: 600;
        }
        .info-value {
            color: #333;
        }
        .success-badge {
            display: inline-block;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Staff Member Added</h1>
            <p>Staff successfully added to the system</p>
        </div>
        
        <div class="content">
            <p style="color: #333; margin-bottom: 20px;">
                <strong>Hello ${adminName},</strong>
            </p>
            <p style="color: #666; margin-bottom: 30px;">
                You have successfully added a new staff member to the CRM system. Here are the details:
            </p>

            <div class="staff-card">
                <div class="staff-name">${staffData.name}</div>
                <div class="success-badge">✓ Account Created</div>
                
                <div class="staff-info">
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${staffData.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Username:</span>
                        <span class="info-value">${staffData.username}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Role:</span>
                        <span class="info-value">Staff Member</span>
                    </div>
                </div>
            </div>

            <p style="color: #666; margin-top: 30px;">
                📧 <strong>Email Notification:</strong> A welcome email has been sent to ${staffData.email}.
            </p>
            <p style="color: #666; margin-top: 15px;">
                🔐 Please provide the temporary password to the staff member securely.
            </p>
        </div>

        <div class="footer">
            <p><strong>CRM Management System</strong></p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 15px;">
                © ${new Date().getFullYear()} CRM System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export const generatePasswordChangeEmail = (userData: {
    name: string;
    email: string;
    changedBy: string;
}) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
        }
        .icon-section {
            text-align: center;
            padding: 40px 30px 20px;
        }
        .icon-circle {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);
        }
        .content {
            padding: 20px 40px 40px;
        }
        .alert-box {
            background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
            border-left: 4px solid #f5576c;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .alert-title {
            color: #d32f2f;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .alert-content {
            color: #666;
            line-height: 1.6;
        }
        .info-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #6c757d;
            font-weight: 600;
        }
        .info-value {
            color: #333;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white !important;
            text-decoration: none;
            padding: 15px 40px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
            box-shadow: 0 10px 30px rgba(240, 147, 251, 0.3);
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Changed</h1>
            <p>Your password has been updated successfully</p>
        </div>
        
        <div class="icon-section">
            <div class="icon-circle">✓</div>
        </div>

        <div class="content">
            <p style="color: #333; margin-bottom: 20px;">
                <strong>Hello ${userData.name},</strong>
            </p>
            <p style="color: #666; margin-bottom: 20px;">
                This email confirms that your password was successfully changed.
            </p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Account:</span>
                    <span class="info-value">${userData.email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Changed By:</span>
                    <span class="info-value">${userData.changedBy}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date & Time:</span>
                    <span class="info-value">${new Date().toLocaleString()}</span>
                </div>
            </div>

            <div class="alert-box">
                <div class="alert-title">⚠️ Didn't change your password?</div>
                <div class="alert-content">
                    If you did not make this change, your account may have been compromised. Please contact your administrator immediately and change your password as soon as possible.
                </div>
            </div>

            <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="cta-button" style="color: white;">
                    Access CRM System →
                </a>
            </center>

            <p style="color: #999; font-size: 14px; margin-top: 30px;">
                This is a security notification. If you did not request this change, please contact support immediately.
            </p>
        </div>

        <div class="footer">
            <p><strong>CRM Management System</strong></p>
            <p>This is an automated security notification.</p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 15px;">
                © ${new Date().getFullYear()} CRM System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};

export const generateAdminPasswordChangeNotification = (staffData: {
    name: string;
    email: string;
    changedBy: string;
}, adminName: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Password Changed</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 28px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .notification-box {
            background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
        }
        .notification-title {
            color: #00695c;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }
        .info-box {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #6c757d;
            font-weight: 600;
        }
        .info-value {
            color: #333;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Password Change Alert</h1>
            <p>Staff member password updated</p>
        </div>
        
        <div class="content">
            <p style="color: #333; margin-bottom: 20px;">
                <strong>Hello ${adminName},</strong>
            </p>
            <p style="color: #666; margin-bottom: 30px;">
                This is a notification that a staff member's password has been changed in the CRM system.
            </p>

            <div class="notification-box">
                <div class="notification-title">📋 Change Details</div>
                
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Staff Member:</span>
                        <span class="info-value">${staffData.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${staffData.email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Changed By:</span>
                        <span class="info-value">${staffData.changedBy}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date & Time:</span>
                        <span class="info-value">${new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <p style="color: #666; margin-top: 30px;">
                🔒 The staff member has been notified about this password change via email.
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 15px;">
                This is an automated security notification for your awareness.
            </p>
        </div>

        <div class="footer">
            <p><strong>CRM Management System</strong></p>
            <p style="font-size: 12px; color: #adb5bd; margin-top: 15px;">
                © ${new Date().getFullYear()} CRM System. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
};
