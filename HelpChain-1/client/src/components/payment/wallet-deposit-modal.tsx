import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X, ArrowRight, CreditCard, Landmark, Hash, ShieldCheck, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

interface WalletDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS = [1000, 5000, 10000, 25000, 50000];

const PAYMENT_METHODS = [
  { icon: CreditCard, label: "Debit / Credit Card" },
  { icon: Landmark, label: "Bank Transfer" },
  { icon: Hash, label: "USSD" },
];

export function WalletDepositModal({ isOpen, onClose }: WalletDepositModalProps) {
  const [step, setStep] = useState<"amount" | "redirecting">("amount");
  const [raw, setRaw] = useState("");
  const { initializeDeposit, balance, depositPending } = useWallet();
  const { toast } = useToast();

  const amount = parseInt(raw.replace(/\D/g, "")) || 0;

  const handleDeposit = async () => {
    if (amount < 100) {
      toast({ title: "Minimum ₦100", description: "Please enter at least ₦100 to continue.", variant: "destructive" });
      return;
    }
    setStep("redirecting");
    try {
      const result = await initializeDeposit(amount);
      if (result?.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error: any) {
      toast({
        title: "Could not start payment",
        description: error?.message || "Unable to connect to Paystack. Please try again.",
        variant: "destructive",
      });
      setStep("amount");
    }
  };

  const handleClose = () => {
    if (step === "redirecting") return;
    onClose();
    setTimeout(() => {
      setStep("amount");
      setRaw("");
    }, 300);
  };

  const formatted = amount > 0 ? amount.toLocaleString() : "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-md rounded-2xl border-0 shadow-2xl">
        <AnimatePresence mode="wait">

          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #0C6B38 0%, #0a5a2f 100%)" }}>
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Fund Wallet</p>
                    <h2 className="text-white text-lg font-bold leading-tight">Add Money</h2>
                  </div>
                </div>
                <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-white/70 text-sm">Current balance</span>
                  <span className="text-white font-bold text-base">₦{balance.toLocaleString()}</span>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5 bg-white">

                {/* Amount input */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Amount to deposit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₦</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={formatted}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setRaw(digits);
                      }}
                      className="w-full pl-10 pr-4 h-16 text-3xl font-bold text-gray-900 border-2 rounded-xl outline-none transition-colors placeholder:text-gray-200"
                      style={{ borderColor: amount > 0 ? "#0C6B38" : "#E5E7EB" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Minimum deposit: ₦100</p>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setRaw(p.toString())}
                      className="py-2 rounded-lg text-xs font-semibold border transition-all"
                      style={
                        amount === p
                          ? { background: "#0C6B38", borderColor: "#0C6B38", color: "white" }
                          : { background: "#F8FAF8", borderColor: "#E5E7EB", color: "#374151" }
                      }
                    >
                      ₦{p >= 1000 ? `${p / 1000}k` : p}
                    </button>
                  ))}
                </div>

                {/* Payment methods */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Pay via</p>
                  <div className="flex gap-2">
                    {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border bg-gray-50"
                        style={{ borderColor: "#E5E7EB" }}
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <AnimatePresence>
                  {amount >= 100 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: "#BBF7D0", background: "#F0FDF4" }}>
                        <div>
                          <p className="text-xs text-gray-500">You'll add</p>
                          <p className="text-2xl font-bold" style={{ color: "#0C6B38" }}>₦{amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">New balance</p>
                          <p className="text-sm font-semibold text-gray-700">₦{(balance + amount).toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Paystack trust badge */}
                <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-gray-50 border" style={{ borderColor: "#E5E7EB" }}>
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#0C6B38" }} />
                  <p className="text-xs text-gray-500">
                    Secured by <span className="font-semibold text-gray-700">Paystack</span> — Nigeria's trusted payment processor
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1 h-12 rounded-xl font-semibold">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={amount < 100 || depositPending}
                  className="flex-1 h-12 rounded-xl font-bold text-white"
                  style={{ background: amount >= 100 ? "#0C6B38" : undefined }}
                >
                  {depositPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting…</>
                  ) : (
                    <>Pay with Paystack <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "redirecting" && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-20 px-8 bg-white"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(12,107,56,0.15)" }} />
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                  <Loader2 className="w-9 h-9 animate-spin" style={{ color: "#0C6B38" }} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Redirecting to Paystack</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                You're being taken to Paystack's secure checkout to complete your payment of{" "}
                <span className="font-semibold text-gray-700">₦{amount.toLocaleString()}</span>.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
