import { LoginForm } from "@/components/auth/login-form"

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MarkAgent</h1>
          <p className="text-muted-foreground mt-2">
            智能任务管理与MCP协议集成平台
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}