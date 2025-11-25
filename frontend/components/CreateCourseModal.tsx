import { useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface CreateCourseModalProps {
  onClose: () => void;
  onCreated?: () => void; // optional callback to refresh course list
}

export const CreateCourseModal = ({ onClose, onCreated }: CreateCourseModalProps) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title || !price || !description || !image) {
      return toast.error("All fields including image are required");
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", String(price));
      formData.append("description", description);
      formData.append("image", image);

      const response = await api.post("/course/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success(response.data.message || "Course created successfully!");

      onClose();
      if (onCreated) onCreated(); // refresh course list in dashboard

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error creating course");
    }
  };

  // Display course image in form
  const changePhotoHandler = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImage(file);
    };
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-700">Create New Course</h2>
          <button onClick={onClose} className="text-gray-600 text-xl">✕</button>
        </div>

        {/* Title */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Course Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Price (₹)</label>
          <input
            type=""
            className="w-full border p-2 rounded mt-1"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Description</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Upload Course Image</label>
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Course Preview" 
              className="w-52 h-28 object-fill rounded-lg border border-gray-300 mb-3"
            />
          )}
          {!imagePreview && (
            <div className="w-52 h-28 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 text-gray-500 mb-3"
            >
              No image selected
            </div>
          )}
          <input
            className="text-gray-900 border p-2 rounded w-full mb-4"
            type="file"
            accept="image/*"
            onChange={changePhotoHandler}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create Course
        </button>
      </motion.div>
    </div>
  );
};
