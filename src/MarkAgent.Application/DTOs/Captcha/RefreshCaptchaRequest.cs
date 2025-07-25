using System.ComponentModel.DataAnnotations;

namespace MarkAgent.Application.DTOs.Captcha;

public class RefreshCaptchaRequest
{
    [Required]
    public string CaptchaId { get; set; } = string.Empty;
}