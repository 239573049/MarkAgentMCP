using System.ComponentModel.DataAnnotations;

namespace MarkAgent.Application.DTOs.Authentication;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    /// <summary>
    /// 用户姓名（可选）
    /// </summary>
    public string? FirstName { get; set; }
    
    /// <summary>
    /// 用户姓氏（可选）
    /// </summary>
    public string? LastName { get; set; }
    
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