import React, { useState } from "react";
import { LuKeyRound, LuEye, LuEyeOff } from "react-icons/lu"; 
import { FaSpinner } from "react-icons/fa"; 
import { toast } from "react-toastify";
import { changePassword } from "../../../services/settingsService"; 

export default function Setting() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    try {
      setIsLoading(true);
      
      const passwordData = {
        password: currentPassword,
        newPassword: newPassword,
      };

      const response = await changePassword(passwordData);
      
      console.log("Password changed successfully:", response);
      toast.success("Password updated successfully!");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      if (response.token) {
        localStorage.setItem("userToken", response.token);
      }

    } catch (error) {
      console.error("Error changing password:", error);
      
      let backendMessage = error.response?.data?.message || "";

      if (backendMessage.toLowerCase().includes("incorrect") || backendMessage.toLowerCase().includes("email")) {
        toast.error("The current password you entered is incorrect.");
      } else {
        toast.error(backendMessage || "Failed to update password. Please try again.");
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !currentPassword || !newPassword || !confirmPassword || isLoading;

  return (
    <>
      <div className="px-3 py-3.5">
        <main className="min-w-0">
          <div className="mx-auto max-w-2xl">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
                  <LuKeyRound />
                </span>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                    Change Password
                  </h1>
                  <p className="text-sm text-slate-500">
                    Keep your account secure by using a strong password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Current password
                  </span>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="Enter current password"
                      className="w-full rounded-xl border bg-slate-50 px-3 pr-10 py-2.5 text-sm text-slate-800 outline-none transition border-slate-200 focus:border-[#1877f2] focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1877f2] transition cursor-pointer"
                    >
                      {showCurrentPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    New password
                  </span>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-xl border bg-slate-50 px-3 pr-10 py-2.5 text-sm text-slate-800 outline-none transition border-slate-200 focus:border-[#1877f2] focus:bg-white"
                      required
                      minLength="8" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1877f2] transition cursor-pointer"
                    >
                      {showNewPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                    </button>
                  </div>
                  <span className="mt-1 block text-xs text-slate-500">
                    At least 8 characters with uppercase, lowercase, number, and special character.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">
                    Confirm new password
                  </span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl border bg-slate-50 px-3 pr-10 py-2.5 text-sm text-slate-800 outline-none transition border-slate-200 focus:border-[#1877f2] focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1877f2] transition cursor-pointer"
                    >
                      {showConfirmPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitDisabled} 
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60 mt-2"
                >
                  {isLoading ? (
                    <>
                      Updating... <FaSpinner className="animate-spin" />
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}