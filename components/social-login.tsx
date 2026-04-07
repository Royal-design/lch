import { supabase } from "@/lib/supabase/client"
import { FcGoogle } from "react-icons/fc"
import { Button } from "./ui/button"

export default function SocialLogin() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex w-full justify-center py-4">
      <Button
        variant="outline"
        type="button"
        className="w-full py-5"
        onClick={handleGoogleLogin}
      >
        <FcGoogle />
        Login with Google
      </Button>
    </div>
  )
}
