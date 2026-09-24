"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { IoSearch, IoCheckmark, IoArrowForward, IoClose, IoChevronDown, IoGridOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../../API/API";
import toast, { Toaster } from "react-hot-toast";
import { getDeviceId } from "../../../utils/deviceId";
import { TbLoader3 } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { startTopLoader } from "../TopLoader";

const SearchBar = ({ categories: categoriesProp = [], onSearchComplete }) => {
  const { t, i18n } = useTranslation("searchmodal");
  const router = useRouter();
  const language = i18n.language;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const selectedCategoryRef = useRef(null);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  const categories = categoriesProp.map((cat) => ({
    id: cat.id,
    label: language === "fr" ? cat.french_name || cat.name : cat.name,
  }));

  const fetchSuggestions = useCallback((kw, pg, append = false) => {
    if (!kw.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsFetching(true);
    fetch(`${BASE_URL}/web/search/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: kw, page: pg }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.data) {
          setSuggestions((prev) =>
            append ? [...prev, ...data.data.data] : data.data.data,
          );
          setLastPage(data.data.last_page);
          setShowSuggestions(true);
        } else {
          toast.error(
            data.action_message || data.action || "Something went wrong.",
          );
        }
      })
      .catch(() => toast.error("Something went wrong."))
      .finally(() => setIsFetching(false));
  }, []);

  const handleSearch = (kw) => {
    const searchKeyword = typeof kw === "string" ? kw : keyword;
    if (!searchKeyword.trim()) return;

    setShowSuggestions(false);
    setIsSearching(true);
    startTopLoader();

    const category = selectedCategoryRef.current;
    const params = new URLSearchParams({
      source: "search",
      q: searchKeyword.trim(),
      ...(category ? { category_id: String(category.id) } : {}),
    });

    // Brief delay so the search button's own spinner is actually visible
    // (and the top loader bar has started) before the route change closes
    // this modal — otherwise both happened in the same tick and the
    // spinner never got a chance to show.
    setTimeout(() => {
      router.push(`/shop?${params.toString()}`);
      onSearchComplete?.();
    }, 300);

    const loginData = localStorage.getItem("LoginData");
    const token = loginData ? JSON.parse(loginData)?.data?.token : null;

    const body = {
      keyword: searchKeyword,
      ...(token ? { token } : { device_id: getDeviceId() }),
      ...(category ? { category_id: category.id } : {}),
    };

    fetch(`${BASE_URL}/web/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.status) {
          toast.error(
            data.action_message || data.action || "Something went wrong.",
          );
        }
      })
      .catch(() => toast.error("Something went wrong."))
      .finally(() => setIsSearching(false));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    setPage(1);
    setSuggestions([]);
    clearTimeout(debounceTimer.current);
    if (!val.trim()) {
      setShowSuggestions(false);
      return;
    }
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val, 1, false);
    }, 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSuggestionsScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 10) {
      if (!isFetching && page < lastPage) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSuggestions(keyword, nextPage, true);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (cat) => {
    const next = selectedCategoryRef.current?.id === cat.id ? null : cat;
    setSelectedCategory(next);
    selectedCategoryRef.current = next;
    setIsDropdownOpen(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const suggestionsList = showSuggestions && suggestions.length > 0 && (
    <div
      ref={suggestionsRef}
      onScroll={handleSuggestionsScroll}
      className="absolute top-full left-0 right-0 mt-2 z-30 max-h-72 overflow-y-auto bg-white border border-black/10 shadow-[0_30px_70px_-24px_rgba(0,0,0,.4)]"
    >
      {suggestions.map((s, i) => (
        <div
          key={i}
          onMouseDown={(e) => {
            e.preventDefault();
            handleSuggestionClick(s);
          }}
          className="group flex items-center gap-3 px-5 py-3.5 text-[14px] text-[#5c5a54] cursor-pointer border-b border-black/[0.06] last:border-b-0 transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white"
        >
          <IoSearch className="w-3.5 h-3.5 text-[#8a8880] group-hover:text-white/60 shrink-0" />
          <span className="flex-1 truncate">{s}</span>
          <IoArrowForward className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 shrink-0" />
        </div>
      ))}
      {isFetching && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 text-[12.5px] text-[#8a8880]">
          <TbLoader3 className="animate-spin w-4 h-4" />
          Loading...
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Field */}
      <div className="relative">
        <div
          className={`relative flex items-center gap-3 h-14 pl-4 md:pl-5 pr-2 border transition-colors duration-300 ${
            inputFocused ? "bg-white border-black/40 shadow-[0_20px_40px_-24px_rgba(0,0,0,.4)]" : "bg-black/[0.035] border-transparent"
          }`}
        >
          <IoSearch className="w-5 h-5 text-[#0b0b0a] shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setInputFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setInputFocused(false)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 min-w-0 h-full text-[15px] md:text-[17px] font-medium text-[#0b0b0a] bg-transparent outline-none placeholder:text-[#8a8880] placeholder:font-normal"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              aria-label="Clear"
              className="shrink-0 grid place-items-center w-8 h-8 text-[#8a8880] hover:text-[#0b0b0a] hover:bg-black/[0.06] transition-colors cursor-pointer"
            >
              <IoClose className="w-4 h-4" />
            </button>
          )}
          {categories.length > 0 && (
            <div className="relative shrink-0 self-stretch hidden md:flex items-center border-l border-black/10 pl-2" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                className="h-10 flex items-center gap-2 px-3 md:min-w-[170px] max-w-[190px] text-left cursor-pointer"
              >
                <IoGridOutline className="w-4 h-4 text-[#8a8880] shrink-0" />
                <span className={`flex-1 truncate text-[13px] ${selectedCategory ? "text-[#0b0b0a] font-medium" : "text-[#8a8880]"}`}>
                  {selectedCategory?.label || t("selectCategory")}
                </span>
                <IoChevronDown className={`w-4 h-4 text-[#8a8880] shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 z-30 w-64 max-h-72 overflow-y-auto bg-white border border-black/10 shadow-[0_30px_70px_-24px_rgba(0,0,0,.4)]">
                  {categories.map((category) => {
                    const isSelected = selectedCategory?.id === category.id;
                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategorySelect(category)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${isSelected ? "bg-black/[0.04] text-[#0b0b0a] font-semibold" : "text-[#5c5a54]"}`}
                      >
                        <span className="truncate">{category.label}</span>
                        {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            aria-label="Search"
            className="shrink-0 grid place-items-center w-10 h-10 text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] transition-all duration-200 hover:shadow-[0_14px_28px_-12px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none"
          >
            {isSearching ? (
              <TbLoader3 className="animate-spin w-5 h-5" />
            ) : (
              <IoArrowForward className="w-5 h-5" />
            )}
          </button>
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-[#0b0b0a] via-[#5a584f] to-[#0b0b0a] transition-all duration-500 ${
              inputFocused ? "w-full" : "w-0"
            }`}
          />
        </div>
        {suggestionsList}
      </div>

      {/* Small screens: the category selector sits on its own row under the field */}
      {categories.length > 0 && (
        <div className="md:hidden relative mt-2" ref={mobileDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            className="w-full h-12 flex items-center gap-2.5 px-4 bg-white border border-black/12 text-left cursor-pointer"
          >
            <IoGridOutline className="w-4 h-4 text-[#8a8880] shrink-0" />
            <span className={`flex-1 truncate text-[14px] ${selectedCategory ? "text-[#0b0b0a] font-medium" : "text-[#8a8880]"}`}>
              {selectedCategory?.label || t("selectCategory")}
            </span>
            <IoChevronDown className={`w-4 h-4 text-[#8a8880] shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-30 max-h-64 overflow-y-auto bg-white border border-black/10 shadow-[0_30px_70px_-24px_rgba(0,0,0,.4)]">
              {categories.map((category) => {
                const isSelected = selectedCategory?.id === category.id;
                return (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${isSelected ? "bg-black/[0.04] text-[#0b0b0a] font-semibold" : "text-[#5c5a54]"}`}
                  >
                    <span className="truncate">{category.label}</span>
                    {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
