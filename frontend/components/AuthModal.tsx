"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Forgot Password Popup
const ForgotPasswordModal = ({
  onClose,
}: {
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const handleSubmit = async () => {
    try {
      const endpoint =
        role === "admin"
          ? "/admin/forgot-password"
          : "/user/forgot-password";

      const response = await api.post(endpoint, { email, newPassword });

      toast.success(response.data.message);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center z-2000">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-700">Forgot Password</h2>
          <button onClick={onClose} className="text-gray-600 text-xl">✕</button>
        </div>

        {/* Role */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Select Role</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Email */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm font-semibold">New Password</label>
          <input
            type="password"
            className="w-full border p-2 rounded mt-1"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </motion.div>
    </div>
  );
};

// Login / Signup Modal
export const AuthModal = ({
  type,
  onClose,
}: {
  type: "login" | "register";
  onClose: () => void;
}) => {
  const setUser = useAppStore((state) => state.setUser);

  const [role, setRole] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");

  const [showForgot, setShowForgot] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const endpoint =
        role === "admin"
          ? `/admin/${type}`
          : `/user/${type}`;

      const payload =
        type === "register"
          ? { name, referralCode, email, password }
          : { email, password };

      const response = await api.post(endpoint, payload);

      if (type === "login") {
        const user = response.data.user;

        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: role,
          token: response.data.token,
          credits: user.credits,
          referralCode: user.referralCode,
        });
      }

      toast.success(response.data.message || "Login successful!");

      // Role-based redirect here
      if (role == "admin") {
        router.push("/admin");
      } else {
        router.push("/user");
      }

      // For register, keep normal behavior
      if (type === "register") {
        toast.success(response.data.message || "Signup successful!");
      }

      onClose();

    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      {/* Forgot Password Popup */}
      {showForgot && (
        <ForgotPasswordModal onClose={() => setShowForgot(false)} />
      )}

      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex justify-center items-center z-999">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-700 capitalize">{type}</h2>
            <button onClick={onClose} className="text-gray-600 text-xl">✕</button>
          </div>

          {/* Role */}
          <div className="mt-4">
            <label className="text-sm font-semibold">Select Role</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Name - Signup */}
          {type === "register" && (
            <div className="mt-4">
              <label className="text-sm font-semibold">Full Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* ReferralCode - Signup */}
          {type === "register" && (
            <div className="mt-4">
              <label className="text-sm font-semibold">
                Referred Code <span className="font-medium text-gray-700">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={referralCode}
                onChange={(e) => {
                  const input = e.target.value

                  const extracted =
                    input.includes("ref=") 
                      ? input.split("ref=")[1].trim() 
                      : input.trim()
                  setReferralCode(extracted);
                }}
              />
            </div>
          )}

          {/* Email */}
          <div className="mt-4">
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="text-sm font-semibold">Password</label>
            <input
              type="password"
              className="w-full border p-2 rounded mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Forgot Password Link (Login only) */}
          {type === "login" && (
            <p
              className="mt-2 text-sm text-blue-600 cursor-pointer hover:underline"
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {type === "register" ? "Create Account" : "Login"}
          </button>
        </motion.div>
      </div>
    </>
  );
};
