import { supabase } from "@/lib/supabase/client"
import { FcGoogle } from "react-icons/fc"
import { Button } from "./ui/button"

export default function SocialLogin() {
  const handleGoogleLogin = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex w-full justify-center py-4">
      <Button
        variant="outline"
        type="button"
        className="h-12 w-full rounded-xl"
        onClick={handleGoogleLogin}
      >
        <FcGoogle />
        Login with Google
      </Button>
    </div>
  )
}
