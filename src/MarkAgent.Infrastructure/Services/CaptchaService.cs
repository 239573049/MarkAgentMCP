using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using SkiaSharp;
using MarkAgent.Application.Services;
using MarkAgent.Application.DTOs.Captcha;

namespace MarkAgent.Infrastructure.Services;

public class CaptchaService : ICaptchaService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<CaptchaService> _logger;
    private static readonly Random _random = new();
    
    private const int CaptchaWidth = 120;
    private const int CaptchaHeight = 40;
    private const int ExpirationMinutes = 5;

    public CaptchaService(IMemoryCache cache, ILogger<CaptchaService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<CaptchaResponse> GenerateCaptchaAsync()
    {
        var captchaId = Guid.NewGuid().ToString("N");
        var captchaText = GenerateRandomText(4);
        var imageBase64 = await GenerateCaptchaImageAsync(captchaText);
        var expiresAt = DateTime.UtcNow.AddMinutes(ExpirationMinutes);
        
        // 缓存验证码答案
        _cache.Set($"captcha:{captchaId}", captchaText.ToLowerInvariant(), 
            TimeSpan.FromMinutes(ExpirationMinutes));
        
        _logger.LogInformation("Generated captcha {CaptchaId}", captchaId);
        
        return new CaptchaResponse
        {
            CaptchaId = captchaId,
            ImageBase64 = imageBase64,
            ExpiresAt = expiresAt
        };
    }

    public async Task<bool> ValidateCaptchaAsync(string captchaId, string userInput)
    {
        try
        {
            var cacheKey = $"captcha:{captchaId}";
            if (!_cache.TryGetValue(cacheKey, out string? storedAnswer))
            {
                _logger.LogWarning("Captcha {CaptchaId} not found or expired", captchaId);
                return false;
            }

            var isValid = string.Equals(storedAnswer, userInput?.ToLowerInvariant(), 
                StringComparison.OrdinalIgnoreCase);
            
            // 验证后删除验证码（防止重复使用）
            _cache.Remove(cacheKey);
            
            _logger.LogInformation("Captcha {CaptchaId} validation result: {IsValid}", 
                captchaId, isValid);
            
            return await Task.FromResult(isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating captcha {CaptchaId}", captchaId);
            return false;
        }
    }

    public async Task<CaptchaResponse> RefreshCaptchaAsync(string captchaId)
    {
        // 删除旧验证码
        _cache.Remove($"captcha:{captchaId}");
        
        // 生成新验证码
        return await GenerateCaptchaAsync();
    }

    private static string GenerateRandomText(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    private async Task<string> GenerateCaptchaImageAsync(string text)
    {
        return await Task.Run(() =>
        {
            using var surface = SKSurface.Create(new SKImageInfo(CaptchaWidth, CaptchaHeight));
            var canvas = surface.Canvas;
            
            // 清除画布
            canvas.Clear(SKColors.White);
            
            // 添加背景噪点
            AddNoise(canvas);
            
            // 绘制文字
            DrawText(canvas, text);
            
            // 添加干扰线
            AddInterferenceLines(canvas);
            
            // 转换为图片
            using var image = surface.Snapshot();
            using var data = image.Encode(SKEncodedImageFormat.Png, 100);
            
            return Convert.ToBase64String(data.ToArray());
        });
    }

    private static void AddNoise(SKCanvas canvas)
    {
        using var paint = new SKPaint
        {
            Color = SKColors.LightGray,
            StrokeWidth = 1
        };

        for (int i = 0; i < 100; i++)
        {
            var x = _random.Next(CaptchaWidth);
            var y = _random.Next(CaptchaHeight);
            canvas.DrawPoint(x, y, paint);
        }
    }

    private static void DrawText(SKCanvas canvas, string text)
    {
        using var paint = new SKPaint
        {
            Color = SKColors.Black,
            TextSize = 24,
            IsAntialias = true,
            Typeface = SKTypeface.FromFamilyName("Arial", SKFontStyle.Bold)
        };

        var x = 10f;
        var y = 28f;
        
        foreach (char c in text)
        {
            // 随机倾斜角度
            var angle = (_random.NextSingle() - 0.5f) * 30;
            
            canvas.Save();
            canvas.RotateDegrees(angle, x + 10, y);
            
            // 随机颜色
            var colors = new[] { SKColors.Black, SKColors.DarkBlue, SKColors.DarkRed, SKColors.DarkGreen };
            paint.Color = colors[_random.Next(colors.Length)];
            
            canvas.DrawText(c.ToString(), x, y, paint);
            canvas.Restore();
            
            x += 20;
        }
    }

    private static void AddInterferenceLines(SKCanvas canvas)
    {
        using var paint = new SKPaint
        {
            Color = SKColors.Gray,
            StrokeWidth = 1,
            IsAntialias = true
        };

        for (int i = 0; i < 5; i++)
        {
            var x1 = _random.Next(CaptchaWidth);
            var y1 = _random.Next(CaptchaHeight);
            var x2 = _random.Next(CaptchaWidth);
            var y2 = _random.Next(CaptchaHeight);
            
            canvas.DrawLine(x1, y1, x2, y2, paint);
        }
    }
}