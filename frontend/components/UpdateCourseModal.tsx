import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: { url: string };
  creatorId: string;   
}

interface UpdateModalProps {
  course: Course;
  onClose: () => void;
  onUpdated: () => void;
}

export const UpdateCourseModal: React.FC<UpdateModalProps> = ({
  course,
  onClose,
  onUpdated
}) => {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(course.price);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setPrice(course.price);
      setImagePreview(course.image.url); 
    }
  }, [course]);


  // Update a course created by specific admin
  const updateCourse = async () => {
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("price", String(price));
      if (image) fd.append("image", image);

      const response = await api.put(`/course/${course._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Course updated Successfully!");
      onUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed!");
    }
  };

  // Handle new image selection
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-120">
        <h2 className="text-2xl text-blue-700 font-semibold text-center mb-4">Update Course</h2>

        <label className="block text-sm font-semibold mb-2">
          Title
        </label>
        <input
          className="text-gray-900 border p-2 rounded w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block text-sm font-semibold mb-2">
          Description
        </label>
        <textarea
          className="text-gray-900 border p-2 rounded w-full mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="block text-sm font-semibold mb-2">
          Price (₹)
        </label>
        <input
          className="text-gray-900 border p-2 rounded w-full mb-3"
          type=""
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />

        <label className="block text-sm font-semibold mb-2">
          Course Image
        </label>
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Course Preview" 
            className="w-52 h-28 object-fill rounded-lg border border-gray-300 mb-3"
          />
        ) : (
          <div className="w-52 h-28 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 text-gray-500 mb-3">
            No image selected
          </div>
        )}
        
        <input
          className="text-gray-900 border p-2 rounded w-full mb-4"
          type="file"
          accept="image/*"
          onChange={changePhotoHandler}
        />

        <div className="flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            onClick={updateCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
