import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose, IoCalendarOutline, IoChevronDown, IoCheckmark, IoAlertCircleOutline, IoCloudUploadOutline, IoTrashOutline } from 'react-icons/io5';
import { PiPawPrint } from 'react-icons/pi';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BASE_URL, MEDIA_URL } from '../../../API/API';

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
      <IoAlertCircleOutline className="w-3.5 h-3.5 shrink-0" />
      {message}
    </span>
  );
}

// ── Single Select Custom Dropdown ───────────────────────────────────────────
const CustomDropdown = ({ label, options, value, onChange, placeholder = "", insideModal = false, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">{label}</label>
      )}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border text-left text-[14px] transition-colors duration-200 cursor-pointer ${
          error ? 'border-red-400' : isOpen ? 'border-black/30' : 'border-black/10 hover:border-black/25'
        }`}
      >
        <span className={`truncate ${!selectedOption ? "text-[#8a8880]" : "text-[#0b0b0a] font-medium"}`}>
          {displayValue}
        </span>
        <IoChevronDown
          className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 bg-transparent border-0 cursor-default"
            style={{ zIndex: insideModal ? 40 : 10 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-2 max-h-[280px] overflow-auto bg-white border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]"
            style={{ zIndex: insideModal ? 50 : 20 }}
          >
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 text-left px-4 py-3 text-[13.5px] cursor-pointer transition-colors duration-150 hover:bg-[#0b0b0a] hover:text-white ${
                    isSelected ? 'bg-black/[0.04] text-[#0b0b0a] font-semibold' : 'text-[#5c5a54]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <IoCheckmark className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Multi Select Dropdown ───────────────────────────────────────────────────
const MultiSelectDropdown = ({ label, options, value = [], onChange, placeholder = "Select options" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = value
    .map(val => options.find(opt => opt.value === val)?.label)
    .filter(Boolean)
    .join(', ');

  const displayValue = selectedLabels || placeholder;

  return (
    <div className="relative w-full">
      <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">{label}</label>
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white border text-left text-[14px] transition-colors duration-200 cursor-pointer ${
          isOpen ? 'border-black/30' : 'border-black/10 hover:border-black/25'
        }`}
      >
        <span className={`truncate ${value.length ? "text-[#0b0b0a] font-medium" : "text-[#8a8880]"}`}>{displayValue}</span>
        <IoChevronDown className={`w-4 h-4 shrink-0 text-[#8a8880] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-50 max-h-[220px] overflow-auto bg-white shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)] border border-black/10"
            style={{
              top: buttonRef.current?.getBoundingClientRect().bottom + 8 + 'px',
              left: Math.max(8, Math.min(
                buttonRef.current?.getBoundingClientRect().left || 0,
                window.innerWidth - (buttonRef.current?.getBoundingClientRect().width || 0) - 8
              )) + 'px',
              width: buttonRef.current?.getBoundingClientRect().width + 'px',
              maxWidth: 'calc(100vw - 16px)',
            }}
          >
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={`group w-full flex items-center gap-3 px-4 py-3 text-left text-[13.5px] transition-colors duration-150 cursor-pointer hover:bg-[#0b0b0a] hover:text-white ${
                    isSelected ? 'bg-black/[0.04]' : ''
                  }`}
                >
                  <div className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    isSelected ? 'bg-[#0b0b0a] border-[#0b0b0a]' : 'border-black/20 bg-white group-hover:border-white/50'
                  }`}>
                    {isSelected && <IoCheckmark className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`truncate ${isSelected ? 'font-semibold text-[#0b0b0a] group-hover:text-white' : 'text-[#5c5a54] group-hover:text-white'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Age Picker with Day Selection ───────────────────────────────────────────
const AgePicker = ({ value, onChange, error = false }) => {
  const { t } = useTranslation("myaccount");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const containerRef = useRef(null);

  const months = [
    t('addPet.months.january'),
    t('addPet.months.february'),
    t('addPet.months.march'),
    t('addPet.months.april'),
    t('addPet.months.may'),
    t('addPet.months.june'),
    t('addPet.months.july'),
    t('addPet.months.august'),
    t('addPet.months.september'),
    t('addPet.months.october'),
    t('addPet.months.november'),
    t('addPet.months.december')
  ];
  const monthOptions = months.map((m, i) => ({ value: i, label: m }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`
  }));

  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '';
    try {
      const [day, monthName, year] = birthDateString.split(' ');
      const monthIndex = months.indexOf(monthName);
      const birthDate = new Date(year, monthIndex, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      console.error("Error calculating age:", e);
      return '';
    }
  };

  useEffect(() => {
    if (value) {
      try {
        const [dayStr, monthStr, yearStr] = value.split(' ');
        const day = parseInt(dayStr, 10);
        const month = months.indexOf(monthStr);
        const year = parseInt(yearStr, 10);
        if (!isNaN(day) && month !== -1 && !isNaN(year)) {
          setSelectedDate(new Date(year, month, day));
        }
      } catch (e) {
        console.error("Invalid date format:", value);
      }
    }
  }, [value]);

  const displayMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();
  const displayYear = selectedDate ? selectedDate.getFullYear() : currentYear;

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDay = new Date(displayYear, displayMonth, 1).getDay();

  const handleDayClick = (day) => {
    const newDate = new Date(displayYear, displayMonth, day);
    setSelectedDate(newDate);
  };

  const handleApply = () => {
    if (selectedDate) {
      const day = selectedDate.getDate();
      const monthName = months[selectedDate.getMonth()];
      const year = selectedDate.getFullYear();
      onChange(`${day} ${monthName} ${year}`);
    }
    setIsOpen(false);
  };

  const isSelectedDay = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayMonth &&
      selectedDate.getFullYear() === displayYear
    );
  };

  const weekDays = [
    t('addPet.weekDays.mon'),
    t('addPet.weekDays.tue'),
    t('addPet.weekDays.wed'),
    t('addPet.weekDays.thu'),
    t('addPet.weekDays.fri'),
    t('addPet.weekDays.sat'),
    t('addPet.weekDays.sun')
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">{t('addPet.age')}</label>

      <div className="relative">
        <input
          type="text"
          readOnly
          placeholder={t('addPet.selectBirthdate')}
          value={value ? t('addPet.yearsOld', { years: calculateAge(value) }) : ''}
          onClick={() => setIsOpen(true)}
          className={`w-full px-4 py-3.5 pr-10 text-[14px] text-[#0b0b0a] border cursor-pointer outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
            error ? 'border-red-400' : 'border-black/10 focus:border-black/30'
          }`}
        />
        <IoCalendarOutline className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8a8880] pointer-events-none" />
      </div>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 bg-black/30 border-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed z-50 bg-white shadow-[0_30px_70px_-24px_rgba(0,0,0,.5)] border border-black/10 p-5 w-[90vw] md:w-[340px] max-h-[90vh] overflow-y-auto"
            style={{
              top: window.innerWidth < 768 
                ? '50%' 
                : Math.min(
                    containerRef.current?.getBoundingClientRect().bottom + 8 || 0,
                    window.innerHeight - 400 - 16
                  ) + 'px',
              left: window.innerWidth < 768 
                ? '50%' 
                : Math.max(8, Math.min(
                    containerRef.current?.getBoundingClientRect().left || 0,
                    window.innerWidth - 340 - 8
                  )) + 'px',
              transform: window.innerWidth < 768 ? 'translate(-50%, -50%)' : 'none',
            }}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <CustomDropdown
                label={t('addPet.month')}
                options={monthOptions}
                value={displayMonth}
                onChange={(m) => {
                  const newDate = selectedDate 
                    ? new Date(selectedDate.getFullYear(), m, selectedDate.getDate())
                    : new Date(displayYear, m, 1);
                  setSelectedDate(newDate);
                }}
                insideModal={true}
              />

              <CustomDropdown
                label={t('addPet.year')}
                options={yearOptions}
                value={displayYear}
                onChange={(y) => {
                  const newDate = selectedDate 
                    ? new Date(y, selectedDate.getMonth(), selectedDate.getDate())
                    : new Date(y, displayMonth, 1);
                  setSelectedDate(newDate);
                }}
                insideModal={true}
              />
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-7 text-center text-[11px] text-[#8a8880] mb-2 font-semibold uppercase tracking-[0.05em]">
                {weekDays.map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array(firstDay === 0 ? 6 : firstDay - 1).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="py-2" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const selected = isSelectedDay(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`w-full p-2 text-[13.5px] transition-colors duration-150 cursor-pointer ${
                        selected
                          ? 'bg-[#0b0b0a] text-white font-semibold'
                          : 'hover:bg-[#0b0b0a] hover:text-white text-[#5c5a54]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 border border-black/10 cursor-pointer text-[13.5px] font-medium text-[#0b0b0a] hover:border-black/30 transition-colors duration-200"
              >
                {t('addPet.cancel')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!selectedDate}
                className={`flex-1 py-3 text-[13.5px] font-medium tracking-[0.02em] transition-all duration-200 ${
                  selectedDate
                    ? 'cursor-pointer text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px'
                    : 'bg-black/5 text-[#8a8880] border border-black/10 cursor-not-allowed'
                }`}
              >
                {t('addPet.apply')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Main AddPetModal ────────────────────────────────────────────────────────
export function AddPetModal({ isOpen, onClose, onSuccess, petToEdit }) {
  const { t } = useTranslation("myaccount");
  const isEditMode = !!petToEdit;

  const emptyForm = {
    name: '',
    category: '',
    breed: '',
    age: '',
    gender: '',
    weight: '',
    specialNeeds: [],
    image: null,
    imageFile: null
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const modalCardRef = useRef(null);
  // Same pop-in/pop-out lifecycle as LogoutModal.jsx — stays mounted for
  // the exit animation's duration instead of unmounting the instant
  // isOpen flips. Shared by the main form and the success screen (mutually
  // exclusive); the image preview lightbox gets its own since it can be
  // open at the same time as the main form.
  const [isClosing, setIsClosing] = useState(false);
  const [isPreviewClosing, setIsPreviewClosing] = useState(false);

  useEffect(() => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      const cats = splashData?.categories || [];
      setCategoryOptions(cats.map(c => ({ value: c.id, label: c.name })));
    } catch { setCategoryOptions([]); }
  }, []);

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && petToEdit) {
      setFormData({
        name: petToEdit.name || '',
        category: petToEdit.category_id || '',
        breed: petToEdit.breed || '',
        age: petToEdit.age || '',
        gender: petToEdit.gender || '',
        weight: petToEdit.weight || '',
        specialNeeds: petToEdit.special_need ? petToEdit.special_need.split(',').map(s => s.trim()).filter(Boolean) : [],
        image: petToEdit.profile_picture ? `${MEDIA_URL}${petToEdit.profile_picture}` : null,
        imageFile: null
      });
    } else if (isOpen && !petToEdit) {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [isOpen, petToEdit]);

  useEffect(() => {
    if (isOpen || isSuccessModalOpen || showImagePreview) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
     
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, isSuccessModalOpen, showImagePreview]);

  const getToken = () => {
    try {
      const splashData = JSON.parse(localStorage.getItem('splashData') || '{}');
      return splashData?.user?.token || localStorage.getItem('token') || '';
    } catch { return ''; }
  };

  // Required-field check — mirrors the fields the API actually needs
  // (special needs stays optional, per its "(Optional)" label). Run before
  // the request fires so a missing field never even reaches the API.
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('addPet.errors.nameRequired');
    if (!formData.category) newErrors.category = t('addPet.errors.categoryRequired');
    if (!formData.breed) newErrors.breed = t('addPet.errors.breedRequired');
    if (!formData.age) newErrors.age = t('addPet.errors.ageRequired');
    if (!formData.gender) newErrors.gender = t('addPet.errors.genderRequired');
    if (!formData.weight) newErrors.weight = t('addPet.errors.weightRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const body = new FormData();
      if (isEditMode) body.append('pet_id', petToEdit.id);
      body.append('category_id', formData.category);
      body.append('breed', formData.breed);
      body.append('name', formData.name);
      body.append('age', formData.age);
      body.append('gender', formData.gender);
      body.append('weight', formData.weight);
      if (formData.specialNeeds.length > 0) body.append('special_need', formData.specialNeeds.join(','));
      if (formData.imageFile) body.append('profile_picture', formData.imageFile);

      const endpoint = isEditMode ? `${BASE_URL}/user/pet/edit` : `${BASE_URL}/user/pet/create`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body
      });
      const data = await res.json();
      if (data?.status === false) {
        toast.error(data?.action_message || data?.action || 'Something went wrong.');
      } else if (res.ok || data?.status) {
        if (isEditMode) {
          onSuccess?.();
          onClose();
        } else {
          setIsSuccessModalOpen(true);
        }
      } else {
        console.error('Pet save failed:', data);
      }
    } catch (e) {
      console.error('Pet save error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result, imageFile: file }));
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => document.getElementById('pet-image-upload').click();

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null, imageFile: null }));
    setShowImagePreview(false);
    document.getElementById('pet-image-upload').value = '';
  };

  const handleImageClick = () => {
    if (formData.image) setShowImagePreview(true);
  };

  const handleClosePreview = () => {
    setIsPreviewClosing(true);
    setTimeout(() => { setIsPreviewClosing(false); setShowImagePreview(false); }, 250);
  };

  if (!isOpen && !isClosing) return null;

  const genderOptions = [
    { value: 'male', label: t('addPet.genders.male') },
    { value: 'female', label: t('addPet.genders.female') },
    { value: 'unknown', label: t('addPet.genders.unknown') },
  ];

  const weightOptions = [
    { value: '0-5', label: t('addPet.weights.0-5') },
    { value: '5-10', label: t('addPet.weights.5-10') },
    { value: '10-20', label: t('addPet.weights.10-20') },
    { value: '20-30', label: t('addPet.weights.20-30') },
    { value: '30+', label: t('addPet.weights.30+') },
  ];

  const breedOptions = [
    { value: 'labrador_retriever', label: t('addPet.breeds.labrador') },
    { value: 'german_shepherd', label: t('addPet.breeds.germanShepherd') },
    { value: 'golden_retriever', label: t('addPet.breeds.goldenRetriever') },
    { value: 'bulldog', label: t('addPet.breeds.bulldog') },
    { value: 'beagle', label: t('addPet.breeds.beagle') },
    { value: 'poodle', label: t('addPet.breeds.poodle') },
    { value: 'rottweiler', label: t('addPet.breeds.rottweiler') },
  ];

  const specialNeedsOptions = [
    { value: 'dietary_restrictions', label: t('addPet.specialNeeds.dietary') },
    { value: 'allergies', label: t('addPet.specialNeeds.allergies') },
    { value: 'vision_support', label: t('addPet.specialNeeds.vision') },
    { value: 'hearing_support', label: t('addPet.specialNeeds.hearing') },
    { value: 'medication_requirements', label: t('addPet.specialNeeds.medication') },
    { value: 'mobility_assistance', label: t('addPet.specialNeeds.mobility') },
    { value: 'grooming_sensitivities', label: t('addPet.specialNeeds.grooming') },
    { value: 'behavioral_needs', label: t('addPet.specialNeeds.behavioral') },
  ];

  const handleBackdropClick = () => {
    if (modalCardRef.current) {
      modalCardRef.current.classList.add('modal-shake');
      modalCardRef.current.addEventListener('animationend', () => {
        modalCardRef.current?.classList.remove('modal-shake');
      }, { once: true });
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 250);
  };

  const handleCloseAll = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsSuccessModalOpen(false);
      setFormData({
        name: '',
        category: '',
        breed: '',
        age: '',
        gender: '',
        weight: '',
        specialNeeds: [],
        image: null,
        imageFile: null
      });
      setErrors({});
      onSuccess?.();
      onClose();
    }, 250);
  };

  return (
    <>
      {/* Main Add Pet Modal */}
      {!isSuccessModalOpen && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-60 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`} onClick={handleBackdropClick}>
          <div
            ref={modalCardRef}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}
          >
            {/* Dark editorial header band — kept compact so it doesn't push the form below the fold */}
            <div className="relative bg-gradient-to-br from-[#211e1a] to-[#0b0b0a] px-5 sm:px-8 py-5 sm:py-10 shrink-0 overflow-hidden flex items-center gap-4 border-b border-white/5">
              <PiPawPrint className="pointer-events-none absolute -right-6 -top-8 w-32 h-32 text-white/[0.05] rotate-[18deg]" />

              <div className="relative w-11 h-11 flex items-center justify-center bg-white/10 border border-white/15 shrink-0">
                <PiPawPrint className="w-5 h-5 text-white" />
              </div>

              <div className="relative min-w-0 pr-10">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* <span className="w-1.5 h-1.5 rounded-full bg-[#DFB400] shrink-0" />
                  <span className="text-[10.5px] font-semibold tracking-[0.14em] uppercase text-white/40">
                    {isEditMode ? 'Edit profile' : 'New companion'}
                  </span> */}
                </div>
                <h2 className="text-[19px] sm:text-[21px] font-extrabold leading-[1.05] tracking-tight text-white">
                  {isEditMode ? 'Edit Pet' : t('addPet.title')}
                </h2>
                <p className="text-[12px] text-white/40 mt-1 leading-snug">
                  {isEditMode ? 'Update your pet\'s details below.' : 'Fill in your pet\'s details to get personalised recommendations.'}
                </p>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close"
                className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 flex items-center justify-center w-9 h-9 border border-white/15 text-white/70 hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
              >
                <IoClose size={18} />
              </button>
            </div>

            {/* Scrollable Content — a PetProfile-style photo panel beside a two-column field grid */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-7">
                {/* Photo panel */}
                <div className="w-full sm:w-[150px] shrink-0 flex flex-col gap-2">
                  {/* Image box — click to preview if image exists */}
                  <div
                    onClick={handleImageClick}
                    className={`relative w-full h-40 sm:h-[313px] bg-gradient-to-br from-black/[0.05] to-black/[0.02] border border-black/10 overflow-hidden ${formData.image ? 'cursor-zoom-in' : 'cursor-default'}`}
                  >
                    {formData.image ? (
                      <img src={formData.image} alt="Pet preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PiPawPrint className="w-10 h-10 text-black/15" />
                      </div>
                    )}
                  </div>

                  {/* Upload / Remove button */}
                  {formData.image ? (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold tracking-[0.06em] uppercase border border-red-200 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200 cursor-pointer"
                    >
                      <IoTrashOutline className="w-3.5 h-3.5" />
                      Remove Photo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold tracking-[0.06em] uppercase border border-black/10 text-[#0b0b0a] bg-white hover:bg-[#0b0b0a] hover:text-white hover:border-[#0b0b0a] transition-colors duration-200 cursor-pointer"
                    >
                      <IoCloudUploadOutline className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>
                  )}

                  <input
                    id="pet-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Field grid — exactly two fields per row */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-[#8a8880] mb-2">{t('addPet.petName')}</label>
                      <input
                        type="text"
                        placeholder={t('addPet.petNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-3 text-[14px] text-[#0b0b0a] border outline-none placeholder:text-[#8a8880] transition-colors duration-200 ${
                          errors.name ? 'border-red-400' : 'border-black/10 focus:border-black/30'
                        }`}
                      />
                      <FieldError message={errors.name} />
                    </div>

                    <div>
                      <CustomDropdown
                        label={t('addPet.category')}
                        placeholder={t('addPet.selectCategory')}
                        options={categoryOptions}
                        value={formData.category}
                        onChange={(val) => handleChange('category', val)}
                        error={!!errors.category}
                      />
                      <FieldError message={errors.category} />
                    </div>

                    <div>
                      <CustomDropdown
                        label={t('addPet.breed')}
                        placeholder={t('addPet.selectBreed')}
                        options={breedOptions}
                        value={formData.breed}
                        onChange={(val) => handleChange('breed', val)}
                        error={!!errors.breed}
                      />
                      <FieldError message={errors.breed} />
                    </div>

                    <div>
                      <CustomDropdown
                        label={t('addPet.gender')}
                        placeholder={t('addPet.selectGender')}
                        options={genderOptions}
                        value={formData.gender}
                        onChange={(val) => handleChange('gender', val)}
                        error={!!errors.gender}
                      />
                      <FieldError message={errors.gender} />
                    </div>

                    <div>
                      <AgePicker
                        value={formData.age}
                        onChange={(val) => handleChange('age', val)}
                        error={!!errors.age}
                      />
                      <FieldError message={errors.age} />
                    </div>

                    <div>
                      <CustomDropdown
                        label={t('addPet.weight')}
                        placeholder={t('addPet.selectWeight')}
                        options={weightOptions}
                        value={formData.weight}
                        onChange={(val) => handleChange('weight', val)}
                        error={!!errors.weight}
                      />
                      <FieldError message={errors.weight} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <MultiSelectDropdown
                      label={t('addPet.specialNeedsLabel')}
                      options={specialNeedsOptions}
                      value={formData.specialNeeds}
                      onChange={(vals) => handleChange('specialNeeds', vals)}
                      placeholder={t('addPet.selectSpecialNeeds')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-black/10 bg-white shrink-0 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 text-[13.5px] font-medium text-[#0b0b0a] border border-black/10 bg-white hover:border-black/30 transition-colors duration-200 cursor-pointer"
              >
                {t('addPet.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {isSubmitting
                  ? (isEditMode ? 'Updating...' : 'Adding...')
                  : (isEditMode ? 'Update Pet' : t('addPet.addPetButton'))
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4 ${isPreviewClosing ? 'backdrop-out' : 'backdrop-in'}`}
          onClick={handleClosePreview}
        >
          <div className={`relative max-w-[90vw] max-h-[90vh] ${isPreviewClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
            <button
              onClick={handleClosePreview}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 flex items-center justify-center w-9 h-9 border border-white/15 bg-[#0b0b0a] text-white hover:bg-white hover:text-[#0b0b0a] hover:border-white transition-colors duration-200 cursor-pointer"
            >
              <FiX size={18} />
            </button>
            <img
              src={formData.image}
              alt="Pet Preview"
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 z-70 ${isClosing ? 'backdrop-out' : 'backdrop-in'}`}>
          <div className={`bg-white w-full max-w-xl shadow-[0_50px_110px_-30px_rgba(0,0,0,.55)] overflow-hidden ${isClosing ? 'modal-pop-out' : 'modal-pop-in'}`}>
            <div className="bg-[#0b0b0a] px-8 pt-8 pb-7 flex flex-col items-center text-center">
              <img src="successpet.svg" alt="" className="w-24 h-24 mb-5" />
              <h2 className="text-[22px] font-extrabold leading-[1.05] tracking-tight text-white">
                {t('addPet.success.title')}
              </h2>
            </div>

            <div className="px-8 py-7 text-center">
              <p className="text-[14px] text-[#5c5a54] leading-relaxed">
                {t('addPet.success.earnedPoints')} <span className="text-[#DFB400] font-semibold">{t('addPet.success.pointsAmount')}</span> {t('addPet.success.forAdding')}
              </p>
              <p className="text-[14px] text-[#5c5a54] leading-relaxed mb-7">
                {t('addPet.success.recommendations')}
              </p>

              <button
                onClick={handleCloseAll}
                className="w-full py-3.5 text-[13.5px] font-medium tracking-[0.02em] text-white bg-gradient-to-b from-[#25221e] to-[#0b0b0a] border border-[#0b0b0a] transition-all duration-200 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,.65)] hover:-translate-y-px cursor-pointer"
              >
                {t('addPet.success.okay')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}