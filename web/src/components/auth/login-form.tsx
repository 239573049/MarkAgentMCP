import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Captcha } from "@/components/ui/captcha"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { apiClient, type LoginRequest } from "@/lib/api-client"
import { useNavigate, Link } from "react-router-dom"

interface LoginFormProps {
  className?: string
  onSuccess?: (token: string) => void
}

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // 表单数据
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    rememberMe: false,
    captchaAnswer: ''
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
    }
    
    if (!formData.captchaAnswer) {
      errors.captcha = '请输入验证码'
    } else if (formData.captchaAnswer.length !== 4) {
      errors.captcha = '验证码长度为4位'
    }
    
    if (!captchaId) {
      errors.captcha = '验证码未加载，请刷新'
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
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        captchaId: captchaId!,
        captchaAnswer: formData.captchaAnswer
      }

      const response = await apiClient.auth.login(loginData)
      
      if (response.success && response.data) {
        // 设置token
        apiClient.setToken(response.data.token)
        
        // 调用成功回调
        onSuccess?.(response.data.token)
        
        // 跳转到仪表板
        navigate('/dashboard')
      } else {
        setError(response.message || '登录失败，请重试')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // 如果是验证码错误，显示验证码错误
      if (error.message?.includes('captcha') || error.message?.includes('验证码')) {
        setCaptchaError('验证码错误，请重新输入')
      } else {
        setError('登录失败，请检查邮箱和密码')
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

  return (
    <div className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
          <CardDescription>
            登录到您的 MarkAgent 账户
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

            {/* 邮箱 */}
            <div className="space-y-2">
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(fieldErrors.email && "border-destructive")}
                disabled={isLoading}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  忘记密码？
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="输入您的密码"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(fieldErrors.password && "border-destructive")}
                  disabled={isLoading}
                  autoComplete="current-password"
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
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
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

            {/* 记住我 */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => 
                  handleInputChange('rememberMe', Boolean(checked))
                }
                disabled={isLoading}
              />
              <Label 
                htmlFor="remember" 
                className="text-sm font-normal"
              >
                记住我
              </Label>
            </div>

            {/* 登录按钮 */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>

            {/* 注册链接 */}
            <div className="text-center text-sm">
              还没有账户？{" "}
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 使用条款 */}
      <div className="text-center text-xs text-muted-foreground">
        登录即表示您同意我们的{" "}
        <Link to="/terms" className="underline hover:text-primary">
          服务条款
        </Link>{" "}
        和{" "}
        <Link to="/privacy" className="underline hover:text-primary">
          隐私政策
        </Link>
      </div>
    </div>
  )
}