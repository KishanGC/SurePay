import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../context/PaymentContext";

export default function PaymentSuccessScreen() {
  const navigate = useNavigate();
  const { paymentResult, paymentData, setPaymentData, setAnalysisResult, setPaymentResult } = usePayment();

  useEffect(() => {
    if (!paymentResult && !paymentData.amount) {
      navigate("/");
    }
  }, [paymentResult, paymentData, navigate]);

  const handleReset = () => {
    setPaymentData({ recipientName: "", upiId: "", amount: "", purpose: "" });
    setAnalysisResult(null);
    setPaymentResult(null);
    navigate("/");
  };

  const handleNewPayment = () => {
    setPaymentData({ recipientName: "", upiId: "", amount: "", purpose: "" });
    setAnalysisResult(null);
    setPaymentResult(null);
    navigate("/send-money");
  };

  const amount = paymentResult?.amount || paymentData?.amount || 0;
  const recipient = paymentResult?.recipient_name || paymentData?.recipientName || "Recipient";
  const upiId = paymentResult?.upi_id || paymentData?.upiId || "upi@paytm";
  const txnId = paymentResult?.transaction_id || "TXN" + Date.now().toString().slice(-8);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              ₹
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-blue-700">PAYTM SUREPAY</p>
              <p className="text-xs text-slate-500">Transaction Completed</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-lg px-5 py-12">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 mb-2">
            Payment Successful
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">
            ₹{Number(amount).toLocaleString("en-IN")}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sent successfully to <strong>{recipient}</strong>
          </p>

          <div className="my-6 rounded-2xl bg-slate-50 p-5 text-left text-sm space-y-2.5 ring-1 ring-slate-200/70">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono text-slate-800 font-medium">{txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">UPI Address</span>
              <span className="text-slate-800">{upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Safety Check</span>
              <span className="font-semibold text-emerald-700">✓ SurePay Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time</span>
              <span className="text-slate-800">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleNewPayment}
              className="flex-1 rounded-2xl bg-blue-700 py-3.5 text-sm font-bold text-white hover:bg-blue-800 transition shadow-lg shadow-blue-700/20"
            >
              Send More Money
            </button>
            <button
              onClick={handleReset}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
