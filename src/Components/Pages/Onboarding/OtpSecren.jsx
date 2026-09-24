"use client";

import { useState, useRef } from "react";
import { IoClose, IoMailOpenOutline, IoAlertCircleOutline } from "react-icons/io5";
import AuthInput from "./AuthInput";
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
    if (apiError) setApiError("");

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
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-70 ${
          isClosing ? "backdrop-out" : "backdrop-in"
        }`}
        onClick={handleBackdropClick}
      >
        <div
          className={`w-full max-w-md ${
            isClosing ? "modal-pop-out" : "modal-pop-in"
          }`}
        >
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white w-full max-h-[92vh] overflow-y-auto shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)]"
          >
            {/* Dark editorial header band */}
            <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 sm:px-8 py-6 sm:py-7 overflow-hidden">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "14px 14px", maskImage: "linear-gradient(to left, black, transparent 75%)", WebkitMaskImage: "linear-gradient(to left, black, transparent 75%)" }}
              />
              <span aria-hidden="true" className="absolute bottom-0 left-0 h-[2px] w-20 bg-[#DFB400]" />
              <IoMailOpenOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="absolute top-5 right-5 z-10 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
              >
                <IoClose size={18} />
              </button>
              <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 mb-4">
                <IoMailOpenOutline className="w-5 h-5 text-white" />
              </div>
              <div className="relative flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
                <span className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white/40">Biogance</span>
              </div>
              <h1 className="relative text-[22px] sm:text-[24px] font-extrabold leading-[1.05] tracking-tight text-white pr-12">
                {t("verificationCode.title")}
              </h1>
              <p className="relative mt-2 text-[13px] text-white/50 leading-relaxed">
                {t("verificationCode.description1")} {t("verificationCode.description2")}
              </p>
            </div>

            <div className="px-6 sm:px-8 pt-6 pb-7 sm:pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex items-center justify-center px-4 py-2.5 bg-black/[0.03] border border-black/10">
                <span className="text-[13px] font-semibold text-[#0b0b0a] truncate">{email}</span>
              </div>

              <div>
                <div className="grid grid-cols-6 gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <AuthInput
                      key={index}
                      inputRef={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      hasError={!!error}
                      className="!px-0 !py-3.5 text-center !text-[22px] font-semibold"
                    />
                  ))}
                </div>
                {error && (
                  <span className="flex items-center justify-center gap-1.5 text-red-500 text-xs mt-2">
                    <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
              >
                {isLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isLoading ? "Verifying..." : t("verificationCode.submitButton")}
              </button>
              {apiError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  <IoAlertCircleOutline className="w-4 h-4 shrink-0 mt-px" />
                  <span>{apiError}</span>
                </div>
              )}

              <p className="text-center text-[13px] text-[#8a8880]">
                {t("verificationCode.didntGetIt")}{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-[#0b0b0a] font-semibold underline underline-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resending..." : t("verificationCode.resendOTP")}
                </button>
              </p>
            </form>
            </div>
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