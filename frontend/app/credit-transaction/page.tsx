"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface ICreditTransaction {
  _id: string;
  type: "EARNED" | "USED";
  amount: number;
  description: string;
  relatedPurchase?: string;
  createdAt: string;
}

export default function CreditTransactionsPage() {
  const user = useAppStore((state) => state.user);

  const [transactions, setTransactions] = useState<ICreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // protect page from unauthorized access
  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  if (!user) return null; // prevents page from flashing before redirect.

  // Renders credit transactions
  useEffect(() => {

    const fetchTransactions = async () => {
      try {
        const res = await api.get("/user/credits-history", {
          withCredentials: true,
        });

        setTransactions(res.data.transactions || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Error fetching history");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 my-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-5">
          Credit Transactions
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-500">No credit transactions found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {transactions.map((tx) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border rounded-xl shadow-md bg-white p-4 flex items-center justify-between"
              >
                {/* Left side */}
                <div>
                  <p className="text-lg font-semibold">
                    {tx.type === "EARNED" ? "+" : "-"} {tx.amount} Credits
                  </p>

                  <p className="text-gray-600 mt-1">{tx.description}</p>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Clock size={16} />
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>

                  {tx.relatedPurchase && (
                    <p className="text-xs text-gray-500 mt-1">
                      Related Purchase: {tx.relatedPurchase}
                    </p>
                  )}
                </div>

                {/* Right side badge */}
                <div
                  className={`px-3 py-1 text-sm rounded-full font-semibold flex items-center gap-1
                    ${
                      tx.type === "EARNED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {tx.type === "EARNED" ? (
                    <ArrowUpCircle size={18} />
                  ) : (
                    <ArrowDownCircle size={18} />
                  )}
                  {tx.type}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div> 
  );
}
