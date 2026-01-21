import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose, IoCalendarOutline } from 'react-icons/io5';
import { PiPawPrint } from 'react-icons/pi';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FaRegEdit } from 'react-icons/fa';

// ── Single Select Custom Dropdown ───────────────────────────────────────────
const CustomDropdown = ({ label, options, value, onChange, placeholder = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-gray-50 border border-gray-200 rounded-lg text-left cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-gray-300
          transition-all duration-200
          ${isOpen ? 'border-gray-400 shadow-sm' : 'hover:border-gray-300'}
        `}
      >
        <span className={!selectedOption ? "text-gray-400" : "text-black"}>
          {displayValue}
        </span>
        <MdOutlineKeyboardArrowDown 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="
            absolute left-0 right-0 top-full mt-1 z-20 max-h-[280px] overflow-auto 
            bg-white rounded-lg shadow-2xl border border-gray-200 py-2 text-sm
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50
          ">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`
                  w-full text-left px-4 py-2.5 cursor-pointer
                  transition-colors duration-150
                  hover:bg-black hover:text-white
                  ${value === option.value ? 'bg-gray-100 font-medium text-black' : 'text-black'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Multi Select Dropdown ───────────────────────────────────────────────────
const MultiSelectDropdown = ({ label, options, value = [], onChange, placeholder = "Select options" }) => {
  const [isOpen, setIsOpen] = useState(false);

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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-gray-50 border border-gray-200 rounded-lg text-left cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-gray-300
          transition-all duration-200
          ${isOpen ? 'border-gray-400 shadow-sm' : 'hover:border-gray-300'}
        `}
      >
        <span className={`truncate ${value.length ? "text-black" : "text-gray-400"}`}>{displayValue}</span>
        <MdOutlineKeyboardArrowDown className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="
            absolute left-0 right-0 top-full mt-1 z-20 max-h-[320px] overflow-auto 
            bg-white rounded-xl shadow-2xl border border-gray-200 py-2 text-sm
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50
          ">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={`group w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${isSelected ? 'bg-gray-100' : 'hover:bg-black hover:text-white'}`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isSelected ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-200'}`}>
                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`transition-colors duration-200 ${isSelected ? 'font-medium text-black' : 'text-black group-hover:text-white'}`}>
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
const AgePicker = ({ value, onChange }) => {
  const { t } = useTranslation("myaccount");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addPet.age')}</label>

      <div className="relative">
        <input
          type="text"
          readOnly
          placeholder={t('addPet.selectBirthdate')}
          value={value ? t('addPet.yearsOld', { years: calculateAge(value) }) : ''}
          onClick={() => setIsOpen(true)}
          className="w-full px-4 text-black py-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
        />
        <IoCalendarOutline className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10 bg-black/30" onClick={() => setIsOpen(false)} />

          <div className="
            absolute left-0 right-0 md:left-auto md:right-0 top-full mt-2 z-30
            bg-white rounded-2xl shadow-2xl border border-gray-200 p-5
            w-full md:w-[340px]
          ">
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
              />
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2 font-medium">
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
                      className={`
                        w-full p-2 text-sm rounded-lg transition-colors cursor-pointer
                        ${selected 
                          ? 'bg-black text-white font-medium' 
                          : 'hover:bg-black hover:text-white text-gray-700'}
                      `}
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
                className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                {t('addPet.cancel')}
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!selectedDate}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${selectedDate ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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
export function AddPetModal({ isOpen, onClose, onAddPet }) {
  const { t } = useTranslation("myaccount");
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    breed: '',
    age: '',
    gender: '',
    weight: '',
    specialNeeds: [],
    image: null
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen || isSuccessModalOpen) {
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
  }, [isOpen, isSuccessModalOpen]);

  const handleSubmit = () => {
    onAddPet(formData);
    setIsSuccessModalOpen(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange('image', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => document.getElementById('pet-image-upload').click();

  const handleRemoveImage = () => {
    handleChange('image', null);
    document.getElementById('pet-image-upload').value = '';
  };

  if (!isOpen) return null;

  const categoryOptions = [
    { value: 'dog', label: t('addPet.categories.dog') },
    { value: 'cat', label: t('addPet.categories.cat') },
    { value: 'bird', label: t('addPet.categories.bird') },
    { value: 'other', label: t('addPet.categories.other') },
  ];

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

  const handleCloseAll = () => {
    setIsSuccessModalOpen(false);
    setFormData({
      name: '',
      category: '',
      breed: '',
      age: '',
      gender: '',
      weight: '',
      specialNeeds: [],
      image: null
    });
    onClose();
  };

  return (
    <>
      {/* Main Add Pet Modal */}
      {!isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="
            bg-white rounded-2xl sm:rounded-3xl 
            w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl 
            h-[90vh] sm:h-auto 
            flex flex-col 
            overflow-hidden
          ">
            {/* Fixed Header */}
            <div className="
              px-5 sm:px-6 py-4 
              border-b border-gray-100 
              bg-white shrink-0
            ">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {t('addPet.title')}
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8">
                {/* Image Section */}
                <div className="flex flex-col items-center gap-4 md:min-w-[160px]">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                    {formData.image ? (
                      <img src={formData.image} alt="Pet preview" className="w-full h-full object-cover" />
                    ) : (
                      <PiPawPrint className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300" />
                    )}
                  </div>

                  {formData.image ? (
                    <div className="flex flex-col gap-2 w-full max-w-[160px]">
                      <button 
                        type="button" 
                        onClick={handleUploadClick} 
                        className="text-sm border border-gray-300 px-5 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        {t('addPet.updateImage')}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleRemoveImage} 
                        className="text-sm text-red-600 font-medium hover:text-red-700 transition-colors text-center"
                      >
                        {t('addPet.remove')}
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleUploadClick} 
                      className="text-sm border border-gray-300 px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t('addPet.uploadImage')}
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

                {/* Form Fields */}
                <div className="flex-1 space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('addPet.petName')}</label>
                      <input
                        type="text"
                        placeholder={t('addPet.petNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
                      />
                    </div>

                    <CustomDropdown
                      label={t('addPet.category')}
                      placeholder={t('addPet.selectCategory')}
                      options={categoryOptions}
                      value={formData.category}
                      onChange={(val) => handleChange('category', val)}
                    />

                    <CustomDropdown
                      label={t('addPet.breed')}
                      placeholder={t('addPet.selectBreed')}
                      options={breedOptions}
                      value={formData.breed}
                      onChange={(val) => handleChange('breed', val)}
                    />

                    <AgePicker
                      value={formData.age}
                      onChange={(val) => handleChange('age', val)}
                    />

                    <CustomDropdown
                      label={t('addPet.gender')}
                      placeholder={t('addPet.selectGender')}
                      options={genderOptions}
                      value={formData.gender}
                      onChange={(val) => handleChange('gender', val)}
                    />

                    <CustomDropdown
                      label={t('addPet.weight')}
                      placeholder={t('addPet.selectWeight')}
                      options={weightOptions}
                      value={formData.weight}
                      onChange={(val) => handleChange('weight', val)}
                    />

                    <div className="md:col-span-2">
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
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="
              px-5 sm:px-6 py-4 
              border-t border-gray-100 
              bg-white shrink-0
              flex flex-col sm:flex-row gap-3 sm:gap-4
            ">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 cursor-pointer border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium order-2 sm:order-1"
              >
                {t('addPet.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 cursor-pointer bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-medium order-1 sm:order-2"
              >
                {t('addPet.addPetButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">
            <div className="flex justify-center mb-6">
              <img src="successpet.svg" alt="" />
            </div>

            <h2 className="text-xl text-black font-semibold text-center mb-3">
              {t('addPet.success.title')}
            </h2>

            <p className="text-center text-gray-700">
              {t('addPet.success.earnedPoints')} <span className='text-[#DFB400] font-semibold'>{t('addPet.success.pointsAmount')}</span> {t('addPet.success.forAdding')}
            </p>
            <p className="text-center text-gray-700 mb-6">
              {t('addPet.success.recommendations')}
            </p>

            <button
              onClick={handleCloseAll}
              className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t('addPet.success.okay')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}