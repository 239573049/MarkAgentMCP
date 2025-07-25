namespace MarkAgent.Application.DTOs.Captcha;

public class CaptchaResponse
{
    /// <summary>
    /// 验证码唯一标识
    /// </summary>
    public string CaptchaId { get; set; } = string.Empty;
    
    /// <summary>
    /// 验证码图片Base64编码
    /// </summary>
    public string ImageBase64 { get; set; } = string.Empty;
    
    /// <summary>
    /// 过期时间
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}