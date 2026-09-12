import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../context/PaymentContext";
import { submitPayment } from "../services/api";

export default function VerificationScreen() {
  const navigate = useNavigate();
  const { paymentData, analysisResult, setPaymentResult, setIsLoading } = usePayment();
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  const [overrideReason, setOverrideReason] = useState("");

  if (!paymentData.recipientName) {
    navigate("/send-money");
    return null;
  }

  const handleProceed = async () => {
    setIsLoading(true);
    const result = await submitPayment({
      ...paymentData,
      overrideReason: overrideReason || "User proceeded after reviewing warning",
    });
    setPaymentResult(result);
    setIsLoading(false);
    navigate("/success");
  };

  const handleCancel = () => {
    navigate("/");
  };

  const isStrongVerify = analysisResult?.decision === "STRONG_VERIFY";
  const explanation =
    analysisResult?.explanation ||
    `You have never paid this recipient before, and ₹${Number(paymentData.amount).toLocaleString("en-IN")} is significantly higher than your usual transaction amount. Please verify the recipient and amount.`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              ₹
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-blue-700">PAYTM SUREPAY</p>
              <p className="text-xs text-slate-500">Payment Safety Warning</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel & Exit
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-xl px-5 py-8">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-slate-200">
          {/* Warning Banner */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
              {isStrongVerify ? "Strong Verification Required" : "Please Verify Payment"}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">Please Verify This Payment</h1>
            <p className="mt-1 text-xs text-slate-500">
              SurePay detected unusual transaction parameters before sending your money.
            </p>
          </div>

          {/* Personalized Warning Card */}
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">Safety Rationale</p>
            <p className="text-sm font-medium leading-relaxed text-amber-950">{explanation}</p>

            <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">⚠️</span>
                <span><strong>Payee Check:</strong> New recipient — no previous payments recorded.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600 font-bold">⚠️</span>
                <span><strong>Amount Check:</strong> Amount is significantly higher than your typical range (₹50–₹2,000).</span>
              </div>
            </div>
          </div>

          {/* Transaction Summary Card */}
          <div className="mb-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/80">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Payment Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Recipient Name</span>
                <span className="font-semibold text-slate-900">{paymentData.recipientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">UPI Address</span>
                <span className="font-mono text-slate-700">{paymentData.upiId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Amount</span>
                <span className="text-lg font-extrabold text-slate-900">
                  ₹{Number(paymentData.amount).toLocaleString("en-IN")}
                </span>
              </div>
              {paymentData.purpose && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Note / Purpose</span>
                  <span className="text-slate-700">{paymentData.purpose}</span>
                </div>
              )}
            </div>
          </div>

          {/* User in Control Guarantee */}
          <div className="mb-6 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2">
            <span className="text-blue-600 font-bold text-sm">ℹ️</span>
            <span>
              <strong>You are always in control.</strong> SurePay never locks your money automatically.
              You can cancel if you made an error, or proceed if this payment is intended.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-2xl border-2 border-slate-300 bg-white py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              Cancel Payment
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 rounded-2xl bg-amber-600 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition shadow-lg shadow-amber-600/20"
            >
              Proceed Anyway →
            </button>
          </div>

          {/* Feedback Loop for Hackathon Spec */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2">Was this safety alert helpful?</p>
            {feedbackGiven ? (
              <span className="text-xs font-semibold text-emerald-600">✓ Thank you for your feedback!</span>
            ) : (
              <div className="inline-flex gap-2">
                <button
                  onClick={() => setFeedbackGiven("yes")}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  👍 Yes, helpful
                </button>
                <button
                  onClick={() => setFeedbackGiven("no")}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  👎 Not helpful
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
