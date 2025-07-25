using System.ComponentModel.DataAnnotations;

namespace MarkAgent.Application.DTOs.Authentication;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// 记住我
    /// </summary>
    public bool RememberMe { get; set; } = false;
    
    /// <summary>
    /// 验证码ID
    /// </summary>
    [Required]
    public string CaptchaId { get; set; } = string.Empty;
    
    /// <summary>
    /// 验证码答案
    /// </summary>
    [Required]
    public string CaptchaAnswer { get; set; } = string.Empty;
}