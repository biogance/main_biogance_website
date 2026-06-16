"use client";

import { useState, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import CreateNewPasswordModal from "./NewPassword";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { BASE_URL } from "../../API/API";

export default function VerificationCodeModal({
  isOpen,
  onClose,
  email,
  onAllClose,
}) {
  const { t } = useTranslation("onboarding");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isNewPasswordOpen, setIsNewPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRefs = useRef([]);
  const modalCardRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  // ─── Auto submit helper ───────────────────────────────────────────────
  const submitOtp = async (otpArray) => {
    const otpString = otpArray.join("");
    if (otpString.length < 6) return;

    try {
      setIsLoading(true);
      setApiError("");
      const res = await fetch(`${BASE_URL}/user/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg =
          data.errors?.length > 0 ? data.errors[0].message : data.action;
        setApiError(msg);
      } else {
        setError("");
        setIsNewPasswordOpen(true);
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setApiError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Single digit change ──────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (error) setError("");

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit jab last field fill ho manually
    if (value !== "" && index === 5) {
      submitOtp(newOtp);
    }
  };

  // ─── Paste handler ────────────────────────────────────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();

    // Sirf numbers allow karo
    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.slice(0, 6).split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    setError("");

    // Focus last filled input
    const lastIndex = Math.min(digits.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit agar 6 digits paste hue
    if (digits.length === 6) {
      submitOtp(newOtp);
    }
  };

  // ─── Keyboard ─────────────────────────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submitOtp(otp);
    }
  };

  // ─── Manual form submit ───────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError("");
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError(t("verificationCode.errors.incomplete"));
      return;
    }
    submitOtp(otp);
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────
  const handleResendOTP = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setApiError("");
    inputRefs.current[0]?.focus();
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/user/auth/forgot/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === false) {
        const msg =
          data.errors?.length > 0 ? data.errors[0].message : data.action;
        setApiError(msg);
      } else {
        toast.success("OTP resent successfully!");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setApiError("Resend failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Modal close ──────────────────────────────────────────────────────
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 250);
  };

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add("modal-shake");
      modalCardRef.current.addEventListener(
        "animationend",
        () => { modalCardRef.current?.classList.remove("modal-shake"); },
        { once: true }
      );
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center p-4 z-70 ${
          isClosing ? "backdrop-out" : "backdrop-in"
        }`}
        onClick={handleBackdropClick}
      >
        <div
          className={`w-full max-w-lg ${
            isClosing ? "modal-pop-out" : "modal-pop-in"
          }`}
        >
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white shadow-lg w-full p-8"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-black hover:text-gray-600 z-10 cursor-pointer transition-all duration-300 hover:rotate-90"
            >
              <AiOutlineClose size={20} />
            </button>

            <h1 className="text-xl mt-6 font-semibold text-center mb-4 text-black">
              {t("verificationCode.title")}
            </h1>

            <p className="text-gray-700 text-center text-md leading-relaxed mb-2">
              {t("verificationCode.description1")}
              <br />
              {t("verificationCode.description2")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-center text-sm font-semibold text-black">
                {email}
              </p>

              <div className="flex justify-center gap-3 mb-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-14 h-14 text-center text-2xl font-medium border-2 mb-4 focus:outline-none transition-colors duration-200 ${
                      error
                        ? "border-red-300 bg-red-50 text-black"
                        : digit !== ""
                        ? "border-gray-500 bg-gray-50 text-black"
                        : "border-gray-300 bg-white text-black focus:border-gray-400"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-xs text-center mb-4 mt-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{ width: `calc(6 * 3.5rem + 5 * 0.75rem)` }}
                className="mx-auto block bg-black text-white py-3 hover:bg-gray-800 transition-colors text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : t("verificationCode.submitButton")}
              </button>
              {apiError && (
                <p className="text-red-500 text-sm mt-3 text-center font-medium mx-auto" style={{ width: `calc(6 * 3.5rem + 5 * 0.75rem)` }}>
                  {apiError}
                </p>
              )}

              <p className="text-center text-sm text-gray-700">
                {t("verificationCode.didntGetIt")}{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-black font-semibold underline hover:text-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resending..." : t("verificationCode.resendOTP")}
                </button>
                .
              </p>
            </form>
          </div>
        </div>
      </div>

      <CreateNewPasswordModal
        isOpen={isNewPasswordOpen}
        onClose={() => setIsNewPasswordOpen(false)}
        email={email}
        onAllClose={onAllClose}
      />
    </>
  );
}