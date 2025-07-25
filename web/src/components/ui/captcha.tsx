import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiClient, type CaptchaResponse } from "@/lib/api-client"

interface CaptchaProps {
  value: string
  onChange: (value: string) => void
  captchaId: string | null
  onCaptchaChange: (captchaId: string) => void
  error?: string
  className?: string
}

export function Captcha({
  value,
  onChange,
  captchaId,
  onCaptchaChange,
  error,
  className
}: CaptchaProps) {
  const [captchaData, setCaptchaData] = React.useState<CaptchaResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // 初始化验证码
  React.useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.captcha.generate()
      if (response.success && response.data) {
        setCaptchaData(response.data)
        onCaptchaChange(response.data.captchaId)
      }
    } catch (error) {
      console.error('Failed to generate captcha:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshCaptcha = async () => {
    if (!captchaId) return
    
    setIsRefreshing(true)
    try {
      const response = await apiClient.captcha.refresh(captchaId)
      if (response.success && response.data) {
        setCaptchaData(response.data)
        onCaptchaChange(response.data.captchaId)
        onChange('') // 清空输入
      }
    } catch (error) {
      console.error('Failed to refresh captcha:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="captcha">验证码</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id="captcha"
            type="text"
            placeholder="请输入验证码"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(error && "border-destructive")}
            maxLength={4}
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* 验证码图片 */}
          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center w-[120px] h-[40px] bg-muted rounded border">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : captchaData ? (
              <img
                src={`data:image/png;base64,${captchaData.imageBase64}`}
                alt="验证码"
                className="w-[120px] h-[40px] border rounded cursor-pointer"
                onClick={refreshCaptcha}
                title="点击刷新验证码"
              />
            ) : (
              <div className="flex items-center justify-center w-[120px] h-[40px] bg-muted rounded border text-xs text-muted-foreground">
                加载失败
              </div>
            )}
          </div>
          
          {/* 刷新按钮 */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refreshCaptcha}
            disabled={isRefreshing || !captchaId}
            className="h-[40px] px-3"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground">
        看不清？点击图片或刷新按钮重新获取
      </p>
    </div>
  )
}