import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { div } from "framer-motion/client";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (route: string) =>
    pathname === route ? "text-yellow-500 border-b-3 border-yellow-500" : "text-white";

  return (
    <nav className="w-full bg-blue-800 shadow-sm px-4 sm:px-10 py-3">
      <div className="flex justify-between items-center">
        <Link href={"/"}>
          <Image
            src="/logo.png"
            alt="logo"
            width={60}
            height={60}
            className="rounded-full border-4 border-yellow-600 cursor-pointer"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-lg font-medium">
          <Link href="/" className={`${isActive("/")}`}>
            Dashboard
          </Link>

          <Link href="/user" className={`${isActive("/user")}`}>
            Courses
          </Link>

          <Link href="/my-courses" className={`${isActive("/my-courses")}`}>
            My Courses
          </Link>

          <Link href="/credit-transaction" className={`${isActive("/credit-transaction")}`}>
            Credit History
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Moblie Dropdown Menu */}
      {open && (
        <div className="flex flex-col gap-4 mt-4 md:hidden bg-blue-700 p-4 rounded-lg text-lg font-medium">
          <Link 
            href="/"
            className={`${isActive("/")}`}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/user"
            className={`${isActive("/user")}`}
            onClick={() => setOpen(false)}
          >
            Courses
          </Link>

          <Link
            href="/my-courses"
            className={`${isActive("/my-courses")}`}
            onClick={() => setOpen(false)}
          >
            My Courses
          </Link>

          <Link
            href="/credit-transaction"
            className={`${isActive("/credit-transaction")}`}
            onClick={() => setOpen(false)}
          >
            Credit History
          </Link>
        </div>
      )}
    </nav>
  );
}
