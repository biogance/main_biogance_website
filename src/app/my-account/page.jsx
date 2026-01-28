import { Suspense } from 'react';
import MyAccount from "@/Components/Pages/MyAccount/MyAccount";

export default function MyAccountPage() {
  return (
    <Suspense>
      <MyAccount />
    </Suspense>
  );
}
