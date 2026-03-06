import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/react";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { regSchema } from "../../../lib/validationSchemas/authSchema";
import {
  FaLock,
  FaUser,
  FaTransgender,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { BsCalendarDateFill } from "react-icons/bs";
import { FaArrowRightLong } from "react-icons/fa6";
import { registerUser } from "../../../../services/authService";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(regSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repassword: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showReassword, setShowReassword] = useState(false);

  async function submit(data) {
    const formattedData = {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      rePassword: data.repassword,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
    };

    try {
      const response = await registerUser(formattedData);

      if (response.success === true || response.message === "account created") {
        toast.success("Account created successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      console.log(error);
    }
  }

  return (
    <div className="signup-form bg-gray-100 py-12 min-h-screen flex justify-center items-center">
      <form
        className="w-full bg-white max-w-lg mx-auto p-8 rounded-2xl shadow space-y-5"
        onSubmit={handleSubmit(submit)}
      >
        <header className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Create account</h2>
          <div className="flex gap-0.5 justify-center">
            <p>Already have an account?</p>
            <Link className="text-blue-400" to="/login">
              Sign in
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
          <span className="relative bg-white px-2">or continue with email</span>
        </div>

        <div className="form-controls space-y-4">
          <div>
            <Input
              {...register("name")}
              startContent={<FaUser className="text-gray-400" />}
              label="Full Name"
              placeholder="Enter your full name"
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
          </div>
          <div>
            <Input
              {...register("username")}
              startContent={<FaUser className="text-gray-400" />}
              label="User Name"
              placeholder="Enter your user name"
              isInvalid={!!errors.username}
              errorMessage={errors.username?.message}
            />
          </div>
          <div>
            <Input
              {...register("email")}
              startContent={<IoMdMail className="text-gray-400" />}
              label="Email Address"
              placeholder="name@example.com"
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
              type={showPassword ? "text" : "password"}
              endContent={
                showPassword ? (
                  <FaEyeSlash
                    className="text-gray-400 cursor-pointer text-xl"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                ) : (
                  <FaEye
                    className="text-gray-400 cursor-pointer text-xl"
                    onClick={() => setShowPassword(!showPassword)}
                  />
                )
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />
          </div>

          <div>
            <Input
              {...register("repassword")}
              startContent={<FaLock className="text-gray-400" />}
              label="Confirm Password"
              placeholder="Re-enter your password"
              type={showReassword ? "text" : "password"}
              endContent={
                showReassword ? (
                  <FaEyeSlash
                    className="text-gray-400 cursor-pointer text-xl"
                    onClick={() => setShowReassword(!showReassword)}
                  />
                ) : (
                  <FaEye
                    className="text-gray-400 cursor-pointer text-xl"
                    onClick={() => setShowReassword(!showReassword)}
                  />
                )
              }
              isInvalid={!!errors.repassword}
              errorMessage={errors.repassword?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <Input
                {...register("dateOfBirth")}
                startContent={<BsCalendarDateFill className="text-gray-400" />}
                type="date"
                label="Date Of Birth"
                isInvalid={!!errors.dateOfBirth}
                errorMessage={errors.dateOfBirth?.message}
              />
            </div>

            <div>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Gender"
                    placeholder="Gender"
                    startContent={<FaTransgender className="text-gray-400" />}
                    selectedKeys={field.value ? [field.value] : []}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isInvalid={!!errors.gender}
                    errorMessage={errors.gender?.message}
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                  </Select>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isValid || isSubmitting}
            className={`w-full py-3 font-bold flex items-center justify-center gap-2 transition-all duration-300
              ${
                isValid
                  ? "bg-linear-to-r from-blue-600 to-blue-400 text-white shadow-lg hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
              }
            `}
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <span>Create Account</span>
                <FaArrowRightLong />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
