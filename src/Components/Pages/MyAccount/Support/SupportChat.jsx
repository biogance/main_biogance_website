"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoSend, IoArrowBack } from "react-icons/io5";
import { FiPlus, FiX } from "react-icons/fi";
import { BsClock, BsCheck2 } from "react-icons/bs";
import { useTranslation } from "react-i18next";
import { BASE_URL, MEDIA_URL } from "../../../API/API";
import {  IoAlertCircleOutline } from "react-icons/io5";

// A glossy icon badge — same family used for every icon in the account
// section.
function IconBadge({ icon: Icon, src, size = "w-10 h-10", danger = false }) {
  return (
    <span
      className={`relative grid place-items-center ${size} shrink-0 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] bg-gradient-to-b ${
        danger ? "from-red-500 to-red-700" : "from-[#403e38] to-[#0b0b0a]"
      }`}
    >
      {src ? (
        <img src={src} alt="" className="w-4 h-4 brightness-0 invert" />
      ) : (
        <Icon
          className="w-4 h-4"
          style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }}
        />
      )}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </span>
  );
}

// Loading state — the original capybara loader.

export default function SupportChat({ ticket, onClose }) {
  const { t } = useTranslation("myaccount");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");
  const [loadedImages, setLoadedImages] = useState({});
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [isClosingTicket, setIsClosingTicket] = useState(false);
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant the
  // triggering state flips.
  const [isPreviewClosing, setIsPreviewClosing] = useState(false);
  const [isCloseConfirmClosing, setIsCloseConfirmClosing] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  // The attach ("+") button next to the textarea — its rendered height
  // (bigger than the textarea's own single-line height, since its icon +
  // padding add up taller) is measured and used as the textarea's own
  // starting height, so an empty message box lines up exactly with the
  // buttons beside it.
  const attachButtonRef = useRef(null);
  const minHeightRef = useRef(0);

  // Grows the message box one line at a time as the user types (Shift+Enter
  // adds a line via the textarea's own default behavior below); after 5
  // lines it stops growing and scrolls internally instead.
  const LINE_HEIGHT = 20;
  const MAX_VISIBLE_LINES = 5;
  const TEXTAREA_VERTICAL_PADDING = 24; // py-3 = 12px top + 12px bottom
  const TEXTAREA_BORDER = 2; // 1px border top + bottom

  // The empty/1-line height is pinned to exactly minHeightRef (the button's
  // measured height) rather than just floored at it — Math.max(button,
  // ownNaturalHeight) would pick whichever is naturally taller instead of
  // actually matching. Measuring how much *extra* height the current
  // content needs beyond one line, and adding only that on top of the
  // button's height, keeps the empty state an exact match regardless of
  // which one (button or textarea) would otherwise be taller on its own.
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    const baseHeight = minHeightRef.current || el.offsetHeight;
    const singleLineHeight =
      LINE_HEIGHT + TEXTAREA_VERTICAL_PADDING + TEXTAREA_BORDER;
    const maxExtra = LINE_HEIGHT * (MAX_VISIBLE_LINES - 1);
    el.style.height = "auto";
    const extra = Math.max(0, el.scrollHeight - singleLineHeight);
    const next = baseHeight + Math.min(extra, maxExtra);
    el.style.height = `${next}px`;
    el.style.overflowY = extra > maxExtra ? "auto" : "hidden";
  };

  useEffect(() => {
    const measureMinHeight = () => {
      if (attachButtonRef.current) {
        minHeightRef.current = attachButtonRef.current.offsetHeight;
        autoResize();
      }
    };
    measureMinHeight();
    window.addEventListener("resize", measureMinHeight);
    return () => window.removeEventListener("resize", measureMinHeight);
    // `loading` is required here — the attach button (and the textarea)
    // only exist in the DOM once the ticket data has loaded and the
    // `!loading && (...)` block below actually renders them. `selectedImage`
    // is required too — the button swaps between the plus icon and the
    // selected-image thumbnail (see JSX below), which can render at a
    // slightly different height, so it needs remeasuring on that swap too.
  }, [loading, selectedImage]);

  useEffect(() => {
    autoResize();
  }, [message]);

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem("splashData") || "{}");
      return splashData?.user?.token || localStorage.getItem("token") || "";
    } catch {
      return "";
    }
  };

  const formatMessageTime = (time) => {
    if (!time) return "";
    return new Date(Number(time) * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const loadUserAvatar = () => {
      try {
        const splashData = JSON.parse(
          localStorage.getItem("splashData") || "{}",
        );
        setUserAvatar(
          splashData?.user?.profile_picture
            ? `${MEDIA_URL}${splashData.user.profile_picture}`
            : "",
        );
      } catch {
        setUserAvatar("");
      }
    };
    loadUserAvatar();
  }, []);

  useEffect(() => {
    const ticketId = ticket?.rawId || String(ticket?.id || "").replace("#", "");
    if (!ticketId) return;

    fetch(`${BASE_URL}/app/ticket/conversation/${ticketId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.status) return;
        const userId = ticket?.userId || data.data?.ticket?.user_id;
        setMessages(
          (data.data?.messages || []).map((msg) => ({
            id: msg.id,
            type: msg.from === userId ? "customer" : "support",
            text: msg.message,
            image: msg.attachment ? `${MEDIA_URL}${msg.attachment}` : null,
            time: formatMessageTime(msg.time),
            hasIcon: msg.from !== userId,
            avatar: msg.from === userId,
          })),
        );
      })
      .catch((err) => console.error("Fetch conversation error:", err))
      .finally(() => setLoading(false));
  }, [ticket]);

  useEffect(() => {
    if (loading) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (previewImage) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [previewImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text && !selectedImageFile) return;

    const ticketId = ticket?.rawId || String(ticket?.id || "").replace("#", "");
    const tempId = `local-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        type: "customer",
        text,
        image: selectedImage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        avatar: true,
        status: "sending",
      },
    ]);
    setMessage("");
    setSelectedImage(null);
    setSelectedImageFile(null);

    try {
      const formData = new FormData();
      formData.append("ticket_id", ticketId);
      formData.append("type", "text");
      formData.append("message", text);
      if (selectedImageFile) {
        formData.append("attachment", selectedImageFile);
      }

      const res = await fetch(`${BASE_URL}/app/ticket/send/message`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: data?.data?.id || tempId,
                status: data?.status ? "sent" : "failed",
              }
            : m,
        ),
      );
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    }
  };

  const handleClosePreview = () => {
    setIsPreviewClosing(true);
    setTimeout(() => { setIsPreviewClosing(false); setPreviewImage(null); }, 250);
  };

  const handleDismissCloseConfirm = () => {
    if (isClosingTicket) return;
    setIsCloseConfirmClosing(true);
    setTimeout(() => { setIsCloseConfirmClosing(false); setShowCloseConfirm(false); }, 250);
  };

  const handleCloseTicket = async () => {
    const ticketId = ticket?.rawId || String(ticket?.id || "").replace("#", "");
    setIsClosingTicket(true);
    try {
      await fetch(`${BASE_URL}/app/ticket/close/${ticketId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Close ticket error:", err);
    } finally {
      setIsClosingTicket(false);
      setShowCloseConfirm(false);
      onClose();
    }
  };

  // Enter sends the message; Shift+Enter is left alone so the textarea's
  // own default behavior inserts a newline instead.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white flex flex-col relative min-h-[700px]">
      <style jsx>{`
        .capybaraloader {
          width: 14em;
          height: 10em;
          position: relative;
          z-index: 1;
          --color: rgb(0, 0, 0);
          --color2: rgb(255, 255, 255);
          transform: scale(0.75);
        }
        .capybara {
          width: 100%;
          height: 7.5em;
          position: relative;
          z-index: 1;
        }
        .loader {
          width: 100%;
          height: 2.5em;
          position: relative;
          z-index: 1;
          overflow: hidden;
        }
        .capy {
          width: 85%;
          height: 100%;
          background: linear-gradient(var(--color), 90%, var(--color2));
          border-radius: 45%;
          position: relative;
          z-index: 1;
          animation: movebody 1s linear infinite;
        }
        .capyhead {
          width: 7.5em;
          height: 7em;
          bottom: 0em;
          right: 0em;
          position: absolute;
          background-color: var(--color);
          z-index: 3;
          border-radius: 3.5em;
          box-shadow: -1em 0em var(--color2);
          animation: movebody 1s linear infinite;
        }
        .capyear {
          width: 2em;
          height: 2em;
          background: linear-gradient(-45deg, var(--color), 90%, var(--color2));
          top: 0em;
          left: 0em;
          border-radius: 100%;
          position: absolute;
          overflow: hidden;
          z-index: 3;
        }
        .capyear:nth-child(2) {
          left: 5em;
          background: linear-gradient(25deg, var(--color), 90%, var(--color2));
        }
        .capyear2 {
          width: 100%;
          height: 1em;
          background-color: var(--color2);
          bottom: 0em;
          left: 0.5em;
          border-radius: 100%;
          position: absolute;
          transform: rotate(-45deg);
        }
        .capymouth {
          width: 3.5em;
          height: 2em;
          background-color: var(--color2);
          position: absolute;
          bottom: 0em;
          left: 2.5em;
          border-radius: 50%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.5em;
        }
        .capylips {
          width: 0.25em;
          height: 0.75em;
          border-radius: 100%;
          transform: rotate(-45deg);
          background-color: var(--color);
        }
        .capylips:nth-child(2) {
          transform: rotate(45deg);
        }
        .capyeye {
          width: 2em;
          height: 0.5em;
          background-color: var(--color2);
          position: absolute;
          bottom: 3.5em;
          left: 1.5em;
          border-radius: 5em;
          transform: rotate(45deg);
        }
        .capyeye:nth-child(4) {
          transform: rotate(-45deg);
          left: 5.5em;
          width: 1.75em;
        }
        .capyleg {
          width: 6em;
          height: 5em;
          bottom: 0em;
          left: 0em;
          position: absolute;
          background: linear-gradient(var(--color), 95%, var(--color2));
          z-index: 2;
          border-radius: 2em;
          animation: movebody 1s linear infinite;
        }
        .capyleg2 {
          width: 1.75em;
          height: 3em;
          bottom: 0em;
          left: 3.25em;
          position: absolute;
          background: linear-gradient(var(--color), 80%, var(--color2));
          z-index: 2;
          border-radius: 0.75em;
          box-shadow: inset 0em -0.5em var(--color2);
          animation: moveleg 1s linear infinite;
        }
        .capyleg2:nth-child(3) {
          width: 1.25em;
          left: 0.5em;
          height: 2em;
          animation: moveleg2 1s linear infinite 0.075s;
        }
        @keyframes moveleg {
          0% {
            transform: rotate(-45deg) translateX(-5%);
          }
          50% {
            transform: rotate(45deg) translateX(5%);
          }
          100% {
            transform: rotate(-45deg) translateX(-5%);
          }
        }
        @keyframes moveleg2 {
          0% {
            transform: rotate(45deg);
          }
          50% {
            transform: rotate(-45deg);
          }
          100% {
            transform: rotate(45deg);
          }
        }
        @keyframes movebody {
          0% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(2%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        .loaderline {
          width: 50em;
          height: 0.5em;
          border-top: 0.5em dashed var(--color);
          animation: moveline 10s linear infinite;
        }
        @keyframes moveline {
          0% {
            transform: translateX(0%);
            opacity: 0%;
          }
          5% {
            opacity: 100%;
          }
          95% {
            opacity: 100%;
          }
          100% {
            opacity: 0%;
            transform: translateX(-70%);
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 -mx-6 md:-mx-8 px-5 sm:px-6 md:px-8 pb-5 border-b border-black/10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onClose}
            aria-label="Back"
            className="relative grid place-items-center w-10 h-10 shrink-0 bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white cursor-pointer overflow-hidden transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] hover:-translate-y-px active:translate-y-0"
          >
            <IoArrowBack className="w-[18px] h-[18px]" style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }} />
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[16px] font-bold text-[#0b0b0a] truncate">
              {t("support.chat.title")}
            </h1>
            <p className="text-[12.5px] text-[#8a8880] truncate">
              {t("support.ticketId")} {ticket?.id || "#3021"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCloseConfirm(true)}
          className="shrink-0 text-[12.5px] font-medium cursor-pointer text-[#8a8880] border border-black/15 px-4 py-2.5 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
        >
          {t("support.chat.closeChat")}
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="capybaraloader">
            <div className="capybara">
              <div className="capyhead">
                <div className="capyear">
                  <div className="capyear2"></div>
                </div>
                <div className="capyear"></div>
                <div className="capymouth">
                  <div className="capylips"></div>
                  <div className="capylips"></div>
                </div>
                <div className="capyeye"></div>
                <div className="capyeye"></div>
              </div>
              <div className="capyleg"></div>
              <div className="capyleg2"></div>
              <div className="capyleg2"></div>
              <div className="capy"></div>
            </div>
            <div className="loader">
              <div className="loaderline"></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Messages — a subtly tinted "canvas" (distinct from the
              white header/input chrome) with consecutive messages from the
              same sender grouped together: the avatar and timestamp only
              appear once, on the last bubble of each run. */}
          <div className="flex-1 overflow-y-auto py-6 bg-[#f7f7f5]">
            <div className="w-full px-4 sm:px-6">
              {/* Date Separator */}
              <div className="flex justify-center mb-5">
                <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] bg-white px-4 py-1.5 border border-black/10">
                  {t("support.chat.dateSeparator")}
                </span>
              </div>

              {/* Messages */}
              {messages.map((msg, index) => {
                const prev = messages[index - 1];
                const next = messages[index + 1];
                const isFirstInGroup = !prev || prev.type !== msg.type;
                const isLastInGroup = !next || next.type !== msg.type;

                return (
                  <div key={msg.id} className={isFirstInGroup && index > 0 ? "mt-4" : "mt-1"}>
                    {msg.type === "support" ? (
                      // Support Message (Left Side)
                      <div className="flex items-end gap-2.5">
                        <div className="w-9 shrink-0 flex flex-col items-center gap-1">
                          {isLastInGroup ? (
                            <IconBadge src="sup.svg" size="w-9 h-9" />
                          ) : (
                            <span className="w-9 h-9" aria-hidden="true" />
                          )}
                        </div>
                        <div className="max-w-md sm:max-w-lg min-w-0">
                          {isFirstInGroup && (
                            <p className="text-[10.5px] font-semibold tracking-[0.04em] text-[#8a8880] mb-1 ml-0.5">
                              {t("support.chat.supportTeam")}
                            </p>
                          )}
                          <div className="text-[#0b0b0a] bg-white border border-black/10 px-3.5 py-3 inline-block">
                            {msg.image && (
                              <div
                                className={`relative mb-2 max-w-xs overflow-hidden ${msg.text ? "border-b border-black/10 pb-2" : ""} ${!loadedImages[msg.id] ? "min-h-[160px] w-40" : ""}`}
                              >
                                {!loadedImages[msg.id] && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/[0.03]">
                                    <div className="w-6 h-6 border-2 border-[#0b0b0a] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                )}
                                <img
                                  src={msg.image}
                                  alt="Attachment"
                                  className={`w-full cursor-pointer hover:opacity-90 transition-opacity ${loadedImages[msg.id] ? "opacity-100" : "opacity-0"}`}
                                  onClick={() => setPreviewImage(msg.image)}
                                  onLoad={() => handleImageLoad(msg.id)}
                                  onError={() => handleImageLoad(msg.id)}
                                />
                              </div>
                            )}
                            {msg.text && (
                              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                                {msg.textKey ? t(msg.textKey) : msg.text}
                              </p>
                            )}
                          </div>
                          {isLastInGroup && (
                            <span className="block mt-1 ml-0.5 text-[10px] text-[#8a8880] whitespace-nowrap">
                              {msg.time}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Customer Message (Right Side) — filled dark bubble,
                      // the standard "your own message" treatment.
                      <div className="flex justify-end">
                        <div className="flex items-end gap-2.5">
                          <div className="max-w-md sm:max-w-lg min-w-0">
                            <div className="bg-[#0b0b0a] text-white px-3.5 py-3 inline-block">
                              {msg.image && (
                                <div
                                  className={`relative mb-2 max-w-xs overflow-hidden ${msg.text ? "border-b border-white/15 pb-2" : ""} ${!loadedImages[msg.id] ? "min-h-[160px] w-40" : ""}`}
                                >
                                  {!loadedImages[msg.id] && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                  )}
                                  <img
                                    src={msg.image}
                                    alt="Uploaded"
                                    className={`w-full cursor-pointer hover:opacity-90 transition-opacity ${loadedImages[msg.id] ? "opacity-100" : "opacity-0"}`}
                                    onClick={() => setPreviewImage(msg.image)}
                                    onLoad={() => handleImageLoad(msg.id)}
                                    onError={() => handleImageLoad(msg.id)}
                                  />
                                </div>
                              )}
                              {msg.text && (
                                // whitespace-pre-wrap — same reason as the
                                // support-message bubble above.
                                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                                  {msg.textKey ? t(msg.textKey) : msg.text}
                                </p>
                              )}
                            </div>
                            {isLastInGroup && (
                              <div className="flex items-center justify-end gap-1 mt-1 mr-0.5">
                                {msg.status === "sending" && (
                                  <BsClock className="text-[#8a8880]" size={11} />
                                )}
                                {msg.status === "sent" && (
                                  <BsCheck2 className="text-[#8a8880]" size={13} />
                                )}
                                <span className="text-[10px] text-[#8a8880] whitespace-nowrap">
                                  {msg.time}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="w-9 shrink-0">
                            {isLastInGroup && msg.avatar && (
                              <div className="w-9 h-9 bg-black/10 overflow-hidden">
                                {userAvatar ? (
                                  <img
                                    src={userAvatar}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-black/10" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Input — one continuous bar (attach / text / send)
              instead of three separate boxes, the standard modern-chat
              shape. */}
          <div className="pt-4 px-4 sm:px-6 pb-1 border-t border-black/10">
            <div className="w-full flex items-end gap-2 px-2 py-2 bg-white border border-black/10 shadow-[inset_0_1px_3px_rgba(0,0,0,.04)] focus-within:border-black/40 transition-colors">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {selectedImage ? (
                <div
                  ref={attachButtonRef}
                  className="relative shrink-0 w-9 h-9 border border-black/10 overflow-hidden"
                >
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setPreviewImage(selectedImage)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                      setSelectedImageFile(null);
                    }}
                    className="absolute top-0.5 right-0.5 cursor-pointer bg-white text-[#0b0b0a] p-0.5"
                  >
                    <FiX size={10} />
                  </button>
                </div>
              ) : (
                <button
                  ref={attachButtonRef}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach image"
                  className="grid place-items-center w-9 h-9 shrink-0 text-[#8a8880] cursor-pointer transition-colors duration-150 hover:text-[#0b0b0a] hover:bg-black/[0.04]"
                >
                  <FiPlus size={20} />
                </button>
              )}
              <textarea
                ref={textareaRef}
                placeholder={t("support.chat.writeMessage")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{
                  resize: "none",
                  overflowY: "hidden",
                  lineHeight: "20px",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                className="flex-1 min-w-0 py-1.5 bg-transparent text-[14px] text-[#0b0b0a] placeholder:text-[#8a8880] focus:outline-none [&::-webkit-scrollbar]:hidden"
              />
              <button
                onClick={handleSendMessage}
                aria-label="Send message"
                className="relative grid place-items-center w-9 h-9 shrink-0 bg-gradient-to-b from-[#403e38] to-[#0b0b0a] text-white cursor-pointer overflow-hidden transition-all duration-150 shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-6px_10px_-6px_rgba(0,0,0,.6),0_8px_14px_-8px_rgba(0,0,0,.55)] hover:-translate-y-px active:translate-y-0"
              >
                <IoSend size={16} style={{ filter: "drop-shadow(-0.5px -0.5px 0 rgba(255,255,255,.55)) drop-shadow(1px 1.5px 1.5px rgba(0,0,0,.6))" }} />
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              </button>
            </div>
          </div>
          <div ref={messagesEndRef} />
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className={`fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-60 ${isPreviewClosing ? 'backdrop-out' : 'backdrop-in'}`}
          onClick={handleClosePreview}
        >
          <div className={`relative max-w-[90vw] max-h-[90vh] ${isPreviewClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
            <button
              onClick={handleClosePreview}
              className="absolute -top-11 right-0 grid place-items-center w-9 h-9 cursor-pointer text-white border border-white/30 hover:bg-white hover:text-[#0b0b0a] transition-colors"
            >
              <FiX size={20} />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Close Ticket Confirm Modal */}
   
{showCloseConfirm && (
  <div
    className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-[1300] p-4 ${isCloseConfirmClosing ? 'backdrop-out' : 'backdrop-in'}`}
    onClick={handleDismissCloseConfirm}
  >
    <div
      className={`bg-white w-full max-w-md shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isCloseConfirmClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dark editorial header band — same family as AddPetModal's header */}
      <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-6 py-7 flex items-center gap-4 border-b border-white/5 overflow-hidden">
        <IoAlertCircleOutline className="pointer-events-none absolute -right-5 -top-6 w-28 h-28 text-white/[0.05] rotate-[12deg]" />

        <IconBadge icon={IoAlertCircleOutline} size="w-11 h-11" danger />

        <div className="relative min-w-0">
          <h3 className="text-[17px] font-extrabold leading-tight tracking-tight text-white">
            {t("support.chat.closeConfirm.title")}
          </h3>
          <p className="text-[12px] text-white/40 mt-1 leading-snug">
            {t("support.chat.closeConfirm.subtitle", "This ticket will be marked as resolved and the conversation will be closed.")}
          </p>
        </div>
      </div>

      {/* Body / actions */}
      <div className="p-6 sm:p-7">
        <div className="flex gap-3">
          <button
            onClick={handleDismissCloseConfirm}
            disabled={isClosingTicket}
            className="flex-1 py-3 text-[13px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t("support.chat.closeConfirm.cancel")}
          </button>
          <button
            onClick={handleCloseTicket}
            disabled={isClosingTicket}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-white bg-gradient-to-b from-red-500 to-red-700 border border-red-700 transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(220,38,38,.5)] hover:-translate-y-px cursor-pointer disabled:opacity-75 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
          >
            {isClosingTicket && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isClosingTicket
              ? t("support.chat.closeConfirm.closing")
              : t("support.chat.closeConfirm.confirm")}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
