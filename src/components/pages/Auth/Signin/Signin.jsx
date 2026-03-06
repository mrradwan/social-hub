import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "../../../lib/validationSchemas/authSchema";
import { signIn } from "../../../../services/authService";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FaArrowRightLong } from "react-icons/fa6";
import { toast } from "react-toastify";
import { AuthContext } from "../../../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {setToken } = useContext(AuthContext);
  async function submit(data) {
    try {
      const response = await signIn(data);

      if (response.success === true) {
        localStorage.setItem("userToken", response.data.token);
        setToken(response.data.token);
        toast.success("Welcome back!", {
          position: "top-right",
          autoClose: 2000,
          theme: "light",
        });

        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "incorrect email or password";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }
  return (
    <div className="signin-form bg-gray-100 py-12 min-h-screen flex justify-center items-center">
      <form
        className="w-full bg-white max-w-lg mx-auto p-8 rounded-2xl shadow space-y-5"
        onSubmit={handleSubmit(submit)}
      >
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <div className="flex gap-0.5 justify-center">
            <p className="text-gray-500">Don't have an account?</p>
            <Link
              className="text-blue-500 font-medium hover:underline"
              to="/register"
            >
              Sign up
            </Link>
          </div>
        </header>

        <div className="social-btns flex items-center gap-3 *:grow">
          <button
            type="button"
            className="btn flex items-center gap-1.5 justify-center hover:scale-105 transition-transform duration-200 border py-2 rounded-lg"
          >
            <FaGoogle className="text-red-500" />
            <span>Google</span>
          </button>
          <button
            type="button"
            className="btn flex items-center gap-1.5 justify-center bg-blue-500 text-white hover:scale-105 transition-transform duration-200 py-2 rounded-lg"
          >
            <FaFacebookF />
            <span>Facebook</span>
          </button>
        </div>

        <div className="relative text-center text-gray-400 text-sm py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <span className="relative bg-white px-2">or login with email</span>
        </div>

        <div className="form-controls space-y-4">
          <div>
            <Input
              {...register("email")}
              startContent={<IoMdMail className="text-gray-400" />}
              label="Email Address"
              placeholder="name@example.com"
              type="email"
              variant="bordered"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />
          </div>

          <div>
            <Input
              {...register("password")}
              startContent={<FaLock className="text-gray-400" />}
              label="Password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <FaEyeSlash className="text-xl text-default-400 pointer-events-none" />
                  ) : (
                    <FaEye className="text-xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
            className={`w-full py-3 font-bold flex items-center justify-center gap-2 transition-all duration-300 mt-2
              ${
                isValid
                  ? "bg-linear-to-r from-blue-600 to-blue-400 text-white shadow-lg hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
              }
            `}
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <>
                <span>Login</span>
                <FaArrowRightLong />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
