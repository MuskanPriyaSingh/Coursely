"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { UpdateCourseModal } from "@/components/UpdateCourseModal";
import { CreateCourseModal } from "@/components/CreateCourseModal";
import logo from "@/public/logo.png";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: { url: string };
  creatorId: string;   
}

export default function AdminDashboard() {
  const admin = useAppStore((state) => state.user); // logged-in admin

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const router = useRouter();

  // protects page from unauthorized access
  useEffect(() => {
    if (!admin) router.push("/");
  }, [admin]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Renders all courses created by admins
  const fetchCourses = async () => {
    try {
      const res = await api.get("/course/");
      setCourses(res.data.courses);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error fetching courses");
    }
  };

  if (!admin) return null; // prevents page from flashing before redirect.
  
  // Update Modal function
  const openUpdateModal = (course: Course) => {
    setSelectedCourse(course);
    setIsUpdateModal(true);
  };

  // Delete a course created by specific admin
  const deleteCourse = async (id: string) => {
    try {
      await api.delete(`/course/${id}`);
      toast.success("Course deleted Successfully!");
      fetchCourses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cannot delete");
    }
  };

  // Logout admin
  const handleLogout = async () => {
    try {
      // Clear zustand state
      useAppStore.getState().user;

      if (!admin) return;

      const response = await api.get("/admin/logout", {
        withCredentials: true,
      })

      toast.success(response.data.message);

      // Clear Zustand user
      useAppStore.getState().logout();

      // Clear persisted storage data
      localStorage.removeItem("coursely");

      router.push("/")

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Logout failed!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="w-full bg-blue-800 shadow-md flex items-center justify-between px-4 sm:px-16 py-3">
        <Image src={logo} alt="logo" width={65} height={60} className="rounded-full border-4 border-yellow-600" />
        <div className="flex gap-1.5 sm:gap-3">
          <button 
            onClick={() => setOpenCreateModal(true)}
            className="text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition px-2 sm:px-4 py-2 rounded-lg border border-white"
          >
            + Create Course
          </button>
          <button
            onClick={handleLogout}
            className="px-2 sm:px-4 py-2 border border-white text-white rounded-lg bg-red-600 hover:bg-red-700 cursor-pointer transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="px-6 md:px-16 py-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome back, {admin?.name}!
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              className="bg-white p-4 rounded-xl shadow"
              whileHover={{ scale: 1.03 }}
            >
              <Image
                src={course.image.url}
                alt={course.title}
                width={600}
                height={300}
                className="rounded-lg w-full sm:w-[415px] h-auto"
              />

              <h2 className="text-lg font-semibold mt-2">{course.title}</h2>
              <p className="text-gray-600 text-sm mb-2">{course.description}</p>
              <p className="font-bold text-blue-600">₹{course.price}</p>

              {/* Ownership check */}
              <div className="mt-4">
                {course.creatorId === admin?.id ? (
                  <div className="flex gap-4">
                    <button
                      onClick={() => openUpdateModal(course)}
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer transition text-white px-3 py-2 rounded"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => deleteCourse(course._id)}
                      className="bg-red-500 hover:bg-red-600 cursor-pointer transition text-white px-3 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Created by another admin
                  </p>
                )}
              </div>
            </motion.div>
            ))}
        </div>
      </div>
      
      {/* Update Modal */}
      {isUpdateModal && selectedCourse && (
        <UpdateCourseModal
          course={selectedCourse}
          onClose={() => setIsUpdateModal(false)}
          onUpdated={fetchCourses} // refresh list
        />
      )}

      {/* Create Modal */}
      {openCreateModal && (
        <CreateCourseModal 
          onClose={() => setOpenCreateModal(false)}
          onCreated={fetchCourses} // refresh list
        />
      )}
    </div>
  );
}
