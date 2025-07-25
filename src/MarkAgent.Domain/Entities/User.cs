using MarkAgent.Domain.Common;
using MarkAgent.Domain.ValueObjects;

namespace MarkAgent.Domain.Entities;

public class User : Entity
{
    public Email Email { get; private set; }
    public string PasswordHash { get; private set; }
    public UserKey UserKey { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public string? EmailVerificationToken { get; private set; }
    public DateTime? EmailVerificationTokenExpiry { get; private set; }
    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }
    public bool IsActive { get; private set; }

    // Navigation properties
    public ICollection<TodoItem> TodoItems { get; private set; } = new List<TodoItem>();
    public ICollection<ConversationSession> ConversationSessions { get; private set; } = new List<ConversationSession>();

    private User() { } // For EF Core

    public User(Email email, string passwordHash, UserKey? userKey = null)
    {
        Email = email;
        PasswordHash = passwordHash;
        UserKey = userKey ?? ValueObjects.UserKey.GenerateNew();
        IsEmailVerified = false;
        IsActive = true;
    }

    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        ClearPasswordResetToken();
        UpdateTimestamp();
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
        UpdateTimestamp();
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
        UpdateTimestamp();
    }

    public bool IsPasswordResetTokenValid(string token)
    {
        return PasswordResetToken == token && 
               PasswordResetTokenExpiry.HasValue && 
               PasswordResetTokenExpiry.Value > DateTime.UtcNow;
    }

    public void SetEmailVerificationToken(string token, DateTime expiry)
    {
        EmailVerificationToken = token;
        EmailVerificationTokenExpiry = expiry;
        UpdateTimestamp();
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        EmailVerificationToken = null;
        EmailVerificationTokenExpiry = null;
        UpdateTimestamp();
    }

    public bool IsEmailVerificationTokenValid(string token)
    {
        return EmailVerificationToken == token && 
               EmailVerificationTokenExpiry.HasValue && 
               EmailVerificationTokenExpiry.Value > DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdateTimestamp();
    }

    public void Activate()
    {
        IsActive = true;
        UpdateTimestamp();
    }
}