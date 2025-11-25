"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api.ts";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { useAppStore } from "@/lib/store";
import { AnimatedTestimonials } from "@/components/AnimatedTestimonials.tsx";
import { AuthModal } from "@/components/AuthModal";
import Image from 'next/image';
import logo from "@/public/logo.png";
import E_learning from "@/public/undraw_learning-sketchingsh.svg"
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: { url: string };
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState<null | "login" | "register">(null);

  const user = useAppStore((state) => state.user);
  const isLoggedIn = !!user
  
  const router = useRouter();

  // Render top 6 courses 
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/course/");

        if (response.data) {
          setCourses(response.data.courses.slice(0, 6));
        }
      } catch (err) {
        console.log("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleSubscribe = () => {
    if (!email)
      return alert("Please enter an email.");
    toast.success(`Subscribed successfully: ${email}`);
    setEmail("");
  };

  // Logout feature
  const handleLogout = async () => {
    try {
      // Clear zustand state
      useAppStore.getState().user;

      if (!user) return;

      const response = await api.get("/user/logout", {
        withCredentials: true,
      })

      toast.success(response.data.message);

      // Clear Zustand user
      useAppStore.getState().logout();

      // Clear persisted storage data
      localStorage.removeItem("coursely");

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Logout failed!");
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">

      {/* Navbar */}
      <nav className="w-full bg-blue-800 shadow-md px-10 py-3 flex justify-between items-center">
        <Image src={logo} alt="logo" width={60} height={60} className="rounded-full border-4 border-yellow-600" />
        <div className="flex gap-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white text-white rounded-lg hover:bg-red-600 cursor-pointer transition">
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => setOpenModal("login")}
                className="px-4 text-white text-md hover:border-b-3 hover:font-semibold cursor-pointer transition"
              >
                Login
              </button>

              <button
                onClick={() => setOpenModal("register")}
                className="px-4 py-2 text-white border border-white rounded-lg hover:bg-orange-600 cursor-pointer transition"
              >
                SignUp
              </button>
              {openModal && (
                <AuthModal type={openModal} onClose={() => setOpenModal(null)} />
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center px-8 gap-10">

          {/* Left Content */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 leading-tight">
              Learn. Grow.
              <br />
              <span className="text-blue-500">
                <TypeAnimation
                  sequence={[
                    "Upgrade Your Skills",
                    1500,
                    "Build Your Career",
                    1500,
                    "Achieve Your Goals",
                    1500,
                    "Become Future-Ready",
                    1500,
                  ]}
                  speed={50}
                  repeat={Infinity}
                />
              </span>
            </h1>

            <p className="mt-4 text-gray-600 text-lg max-w-lg">
              Coursely helps you master industry-ready tech skills with high-quality courses,
              real-world projects, and a powerful referral rewards system.
            </p>

            <div className="mt-6 flex gap-4">
              {user? (
                <button 
                  onClick={() => router.push("/user")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
                >
                  Explore Courses
                </button>
                ) : (
                <button 
                  onClick={() => setOpenModal("register")}
                  className="px-6 py-3 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer transition"
                >
                  Join Now
                </button>
              )}
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex-1">
            <Image src={E_learning} alt="Learning Illustration" width={450} height={300} />
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="bg-white py-10">
        <h2 className="text-4xl text-center font-bold text-gray-700 mb-4">Explore Our Courses</h2>
        <p className="text-center text-gray-600 mb-4">
          Get <span className="font-semibold text-green-600">10% off</span> on all our courses — <span className="font-semibold text-orange-500 animate-pulse">Limited Time Offer!</span>
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-6">
          {loading ? (
            <p className="text-center col-span-3 text-gray-500">Loading courses...</p>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-lg p-5 border border-blue-100 hover:shadow-xl transition"
              >
                <img src={course.image.url} alt={course.title} className="h-40 w-full object-fill rounded" />
                <h3 className="text-xl font-semibold text-blue-700 mt-2">{course.title}</h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => setOpenModal("register")}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 mt-4"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Animated Testimonials Slider */}
      <section className="pb-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold text-gray-600 mb-2">What Students Are Saying</h2>
          <p className="text-gray-600 mb-10">Trusted by thousands of learners worldwide</p>

          <AnimatedTestimonials />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-blue-600 text-white py-12 mt-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-3">Join Our Newsletter</h2>
          <p className="mb-6 text-blue-100">
            Subscribe to get updates on new courses and exclusive offers
          </p>

          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg border-2 border-white text-black"
            />
            <button
              onClick={handleSubscribe}
              className="px-5 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-100"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white shadow-inner mt-auto">
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">

          <div>
            <h3 className="font-bold text-lg text-blue-700">Coursely</h3>
            <p className="mt-2 text-sm">Your trusted learning platform. Learn, grow, and succeed.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg text-blue-700">Quick Links</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href={"/"} className="hover:text-blue-600">Home</Link>
              </li>
              <li>
                {isLoggedIn? (
                  <Link href={"/user"} className="hover:text-blue-600">Course</Link>
                  ) : (
                  <button 
                    onClick={() => setOpenModal("login")}
                    className="hover:text-blue-600 cursor-pointer transition"
                  >
                    Course
                  </button>
                )}
              </li>
              <li>
                <button 
                  onClick={() => setOpenModal("login")}
                  className="hover:text-blue-600 cursor-pointer transition"
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setOpenModal("register")}
                  className="hover:text-blue-600 cursor-pointer transition"
                >
                  Signup
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-blue-700">Contact</h3>
            <p className="mt-2 text-sm">Email: support@coursely.com</p>
          </div>

        </div>

        <div className="text-center py-4 text-sm text-gray-500 border-t">
          © 2025 Coursely. All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}