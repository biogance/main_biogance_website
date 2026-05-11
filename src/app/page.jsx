'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from "@/Components/Pages/Landing/MainVideo";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('LoginData')) {
      router.replace('/my-account');
    }
  }, []);

  return (
    <div>
     <HeroSection/>
    </div>
  );
}
