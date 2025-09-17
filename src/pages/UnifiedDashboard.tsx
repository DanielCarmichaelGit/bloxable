import { motion } from "framer-motion";
import { useAccount } from "@/contexts/AccountProvider";
import BuyerDashboard from "./BuyerDashboard";
import SellerDashboard from "./SellerDashboard";

export default function UnifiedDashboard() {
  const { currentProfile, isSeller, isBuyer, loading } = useAccount();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No Profile Found
          </h2>
          <p className="text-muted-foreground">
            Please create a profile to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isSeller && <SellerDashboard />}
      {isBuyer && <BuyerDashboard />}
    </motion.div>
  );
}
