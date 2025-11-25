"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAppStore } from "@/lib/store";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: { url: string };
}

export default function DashboardPage() {
  const user = useAppStore((state) => state.user); // logged-in user

  const [courses, setCourses] = useState<Course[]>([]);
  const [refData, setRefData] = useState<any>(null);

  const router = useRouter();

  // protects page from unauthorized access
  useEffect(()=> {
    if (!user) router.push("/");
  }, [user]);

  if (!user) return null; // prevents page from flashing before redirect.

  // Renders courses and referral data
  useEffect(() => {
    fetchCourses();
    fetchRefData();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/course");
      setCourses(response.data.courses || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch courses");
    }
  };

  // Calculates discountedPrice (integer) 
  const getDiscountedPrice = (price: number, discountPercent = 10) => {
    if (!price || isNaN(price)) {
      return 0;
    }
    const discount = (price * discountPercent) / 100;
    const finalPrice = price - discount;

    return Math.round(finalPrice);
  };

  const fetchRefData = async () => {
    try {
      const response = await api.get("/user/referral-details", {
        withCredentials: true,
      });
      setRefData(response.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch referral data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="max-w-6xl mx-auto mt-8 p-4">
        {/* Metrics Section */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome back, {user?.name}!
        </h1>

        {refData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-red-600 shadow-md p-6 rounded-xl"
            >
              <p className="text-white font-medium">Referred Users</p>
              <h2 className="text-3xl font-bold text-white">
                {refData.totalReferrals}
              </h2>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-600 shadow-md p-6 rounded-xl"
            >
              <p className="text-white font-medium">Converted Users</p>
              <h2 className="text-3xl font-bold text-white">
                {refData.convertedReferrals}
              </h2>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-yellow-600 shadow-md p-6 rounded-xl"
            >
              <p className="text-white font-medium">Credits Earned</p>
              <h2 className="text-3xl font-bold text-white">
                {refData.totalCredits}
              </h2>
            </motion.div>
          </div>
        )}

        {refData?.referralLink && (
          <div className="bg-white shadow-md rounded-xl p-5 mb-10">
            <h2 className="text-md font-semibold text-gray-800 mb-2">
              Boost your credits! Invite friends with your referral link. You earn 200 credits when they buy — and they get 200 credits too.
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={refData.referralLink}
                readOnly
                className="flex-1 border px-3 py-2 rounded-lg bg-gray-100 text-gray-700"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(refData.referralLink);
                  toast.success("Referral link copied!");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Courses Section */}
        <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white shadow-md rounded-xl p-4"
            >
              <Image
                src={course.image.url}
                alt={course.title}
                width={400}
                height={250}
                className="w-full rounded-lg"
              />

              <div className="p-4 flex flex-col grow">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                  {course.title}
                </h2>

                <p className="text-gray-600 text-sm mb-3 grow line-clamp-3">
                  {course.description}
                </p>

                {/* Price & Discount */}
                <div className="flex justify-between items-center mb-3 text-sm">
                  <div className="space-x-1">
                    <span className="font-bold text-blue-600 text-lg">
                      ₹{getDiscountedPrice(course.price)}
                    </span>
                    <span className="line-through text-gray-400">
                      ₹{course.price}
                    </span>
                  </div>
                  <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded">
                    10% OFF
                  </span>
                </div>

                {/* Button */}
                <Link 
                  href={`/buy/${course._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg block text-center"
                  >
                  Buy Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
