import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet, type Transaction } from "@/hooks/use-wallet";
import { useLocalizationStore } from "@/stores/localization-store";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle,
  Shield, CircleDollarSign, Eye, EyeOff, Download, Upload, Loader2,
  CreditCard, Building, RefreshCw, ChevronRight, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const GREEN = "#0C6B38";
const WALLET_API = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-api`;

function TxIcon({ type }: { type: string }) {
  switch (type) {
    case "deposit":        return <ArrowDownLeft className="w-4 h-4" style={{ color: "#16A34A" }} />;
    case "withdrawal":     return <ArrowUpRight  className="w-4 h-4" style={{ color: "#DC2626" }} />;
    case "escrow_lock":    return <Shield        className="w-4 h-4" style={{ color: "#D97706" }} />;
    case "escrow_release": return <ArrowUpRight  className="w-4 h-4" style={{ color: "#16A34A" }} />;
    case "escrow_refund":  return <ArrowDownLeft className="w-4 h-4" style={{ color: "#3B82F6" }} />;
    case "earning":        return <ArrowDownLeft className="w-4 h-4" style={{ color: "#16A34A" }} />;
    default:               return <CircleDollarSign className="w-4 h-4" style={{ color: "#6B7280" }} />;
  }
}

function TxBg(type: string): { bg: string; border: string } {
  switch (type) {
    case "deposit": case "escrow_release": case "escrow_refund": case "earning":
      return { bg: "#F0FDF4", border: "rgba(34,197,94,0.15)" };
    case "withdrawal":
      return { bg: "#FEF2F2", border: "rgba(239,68,68,0.15)" };
    case "escrow_lock":
      return { bg: "#FFFBEB", border: "rgba(245,158,11,0.15)" };
    default:
      return { bg: "#F9FAFB", border: "rgba(0,0,0,0.06)" };
  }
}

function WalletContent() {
  const {
    availableBalance, escrowBalance, transactions, isLoading, transactionsLoading,
    initializeDeposit, verifyDeposit, withdraw, refetchWallet,
    depositPending, withdrawPending,
  } = useWallet();
  const { user, getIdToken } = useFirebaseAuth();
  const { formatLocal, currency } = useLocalizationStore();
  const { toast } = useToast();

  const [paystackReady, setPaystackReady] = useState(() => !!(window as any).PaystackPop);
  const [hideBalance, setHideBalance] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState<"card" | "bank">("card");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [filter, setFilter] = useState("all");

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);

  const totalBalance = availableBalance + escrowBalance;
  const masked = "••••••";

  const filteredTx = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  useEffect(() => {
    const pop = (window as any).PaystackPop;
    if (pop && typeof pop.setup === "function") { setPaystackReady(true); return; }
    document.querySelectorAll('script[src*="paystack"]').forEach(s => s.remove());
    delete (window as any).PaystackPop;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => setPaystackReady(true);
    script.onerror = () => console.error("[Paystack] Failed to load inline script");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (withdrawOpen && banks.length === 0) loadBanks();
  }, [withdrawOpen]);

  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) verifyBankAccount();
    else if (accountNumber.length < 10) setAccountName("");
  }, [selectedBank, accountNumber]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("reference") || params.get("trxref");
    if (ref && user) {
      window.history.replaceState({}, "", "/wallet");
      setVerifyingPayment(true);
      verifyDeposit(ref)
        .then((result) => {
          toast({ title: "Deposit Successful!", description: `₦${result.amount?.toLocaleString() || ""} added to wallet.` });
          refetchWallet();
        })
        .catch((err) => toast({ title: "Verification issue", description: err.message, variant: "destructive" }))
        .finally(() => setVerifyingPayment(false));
    }
  }, [user]);

  const loadBanks = async () => {
    setBanksLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`${WALLET_API}/banks`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) { const data = await res.json(); setBanks(data.banks || []); }
    } catch {}
    finally { setBanksLoading(false); }
  };

  const verifyBankAccount = async () => {
    setVerifyingAccount(true);
    setAccountName("");
    try {
      const token = await getIdToken();
      const res = await fetch(`${WALLET_API}/verify-account`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber, bankCode: selectedBank }),
      });
      if (res.ok) { const data = await res.json(); setAccountName(data.accountName || ""); }
      else { const data = await res.json(); toast({ title: "Verification failed", description: data.message, variant: "destructive" }); }
    } catch {}
    finally { setVerifyingAccount(false); }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 100) { toast({ title: "Minimum deposit is ₦100", variant: "destructive" }); return; }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop || !paystackReady) {
      toast({ title: "Payment still loading", description: "Give it a second then try again." });
      return;
    }

    const email = user?.email || `${(user?.uid || "user").slice(0, 8)}@helpchain.app`;
    const reference = `hc_${Date.now()}_${(user?.uid || "x").slice(0, 6)}`;

    setDepositOpen(false);
    setDepositAmount("");

    const handler = PaystackPop.setup({
      key: "pk_live_17a0eb470f2f5942f1c358591b5082c757611228",
      email,
      amount: Math.round(amount * 100),
      currency: "NGN",
      ref: reference,
      label: "HelpChain Wallet Top-up",
      callback: async (response: { reference: string; status: string }) => {
        if (response.status !== "success" && response.status !== "completed") return;
        setVerifyingPayment(true);
        try {
          const verified = await verifyDeposit(response.reference || reference);
          toast({
            title: "Deposit Successful!",
            description: `₦${(verified.amount || amount).toLocaleString()} added to your wallet.`,
          });
          refetchWallet();
        } catch (err: any) {
          toast({ title: "Verification issue", description: err.message || "Payment received — contact support if balance not updated.", variant: "destructive" });
        } finally {
          setVerifyingPayment(false);
        }
      },
      onClose: () => {
        toast({ title: "Payment window closed", description: "No money was charged." });
      },
    });
    handler.openIframe();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }
    if (amount > availableBalance) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
    if (!selectedBank || accountNumber.length !== 10 || !accountName) {
      toast({ title: "Bank details required", description: "Please complete all bank details.", variant: "destructive" });
      return;
    }
    try {
      const result = await withdraw(amount, selectedBank, accountNumber, accountName);
      toast({ title: "Withdrawal initiated", description: result.message || `₦${amount.toLocaleString()} is being processed.` });
      setWithdrawOpen(false);
      setWithdrawAmount(""); setAccountNumber(""); setAccountName(""); setSelectedBank("");
      refetchWallet();
    } catch (err: any) {
      toast({ title: "Withdrawal failed", description: err.message, variant: "destructive" });
    }
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F7F5" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-[22px] mx-auto mb-4 flex items-center justify-center" style={{ background: "#F0FDF4" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
          </div>
          <h2 className="text-lg font-bold text-[#0D0D0D]">Verifying payment...</h2>
          <p className="text-sm text-gray-400 mt-1">This only takes a moment.</p>
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "deposit", label: "Deposits" },
    { value: "withdrawal", label: "Withdrawals" },
    { value: "escrow_lock", label: "Escrow" },
    { value: "earning", label: "Earnings" },
  ];

  return (
    <MobileLayout>
      <div style={{ background: "#F5F7F5" }}>
        <MobileHeader
          title="Wallet"
          right={
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => refetchWallet()}
              className="w-9 h-9 rounded-[12px] flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.04)" }}
            >
              <RefreshCw className="w-4 h-4 text-gray-500" strokeWidth={2} />
            </motion.button>
          }
        />

        <div className="px-4 pt-4 space-y-4">

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] p-6 relative overflow-hidden text-white"
            style={{ background: `linear-gradient(150deg, #0C6B38 0%, #085c30 55%, #063f22 100%)` }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-0 right-0 rounded-full opacity-10"
                style={{ width: 240, height: 240, background: "white", transform: "translate(40%, -40%)" }}
              />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Balance</p>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setHideBalance(!hideBalance)}
                      className="text-white/40 hover:text-white/70"
                    >
                      {hideBalance ? <EyeOff size={12} /> : <Eye size={12} />}
                    </motion.button>
                  </div>
                  {isLoading ? (
                    <div className="h-10 flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white/50" />
                    </div>
                  ) : (
                    <motion.p
                      key={hideBalance ? "h" : "s"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[2rem] font-bold tracking-tight leading-none"
                    >
                      {hideBalance ? `₦ ${masked}` : formatLocal(totalBalance)}
                    </motion.p>
                  )}
                </div>
                <div
                  className="w-12 h-12 rounded-[16px] flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <Wallet className="w-6 h-6 text-white" strokeWidth={1.8} />
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">Available</p>
                  <p className="text-white font-bold text-sm">{hideBalance ? masked : formatLocal(availableBalance)}</p>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">In Escrow</p>
                  <p className="text-white font-bold text-sm">{hideBalance ? masked : formatLocal(escrowBalance)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setDepositOpen(true)}
              className="flex items-center justify-center gap-2.5 h-[52px] rounded-[18px] text-white text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`,
                boxShadow: `0 6px 20px rgba(12,107,56,0.35)`,
              }}
            >
              <Download className="w-4.5 h-4.5" strokeWidth={2} style={{ width: 18, height: 18 }} />
              Add Money
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center justify-center gap-2.5 h-[52px] rounded-[18px] text-sm font-bold"
              style={{
                background: "white",
                border: "1.5px solid rgba(0,0,0,0.08)",
                color: "#374151",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Upload className="w-4.5 h-4.5" strokeWidth={2} style={{ width: 18, height: 18 }} />
              Withdraw
            </motion.button>
          </div>

          {/* Security notice */}
          <div
            className="rounded-[18px] p-4 flex items-center gap-3.5"
            style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
          >
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: "rgba(12,107,56,0.1)" }}
            >
              <Shield className="w-5 h-5" style={{ color: GREEN }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: GREEN }}>Escrow Protected</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Payments are held securely until you approve. Powered by Paystack.</p>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Transactions</h2>
              <div className="flex gap-1.5">
                {filterOptions.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setFilter(opt.value)}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
                    style={{
                      background: filter === opt.value ? GREEN : "white",
                      color: filter === opt.value ? "white" : "#6B7280",
                      border: `1px solid ${filter === opt.value ? GREEN : "rgba(0,0,0,0.07)"}`,
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {transactionsLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-[20px] p-4 bg-white flex items-center gap-3" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="w-10 h-10 rounded-[13px] shimmer shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 rounded-full shimmer w-2/3" />
                      <div className="h-3 rounded-full shimmer w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTx.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-14 h-14 rounded-[18px] mx-auto mb-3 flex items-center justify-center" style={{ background: "#F5F7F5" }}>
                  <CircleDollarSign className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">No transactions yet</p>
                <p className="text-xs text-gray-400 mt-1">Add money to get started</p>
              </motion.div>
            ) : (
              <div className="space-y-2.5 pb-4">
                {filteredTx.map((tx, i) => {
                  const isPositive = ["deposit", "escrow_refund", "earning", "escrow_release"].includes(tx.type);
                  const txStyle = TxBg(tx.type);
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-[20px] p-4 flex items-center gap-3.5"
                      style={{
                        background: "white",
                        border: "1px solid rgba(0,0,0,0.05)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                        style={{ background: txStyle.bg, border: `1px solid ${txStyle.border}` }}
                      >
                        <TxIcon type={tx.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0D0D0D] truncate">{tx.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-[#0D0D0D]"}`}>
                          {isPositive ? "+" : "-"}{hideBalance ? masked : formatLocal(tx.amount)}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === "completed" ? "bg-green-50 text-green-700" :
                          tx.status === "pending" || tx.status === "processing" ? "bg-amber-50 text-amber-700" :
                          "bg-red-50 text-red-700"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="rounded-[28px] mx-4 max-w-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Download className="w-5 h-5" style={{ color: GREEN }} /> Add Money
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { value: "card" as const, label: "Card", icon: CreditCard },
                { value: "bank" as const, label: "Bank Transfer", icon: Building },
              ]).map((m) => (
                <motion.button
                  key={m.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDepositMethod(m.value)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-[18px] border-2 transition-all"
                  style={{
                    borderColor: depositMethod === m.value ? GREEN : "rgba(0,0,0,0.08)",
                    background: depositMethod === m.value ? "#F0FDF4" : "white",
                  }}
                >
                  <m.icon className="w-5 h-5" style={{ color: depositMethod === m.value ? GREEN : "#9CA3AF" }} strokeWidth={1.8} />
                  <span className="text-xs font-bold" style={{ color: depositMethod === m.value ? GREEN : "#6B7280" }}>{m.label}</span>
                </motion.button>
              ))}
            </div>

            <div>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount (₦)</Label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₦</span>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0"
                  className="h-[52px] text-lg font-bold pl-9 rounded-[14px] border-gray-200 bg-gray-50"
                  min="100"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Minimum ₦100</p>
            </div>

            <div className="flex gap-2">
              {[1000, 5000, 10000, 25000].map((q) => (
                <motion.button
                  key={q}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setDepositAmount(q.toString())}
                  className="flex-1 py-2.5 rounded-[12px] text-xs font-bold"
                  style={{
                    background: "#F5F7F5",
                    border: "1px solid rgba(0,0,0,0.07)",
                    color: "#374151",
                  }}
                >
                  ₦{(q / 1000).toFixed(0)}K
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDeposit}
              disabled={!depositAmount || !paystackReady}
              className="w-full h-[52px] rounded-[16px] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 6px 20px rgba(12,107,56,0.3)` }}
            >
              {!paystackReady
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading payment...</>
                : <><Download className="w-4 h-4" /> Continue to Payment</>}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="rounded-[28px] mx-4 max-w-sm max-h-[90vh] overflow-y-auto" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="w-5 h-5 text-gray-500" /> Withdraw Funds
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Amount (₦)</Label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₦</span>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="h-[52px] text-lg font-bold pl-9 rounded-[14px] border-gray-200 bg-gray-50"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Available: {formatLocal(availableBalance)}</p>
            </div>

            <div>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bank</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="mt-2 rounded-[14px] border-gray-200 h-[52px]">
                  <SelectValue placeholder={banksLoading ? "Loading banks..." : "Select bank"} />
                </SelectTrigger>
                <SelectContent className="rounded-[18px]">
                  {banks.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit account number"
                className="mt-2 h-[52px] rounded-[14px] border-gray-200 bg-gray-50 text-sm font-medium"
              />
              {verifyingAccount && (
                <div className="flex items-center gap-2 mt-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: GREEN }} />
                  <p className="text-xs text-gray-400">Verifying account...</p>
                </div>
              )}
              {accountName && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 px-3.5 py-2.5 rounded-[12px]"
                  style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
                >
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                  <p className="text-sm font-bold" style={{ color: GREEN }}>{accountName}</p>
                </motion.div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleWithdraw}
              disabled={withdrawPending || !accountName || !selectedBank}
              className="w-full h-[52px] rounded-[16px] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #16A34A 100%)`, boxShadow: `0 6px 20px rgba(12,107,56,0.3)` }}
            >
              {withdrawPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Withdraw Funds</>
              )}
            </motion.button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
