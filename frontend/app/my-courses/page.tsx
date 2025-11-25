"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function MyCoursesPage() {
  const user = useAppStore(state => state.user);

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // protect page from unauthorized access
  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  if (!user) return null; // prevents page from flashing before redirect.

  // Renders purchased courses
  useEffect(() => {
    const fetchPurchased = async () => {
      try {
        const res = await api.get("/user/purchases", {
          withCredentials: true,
        });

        if (!res.data.success || res.data.coursesData.length === 0) {
          setCourses([]);
        } else {
          setCourses(res.data.coursesData);
        }
      } catch (err) {
        toast.error("Failed to load purchased courses");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchased();
  }, []);

  // Empty state
  if (courses.length === 0)
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col">
        <Navbar />

        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <h2 className="text-2xl font-semibold mt-4 text-gray-700">
            No Purchased Courses Yet
          </h2>
          <p className="text-gray-500 mt-2">Explore courses and start learning!</p>

          <Link
            href="/user"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Explore Courses
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navbar />

      <div className="px-10 md:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {loading ? (
            <p className="text-center text-lg mt-10">Loading your courses...</p>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
              >
                <Image
                  src={course.image.url}
                  alt={course.title}
                  width={400}
                  height={250}
                  className="rounded-lg w-full h-[180px] object-fill"
                />

                <h2 className="text-xl font-semibold mt-3 text-gray-800">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {course.description}
                </p>

                <Link
                  href={"http://www.youtube.com/@ByteMyNotes"}
                  className="mt-4 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Course
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
