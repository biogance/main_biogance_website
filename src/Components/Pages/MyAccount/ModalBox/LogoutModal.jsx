"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "../../../../redux/features/authSlice";

export default function LogoutModal({
  isOpen,
  onClose,
})
{
  const dispatch = useDispatch();
  const router = useRouter();


   useEffect(() => {
      if (isOpen) {
        // Save current scroll position
        const scrollY = window.scrollY;
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        
        return () => {
          // Restore scrolling
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          
          // Restore scroll position
          window.scrollTo(0, scrollY);
        };
      }
    }, [isOpen]);
  if (!isOpen) return null;
  
    const handleLogout = () => {
      dispatch(logout());
      router.push('/');
      onClose();
    };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-7 text-center">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Account Logout
          </h2>

          <p className="text-black text-md font-medium mb-8 leading-relaxed">
            Are you sure you want to Logout from this Account?
           
            <br />
            <span className="text-gray-500 font-medium">
              This action cannot be undone.
            </span>
          </p>

          <div className="flex flex-col gap-4 justify-center">
           

            <button
              type="button"
              onClick={handleLogout}
                
              className={`
                px-8 py-3.5 rounded-xl font-medium text-white
                bg-[#D00416] hover:bg-red-700 active:bg-red-800
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2
                active:scale-[0.98] shadow-sm
              `}
            >
              Yes, Logout
            </button>
             <button
              type="button"
              onClick={onClose}
              className={`
                px-8 py-3.5 rounded-xl font-medium text-gray-800
                border border-gray-300 hover:bg-gray-100 active:bg-gray-300
                transition-colors duration-150 cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-gray-400/50
                active:scale-[0.98]
              `}
            >
              No, Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}