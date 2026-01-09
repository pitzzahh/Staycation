import Login from "@/Components/Login";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Staycation Haven | Login",
  description: "Login to your account to continue.",
};  

const LoginPage = () => {
  return (
   <Login />
  )
}

export default LoginPage