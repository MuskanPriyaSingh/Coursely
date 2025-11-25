"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store";

export default function BuyPage() {
  const user = useAppStore((state) => state.user);
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // protects page from unauthorized access
  useEffect(() => {
    if (!user) router.push("/");
  }, [user])

  if(!user) return null; // prevents page from flashing before redirect.

  // Renders course details and credit to use for purchase
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, refRes] = await Promise.all([
          api.get(`/course/${courseId}`),
          api.get("/user/referral-details", { withCredentials: true }),
        ]);

        setCourse(courseRes.data.course);
        setCredits(refRes.data.totalCredits || 0);

      } catch (err) {
        toast.error("Error loading course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const getDiscountedPrice = (price: number, discountPercent = 10) => {
    return Math.round(price - (price * discountPercent) / 100);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!course) return <p className="text-center mt-10">Course not found</p>;

  const discountedPrice = getDiscountedPrice(course.price);
  const finalAmount = Math.max(0, discountedPrice - creditsToUse);

  const handlePurchase = async () => {
    try {
      await api.post(
        `/course/purchase/${courseId}`,
        { useCredits: creditsToUse },
        { withCredentials: true }
      );

      setShowSuccess(true);

      setTimeout(() => {
        router.push("/my-courses");
      }, 2000);

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Purchase failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 md:p-6">

        {/* Course detail */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Image
            src={course.image.url}
            alt={course.title}
            width={260}
            height={170}
            className="rounded-xl shadow w-full md:w-60 object-fill"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-600 mt-2">{course.description}</p>

            <div className="flex justify-between items-center mt-3">
              <div className="space-x-2">
                <span className="font-bold text-blue-600 text-2xl">
                  ₹{discountedPrice}
                </span>
                <span className="line-through text-gray-400 text-xl">
                  ₹{course.price}
                </span>
              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-semibold">
                10% OFF
              </span>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">Use Credits <span className="text-gray-500 font-normal">(optional)</span></h2>

          <p className="text-gray-600 mt-2">
            Available Credits : <strong>{credits}</strong>
          </p>

          <input
            type=""
            min={0}
            max={credits}
            className="border p-3 rounded mt-4 w-full md:w-48 text-lg"
            value={creditsToUse}
            onChange={(e) => {
              let value = e.target.value;

              if (value === "") {
                setCreditsToUse(0);
                return;
              }

              const numericValue = Number(value);

              if (numericValue < 0) {
                setCreditsToUse(0);
                return;
              }

              // Apply credit limit
              setCreditsToUse(Math.min(numericValue, credits));
            }}
          />

          <p className="text-xl font-semibold mt-4">
            Final Amount:{" "}
            <span className="text-blue-600">₹{finalAmount}</span>
          </p>
        </div>

        <button
          onClick={handlePurchase}
          className="w-full py-3 mt-8 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
        >
          Confirm Purchase
        </button>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-bounce">
            <h2 className="text-3xl font-bold text-green-600">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">Redirecting to My Courses...</p>
          </div>
        </div>
      )}
    </div>
  );
}
