import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "../context/mode-toggle"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import authService from "@/services/auth"

export function LoginForm({
  className,
  ...props
}) {

  const { } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [open,setOpen] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail,setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProvider,setLoadingProvider] = useState();
    

  const handleSendResetLink = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    try {


      toast.success("Reset link sent to your email.");
      setOpen(false);

    } catch (err) {
      toast.error("Failed to send reset link.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoadingProvider("google");
      var response = await authService.signInWithGoogle();
      if(response && response.data){
        
      }
      //await loginWithGoogle();
    } catch (err) {
      console.error("Google login failed", err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGithubLogin = ()=>
  {
    try{
      setLoadingProvider("github");

    }catch(err){
      console.error("Github login failed",err);
    }finally{
      setLoadingProvider(null);
    }
  }
  

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

    } catch (error) {
      setError(error);
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex items-center justify-center flex-col gap-5  min-h-screen px-4", className)} {...props}>
      <Card className="w-full max-w-3xl rounded-xl shadow-lg overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Flowstate account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                        Forgot your password?
                      </a>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Your Password</DialogTitle>
                        <DialogDescription>
                          Please enter your email address and we’ll send you instructions to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-2">
                        <div className="grid flex-1 gap-2">
                          <div className="flex flex-col gap-2 mt-4">
                            <Input type="email" placeholder="Enter your email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)}/>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-emd">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSendResetLink}>Send Reset Link</Button>
                      </DialogFooter>

                    </DialogContent>

                  </Dialog>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full text-white">
                Login
              </Button>
              <div
                className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button
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
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Login with Google
                    </>
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGithubLogin}
                  disabled={loadingProvider === "github"}
                >
                  {loadingProvider === "github" ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                          fill="currentColor"
                        />
                      </svg>
                      Login with GitHub
                    </>
                  )}
                </Button> */}
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/Auth/Signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>
      <div
        className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
