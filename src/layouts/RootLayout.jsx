import { useState } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Landing from "../pages/Landing";

export default function RootLayout() {
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  return (
    <div className="min-h-screen gradient-bg">
      <SignedIn>
        <Header />
        <main className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto space-y-12">
          <Outlet context={{ selectedMonth, setSelectedMonth }} />
        </main>
      </SignedIn>
      <SignedOut>
        <Landing />
      </SignedOut>
    </div>
  );
}
