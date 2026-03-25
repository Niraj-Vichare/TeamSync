import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/context/AuthContext"
import authService from "@/services/auth"

export function LoginForm({ className, ...props }) {
  const { login, getCurrentWorkspaceId } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [open, setOpen] = useState(false)

  // -------------------------
  // EMAIL LOGIN
  // -------------------------
  const handleEmailLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Email and password are required.")
      return
    }

    try {
      setLoading(true)

      const response = await login({ email, password })

      if (!response?.success) {
        throw new Error(response?.message || "Invalid credentials")
      }

      const workspaceId = getCurrentWorkspaceId()

      toast.success("Logged in successfully")

      if (!workspaceId) {
        navigate("/workspace/create-workspace")
      } else {
        navigate("/")
      }
    } catch (err) {
      toast.error(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // GOOGLE LOGIN
  // -------------------------
  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider("google")

      const response = await authService.signInWithGoogle()

      if (!response?.success) {
        throw new Error("Google login failed")
      }

      const workspaceId = getCurrentWorkspaceId()

      if (!workspaceId) {
        navigate("/workspace/create-workspace")
      } else {
        navigate("/")
      }
    } catch (err) {
      toast.error(err?.message || "Google login failed")
    } finally {
      setLoadingProvider(null)
    }
  }

  // -------------------------
  // PASSWORD RESET
  // -------------------------
  const handleSendResetLink = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address.")
      return
    }

    try {
      await authService.sendResetLink(resetEmail)
      toast.success("Reset link sent successfully.")
      setOpen(false)
      setResetEmail("")
    } catch (err) {
      toast.error(err?.message || "Failed to send reset link.")
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center flex-col gap-5 min-h-screen px-4",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-3xl rounded-xl shadow-lg overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleEmailLogin} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground">
                  Login to your Flowstate account
                </p>
              </div>

              {/* EMAIL */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>

                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                        <DialogDescription>
                          Enter your email and we’ll send reset instructions.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="mt-4">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                      </div>

                      <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSendResetLink}>
                          Send Reset Link
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                className="w-full text-white"
                disabled={loading}
              >
                {loading && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              {/* DIVIDER */}
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:border-t">
                <span className="bg-card relative z-10 px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>

              {/* GOOGLE */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loadingProvider === "google"}
              >
                {loadingProvider === "google" ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login with Google"
                )}
              </Button>

              {/* SIGNUP */}
              <div className="text-center text-sm">
                Don’t have an account?{" "}
                <a href="/Auth/Signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>

          {/* RIGHT SIDE IMAGE */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Login visual"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs">
        By continuing, you agree to our Terms and Privacy Policy.
      </div>
    </div>
  )
}