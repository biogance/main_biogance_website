// import { useState } from 'react';
// import { AiOutlineClose } from 'react-icons/ai';

// export default function App() {
//   const [email, setEmail] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Reset link sent to:', email);
//   };

//   const handleClose = () => {
//     console.log('Close button clicked');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
//         {/* Close Button */}
//         <button
//           type="button"
//           onClick={handleClose}
//           className="absolute -top-3 -right-3 w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
//         >
//           <AiOutlineClose className="w-5 h-5" />
//         </button>

//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl mb-3">Forgot your Password?</h1>
//           <p className="text-gray-600 text-sm leading-relaxed">
//             Enter your registered email address and we'll send you a link to create a new password.
//           </p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="block text-sm mb-2">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               placeholder="eg: john_doe@gmail.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm bg-gray-50"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
//           >
//             Send Reset Link
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }