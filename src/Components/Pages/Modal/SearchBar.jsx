"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { IoSearch, IoChevronDown } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { BASE_URL } from "../../API/API";
import toast, { Toaster } from "react-hot-toast";
import { getDeviceId } from "../../../utils/deviceId";
import { BiLoaderAlt } from "react-icons/bi";
import { TbLoader3 } from "react-icons/tb";
import { useRouter } from "next/navigation";

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

    const params = new URLSearchParams({
      source: "search",
      q: searchKeyword.trim(),
    });

    router.push(`/shop?${params.toString()}`);
    onSearchComplete?.();

    const loginData = localStorage.getItem("LoginData");
    const token = loginData ? JSON.parse(loginData)?.data?.token : null;
    const category = selectedCategoryRef.current;

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
    setSelectedCategory(cat);
    selectedCategoryRef.current = cat;
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
      className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1  shadow-lg z-20 overflow-y-auto max-h-72"
    >
      {suggestions.map((s, i) => (
        <div
          key={i}
          onMouseDown={(e) => {
            e.preventDefault();
            handleSuggestionClick(s);
          }}
          className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <IoSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{s}</span>
        </div>
      ))}
      {isFetching && (
        <div className="px-4 py-3 text-sm text-gray-400 text-center">
          Loading...
        </div>
      )}
    </div>
  );

  const SearchButton = ({ className }) => (
    <button
      onClick={() => handleSearch()}
      disabled={isSearching}
      className={`bg-black text-white cursor-pointer flex items-center justify-center disabled:cursor-not-allowed transition-colors hover:bg-gray-800 ${className}`}
    >
      {isSearching ? (
       
        <TbLoader3 className="animate-spin w-5 h-5 text-white" />

      ) : (
        <IoSearch className="w-5 h-5" />
      )}
    </button>
  );

  return (
    <div className="p-4 md:p-8 bg-white">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="max-w-4xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-0">
          <div className="relative flex-1">
            <input
              type="text"
              value={keyword}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={t("searchPlaceholder")}
              className="w-full border border-gray-300 text-gray-700  px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-400"
            />
            {suggestionsList}
          </div>
          <div className="relative border-l-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="appearance-none cursor-pointer border-y border border-gray-300 px-6 py-3.5 pr-12 text-sm text-gray-500 bg-white focus:outline-none focus:border-gray-400 transition-colors h-full min-w-[180px] text-left"
            >
              {selectedCategory?.label || t("selectCategory")}
            </button>
            <IoChevronDown
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1  shadow-lg z-10 overflow-hidden">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className="px-6 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-black hover:text-white transition-colors"
                  >
                    {category.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <SearchButton className=" px-8 py-3.5" />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex gap-0">
            <div className="relative flex-1">
              <input
                type="text"
                value={keyword}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder={t("searchPlaceholder")}
                className="w-full border border-gray-300 text-gray-700  px-3 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors placeholder-gray-400"
              />
              {suggestionsList}
            </div>
            <SearchButton className=" px-6 py-3" />
          </div>

          <div className="relative w-full" ref={mobileDropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full appearance-none cursor-pointer border border-gray-300  px-4 py-3 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:border-gray-400 transition-colors text-left"
            >
              {selectedCategory?.label || t("selectCategory")}
            </button>
            <IoChevronDown
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 mt-1  shadow-lg z-10 overflow-hidden">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className="px-4 py-2.5 text-sm text-gray-700 cursor-pointer hover:bg-black hover:text-white transition-colors"
                  >
                    {category.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;