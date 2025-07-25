using MarkAgent.Application.DTOs.Captcha;

namespace MarkAgent.Application.Services;

public interface ICaptchaService
{
    /// <summary>
    /// 生成验证码
    /// </summary>
    /// <returns>验证码响应</returns>
    Task<CaptchaResponse> GenerateCaptchaAsync();
    
    /// <summary>
    /// 验证验证码
    /// </summary>
    /// <param name="captchaId">验证码ID</param>
    /// <param name="userInput">用户输入</param>
    /// <returns>是否验证成功</returns>
    Task<bool> ValidateCaptchaAsync(string captchaId, string userInput);
    
    /// <summary>
    /// 刷新验证码
    /// </summary>
    /// <param name="captchaId">原验证码ID</param>
    /// <returns>新的验证码响应</returns>
    Task<CaptchaResponse> RefreshCaptchaAsync(string captchaId);
}