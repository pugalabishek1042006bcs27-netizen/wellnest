package com.wellnest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(
        EmailService.class
    );
    private static final String BREVO_API_URL =
        "https://api.brevo.com/v3/smtp/email";

    private final RestTemplate restTemplate;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${spring.mail.username:wellnest@example.com}")
    private String senderEmail;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendVerificationEmail(String to, String code) {
        String subject = "WellNest - Email Verification";
        String htmlBody = buildVerificationEmailTemplate(code);
        sendViaBrevo(to, subject, htmlBody);
    }

    public void sendResetEmail(String to, String code) {
        String subject = "WellNest - Password Reset";
        String resetLink =
            frontendUrl + "/reset-password?email=" + to + "&token=" + code;
        String htmlBody = buildResetEmailTemplate(resetLink);
        sendViaBrevo(to, subject, htmlBody);
    }

    public void sendFriendRequestEmail(
        String to,
        String requesterName,
        String requesterEmail
    ) {
        String subject = "WellNest - New Friend Request";
        String friendsLink = frontendUrl + "/friends";
        String htmlBody = buildFriendRequestEmailTemplate(
            requesterName,
            requesterEmail,
            friendsLink
        );
        sendViaBrevo(to, subject, htmlBody);
    }

    private void sendViaBrevo(String to, String subject, String htmlBody) {
        String apiKey = System.getenv("BREVO_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("BREVO_API_KEY not set - skipping email to {}", to);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, String> sender = new HashMap<>();
            sender.put("name", "WellNest");
            sender.put("email", senderEmail);

            Map<String, String> recipient = new HashMap<>();
            recipient.put("email", to);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", sender);
            body.put("to", List.of(recipient));
            body.put("subject", subject);
            body.put("htmlContent", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(
                body,
                headers
            );
            ResponseEntity<String> response = restTemplate.postForEntity(
                BREVO_API_URL,
                request,
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Email sent successfully to: {}", to);
            } else {
                log.error(
                    "Brevo API error: {} - {}",
                    response.getStatusCode(),
                    response.getBody()
                );
                throw new RuntimeException(
                    "Email API returned error: " + response.getBody()
                );
            }
        } catch (Exception e) {
            log.error("Email send failed to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildVerificationEmailTemplate(String code) {
        return (
            "<!DOCTYPE html>" +
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
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>Email Verification</h2>" +
            "<p style='margin:0 0 24px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "Thank you for signing up with WellNest! Please use the verification code below to activate your account:" +
            "</p>" +
            "<div style='background:linear-gradient(135deg,rgba(16,185,129,0.14),rgba(14,165,166,0.12));border-radius:12px;padding:24px;text-align:center;margin:24px 0;'>" +
            "<p style='margin:0 0 8px;color:#5f6a67;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Your Verification Code</p>" +
            "<p style='margin:0;font-size:36px;font-weight:700;color:#0ea5a6;letter-spacing:4px;'>" +
            code +
            "</p>" +
            "</div>" +
            "<p style='margin:24px 0 0;color:#5f6a67;font-size:14px;line-height:1.5;'>" +
            "<strong>Note:</strong> This code is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email." +
            "</p>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>© 2026 WellNest. All rights reserved.</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>"
        );
    }

    private String buildResetEmailTemplate(String resetLink) {
        return (
            "<!DOCTYPE html>" +
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
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>Password Reset Request</h2>" +
            "<p style='margin:0 0 24px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "We received a request to reset your password. Click the button below to create a new password:" +
            "</p>" +
            "<div style='text-align:center;margin:32px 0;'>" +
            "<a href='" +
            resetLink +
            "' style='display:inline-block;background:linear-gradient(90deg,#1aa260,#10b981);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;'>Reset Password</a>" +
            "</div>" +
            "<p style='margin:16px 0 0;color:#999;font-size:12px;line-height:1.4;'>" +
            "If the button doesn't work, copy this link: <a href='" +
            resetLink +
            "' style='color:#0ea5a6;word-break:break-all;'>" +
            resetLink +
            "</a>" +
            "</p>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>© 2026 WellNest. All rights reserved.</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>"
        );
    }

    private String buildFriendRequestEmailTemplate(
        String requesterName,
        String requesterEmail,
        String friendsLink
    ) {
        return (
            "<!DOCTYPE html>" +
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
            "<h2 style='margin:0 0 16px;color:#1c1e1d;font-size:22px;'>New Friend Request</h2>" +
            "<p style='margin:0 0 20px;color:#5f6a67;font-size:15px;line-height:1.6;'>" +
            "<strong>" +
            requesterName +
            "</strong> (" +
            requesterEmail +
            ") has sent you a friend request on WellNest." +
            "</p>" +
            "<div style='text-align:center;margin:32px 0;'>" +
            "<a href='" +
            friendsLink +
            "' style='display:inline-block;background:linear-gradient(90deg,#1aa260,#10b981);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:700;'>View Friend Requests</a>" +
            "</div>" +
            "</td></tr>" +
            "<tr style='background-color:#f7f5ef;'><td style='padding:24px 32px;text-align:center;'>" +
            "<p style='margin:0;color:#5f6a67;font-size:13px;'>© 2026 WellNest. All rights reserved.</p>" +
            "</td></tr>" +
            "</table>" +
            "</td></tr></table>" +
            "</body></html>"
        );
    }
}
