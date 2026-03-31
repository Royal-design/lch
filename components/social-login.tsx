import { FcGoogle } from "react-icons/fc"
import { Button } from "./ui/button"

export default function SocialLogin() {
  return (
    <div className="flex w-full justify-center py-4">
      <Button variant="outline" type="button" className="w-full py-5">
        <FcGoogle />
        Login with Google
      </Button>
    </div>
  )
}
