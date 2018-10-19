import { LoginPage } from "../util/router"
import { Credentials } from "../credentials"

export const Register = Credentials({
  method: "register",
  alternativePage: LoginPage,
  alternativeLabel: "Already have an account?",
  label: "Sign up",
  showUsername: true
})
