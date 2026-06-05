package com.wellnest.service; 

import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender; // import mail sender
import org.springframework.mail.javamail.MimeMessageHelper; // import mime message helper
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage; // import mime message 

@Service 
public class EmailService { 

    private final JavaMailSender mailSender; 

    @Value("${frontend.url:http://localhost:3000}") // inject frontend url
    private String frontendUrl; 

    @Value("${spring.mail.username:}") // inject mail from address
    private String mailFrom; 

    @Autowired 
    public EmailService(JavaMailSender mailSender) { // constructor
        this.mailSender = mailSender; // assign mail sender
    } 

    public void sendVerificationEmail(String to, String code) { // send verification email
        String subject = "WellNest - Email Verification"; // email subject
        String htmlBody = buildVerificationEmailTemplate(code); // build HTML email
        sendHtmlEmail(to, subject, htmlBody); // send email
    } 

    public void sendResetEmail(String to, String code) { // send password reset email
        String subject = "WellNest - Password Reset"; // email subject
        String resetLink = frontendUrl + "/reset-password?email=" + to + "&token=" + code; // build reset link
        String htmlBody = buildResetEmailTemplate(resetLink); // build HTML email
        sendHtmlEmail(to, subject, htmlBody); // send email
    } 

    public void sendFriendRequestEmail(String to, String requesterName, String requesterEmail) {
        String subject = "WellNest - New Friend Request";
        String friendsLink = frontendUrl + "/friends";
        String htmlBody = buildFriendRequestEmailTemplate(requesterName, requesterEmail, friendsLink);
        sendHtmlEmail(to, subject, htmlBody);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) { // send HTML email
        try {
            MimeMessage message = mailSender.createMimeMessage(); // create mime message
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // create helper
            helper.setTo(to); // set recipient
            helper.setSubject(subject); // set subject
            helper.setText(htmlBody, true); // set HTML body
            if (mailFrom != null && !mailFrom.isBlank()) { // check for custom from address
                helper.setFrom(mailFrom); // set from address
            }
            mailSender.send(message); // send message
            System.out.println("Email sent to: " + to); 
        } catch (Exception e) { 
            System.err.println("Email failed: " + e.getMessage()); 
            throw new RuntimeException("Failed to send email", e); 
        } 
    }

    private String buildVerificationEmailTemplate(String code) {
        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
            "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f7fa;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f7fa;padding:40px 20px;'>" +
            "<tr><td align='center'>" +
            "<table width='600' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);'>" +
            "<tr style='background:linear-gradient(90deg,#0ea5a6,#10b981);'><td style='padding:32px;text-align:center;'>" +
            "<h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:700;'>🏥 WellNest</h1>" +
            "<p style='margin:8px 0 0;color:#ffffff;font-size:15px;'>Smart Health & Fitness Companion</p>" +
            "</td></tr>" +
            "<tr><td style='padding:40px 32px;'>" +
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>Email Verification</h2>" +
            "<p style='margin:0 0 24px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "Thank you for signing up with WellNest! Please use the verification code below to activate your account:" +
            "</p>" +
            "<div style='background:linear-gradient(135deg,rgba(16,185,129,0.14),rgba(14,165,166,0.12));border-radius:12px;padding:24px;text-align:center;margin:24px 0;'>" +
            "<p style='margin:0 0 8px;color:#5f6a67;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Your Verification Code</p>" +
            "<p style='margin:0;font-size:36px;font-weight:700;color:#0ea5a6;letter-spacing:4px;'>" + code + "</p>" +
            "</div>" +
            "<p style='margin:24px 0 0;color:#5f6a67;font-size:14px;line-height:1.5;'>" +
            "<strong>Note:</strong> This code is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email." +
            "</p>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>" +
            "© 2026 WellNest. All rights reserved.<br>Your partner in health and wellness." +
            "</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>";
    }

    private String buildResetEmailTemplate(String resetLink) {
        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
            "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f7fa;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f7fa;padding:40px 20px;'>" +
            "<tr><td align='center'>" +
            "<table width='600' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);'>" +
            "<tr style='background:linear-gradient(90deg,#0ea5a6,#10b981);'><td style='padding:32px;text-align:center;'>" +
            "<h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:700;'>🏥 WellNest</h1>" +
            "<p style='margin:8px 0 0;color:#ffffff;font-size:15px;'>Smart Health & Fitness Companion</p>" +
            "</td></tr>" +
            "<tr><td style='padding:40px 32px;'>" +
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>Password Reset Request</h2>" +
            "<p style='margin:0 0 24px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "We received a request to reset your password. Click the button below to create a new password:" +
            "</p>" +
            "<div style='text-align:center;margin:32px 0;'>" +
            "<a href='" + resetLink + "' style='display:inline-block;background:linear-gradient(90deg,#1aa260,#10b981);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;box-shadow:0 4px 12px rgba(16,185,129,0.3);'>" +
            "Reset Password" +
            "</a>" +
            "</div>" +
            "<p style='margin:24px 0 0;color:#5f6a67;font-size:14px;line-height:1.5;'>" +
            "<strong>Note:</strong> This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged." +
            "</p>" +
            "<p style='margin:16px 0 0;color:#999;font-size:12px;line-height:1.4;'>" +
            "If the button doesn't work, copy and paste this link into your browser:<br>" +
            "<a href='" + resetLink + "' style='color:#0ea5a6;word-break:break-all;'>" + resetLink + "</a>" +
            "</p>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>" +
            "© 2026 WellNest. All rights reserved.<br>Your partner in health and wellness." +
            "</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>";
    }

    private String buildFriendRequestEmailTemplate(String requesterName, String requesterEmail, String friendsLink) {
        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
            "<body style='margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f7fa;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f7fa;padding:40px 20px;'>" +
            "<tr><td align='center'>" +
            "<table width='600' cellpadding='0' cellspacing='0' style='background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);'>" +
            "<tr style='background:linear-gradient(90deg,#0ea5a6,#10b981);'><td style='padding:32px;text-align:center;'>" +
            "<h1 style='margin:0;color:#ffffff;font-size:28px;font-weight:700;'>WellNest</h1>" +
            "<p style='margin:8px 0 0;color:#ffffff;font-size:15px;'>Smart Health & Fitness Companion</p>" +
            "</td></tr>" +
            "<tr><td style='padding:40px 32px;'>" +
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>You have a new friend request</h2>" +
            "<p style='margin:0 0 20px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "<strong>" + requesterName + "</strong> (" + requesterEmail + ") has sent you a friend request on WellNest." +
            "</p>" +
            "<div style='text-align:center;margin:32px 0;'>" +
            "<a href='" + friendsLink + "' style='display:inline-block;background:linear-gradient(90deg,#1aa260,#10b981);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;box-shadow:0 4px 12px rgba(16,185,129,0.3);'>" +
            "View Friend Requests" +
            "</a>" +
            "</div>" +
            "<p style='margin:20px 0 0;color:#5f6a67;font-size:14px;line-height:1.5;'>" +
            "Open your Friends page to accept or reject this request." +
            "</p>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>" +
            "© 2026 WellNest. All rights reserved.<br>Your partner in health and wellness." +
            "</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>";
    }
} 
