using System.Net;
using System.Net.Mail;
using Pharse2.Services.Interfaces;

namespace Pharse2.Services.Implement
{
    // Gửi email qua SMTP (cấu hình mục "Smtp").
    // Dev với Docker: Mailpit hứng email, xem tại http://localhost:8025.
    // Chưa cấu hình Smtp:Host (vd. chạy bằng Visual Studio) → chỉ ghi log nội dung email để vẫn lấy được link.
    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            var smtp = _configuration.GetSection("Smtp");
            var host = smtp["Host"];
            if (string.IsNullOrWhiteSpace(host))
            {
                _logger.LogWarning("Chưa cấu hình Smtp:Host, email không được gửi. To: {To} | Subject: {Subject} | Body: {Body}",
                    toEmail, subject, htmlBody);
                return;
            }

            using var message = new MailMessage
            {
                From = new MailAddress(smtp["From"] ?? "no-reply@threads.local", smtp["FromName"] ?? "Threads"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            using var client = new SmtpClient(host, smtp.GetValue("Port", 25))
            {
                EnableSsl = smtp.GetValue("EnableSsl", false)
            };
            if (!string.IsNullOrEmpty(smtp["Username"]))
            {
                client.Credentials = new NetworkCredential(smtp["Username"], smtp["Password"]);
            }
            await client.SendMailAsync(message);
        }
    }
}
