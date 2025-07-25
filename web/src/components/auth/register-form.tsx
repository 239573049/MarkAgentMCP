import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Captcha } from "@/components/ui/captcha"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { apiClient, type RegisterRequest } from "@/lib/api-client"
import { useNavigate, Link } from "react-router-dom"

interface RegisterFormProps {
  className?: string
  onSuccess?: (token: string) => void
}

export function RegisterForm({ className, onSuccess }: RegisterFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  // 表单数据
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    captchaAnswer: '',
    agreeToTerms: false
  })
  
  // 验证码相关
  const [captchaId, setCaptchaId] = React.useState<string | null>(null)
  const [captchaError, setCaptchaError] = React.useState<string | null>(null)

  // 表单验证
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.email) {
      errors.email = '请输入邮箱地址'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址'
    }
    
    if (!formData.password) {
      errors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6位'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '密码需包含大小写字母和数字'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    }
    
    if (!formData.captchaAnswer) {
      errors.captcha = '请输入验证码'
    } else if (formData.captchaAnswer.length !== 4) {
      errors.captcha = '验证码长度为4位'
    }
    
    if (!captchaId) {
      errors.captcha = '验证码未加载，请刷新'
    }
    
    if (!formData.agreeToTerms) {
      errors.terms = '请同意服务条款和隐私政策'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCaptchaError(null)
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        captchaId: captchaId!,
        captchaAnswer: formData.captchaAnswer
      }

      const response = await apiClient.auth.register(registerData)
      
      if (response.success && response.data) {
        setSuccess(true)
        
        // 3秒后跳转到登录页面
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        
      } else {
        setError(response.message || '注册失败，请重试')
      }
    } catch (error: any) {
      console.error('Register error:', error)
      
      // 如果是验证码错误，显示验证码错误
      if (error.message?.includes('captcha') || error.message?.includes('验证码')) {
        setCaptchaError('验证码错误，请重新输入')
      } else if (error.message?.includes('email') || error.message?.includes('邮箱')) {
        setError('该邮箱已被注册，请使用其他邮箱')
      } else {
        setError('注册失败，请重试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除对应字段的错误
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 密码强度检查
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-green-700">注册成功！</h2>
                <p className="text-muted-foreground mt-2">
                  我们已向您的邮箱发送了验证邮件，请查收并点击验证链接完成邮箱验证。
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                3秒后自动跳转到登录页面...
              </div>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                立即登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
          <CardDescription>
            注册 MarkAgent 账户，开始使用智能任务管理
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 全局错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 姓名 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">姓名 (可选)</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="姓"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">　</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="名"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(fieldErrors.email && "border-destructive")}
                disabled={isLoading}
                autoComplete="email"
                required
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="设置您的密码"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(fieldErrors.password && "border-destructive")}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* 密码强度指示器 */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded",
                          passwordStrength >= level
                            ? passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    密码强度：{
                      passwordStrength <= 2 ? '弱' :
                      passwordStrength <= 3 ? '中' : '强'
                    }
                  </p>
                </div>
              )}
              
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {/* 确认密码 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={cn(fieldErrors.confirmPassword && "border-destructive")}
                  disabled={isLoading}
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* 验证码 */}
            <Captcha
              value={formData.captchaAnswer}
              onChange={(value) => handleInputChange('captchaAnswer', value)}
              captchaId={captchaId}
              onCaptchaChange={setCaptchaId}
              error={captchaError || fieldErrors.captcha}
            />

            {/* 同意条款 */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    handleInputChange('agreeToTerms', Boolean(checked))
                  }
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm font-normal leading-relaxed"
                >
                  我已阅读并同意{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    服务条款
                  </Link>{" "}
                  和{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    隐私政策
                  </Link>
                </Label>
              </div>
              {fieldErrors.terms && (
                <p className="text-sm text-destructive">{fieldErrors.terms}</p>
              )}
            </div>

            {/* 注册按钮 */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '创建账户'
              )}
            </Button>

            {/* 登录链接 */}
            <div className="text-center text-sm">
              已有账户？{" "}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}