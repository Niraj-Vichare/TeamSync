import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { GalleryVerticalEnd, Loader2, Loader2Icon } from "lucide-react"
import { ModeToggle } from "../context/mode-toggle"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import authService from "@/services/auth"
import { checkPassword, validateEmail } from "@/lib/common"
import { useAuth } from "@/context/AuthContext"

export function Signup() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [displayName,setDisplayName]=useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider,setLoadingProvider] = useState();
  const [error, setError] = useState('');
  const [isChecked,setChecked] = useState(false);

  const navigate = useNavigate();
  const {signup} = useAuth();

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

  const handleSignup = async () => {
    // Validate first
    if (!validateEmail(email)) {
      toast.error("Invalid email");
      return;
    }
    if (!checkPassword(password)) {
      toast.error("Weak password");
      return;
    }
    if (!isChecked) {
      toast.error("Accept the terms");
      return;
    }

    setLoading(true);

    try {
      var signupData = {
        email: email,
        password: password,
        displayName: displayName
      }
      var response = await signup(signupData);
      if(response && response.success)
      {
        toast.success("Signed up successfully!");
        navigate("/workspace/create-workspace");
      }

    } catch (err) {
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };


  
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left section: Testimonial or graphic */}
      <div className="relative hidden lg:block bg-muted">
        <img
          src="/placeholder.svg" // Replace with your image path (e.g., /images/signup-side.jpg)
          alt="Signup Illustration"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

      {/* Right section: Signup form */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Branding */}
          <div className="flex items-center justify-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="font-medium text-lg">Flowstate</span>
          </div>

          {/* Headings */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground">
              Let’s get started. Fill in the details below to create your account.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" value={displayName} onChange={(e)=>setDisplayName(e.target.value)}/>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e)=>setEmail(e.target.value)}/>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e)=>setPassword(e.target.value)}/>
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={isChecked} onCheckedChange={setChecked} />

              <Label htmlFor="terms" className="text-sm leading-none">
                I agree to the <a href="#" className="underline">Terms & Conditions</a>
              </Label>
            </div>

            <Button
              type="button"
              className="w-full text-white"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing up..." : "Sign up"}
            </Button>

            <div className="relative text-center text-sm">
              <span className="bg-background relative z-10 px-2 text-muted-foreground">
                OR SIGN IN WITH
              </span>
              <div className="absolute inset-0 top-1/2 border-t border-border" />
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
                      Sigining in...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Signin with Google
                    </>
                  )}
                </Button>
          
                {/* <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                  Signin with Github
                </Button> */}
              </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            Already have an account?{" "}
            <a href="/Auth/Signin" className="underline underline-offset-4">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
