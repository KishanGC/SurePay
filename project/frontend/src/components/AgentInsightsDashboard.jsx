import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePayment } from "../context/PaymentContext";
import { demoScenarios } from "../services/api";

export default function AgentInsightsDashboard() {
  const navigate = useNavigate();
  const { analysisResult, setPaymentData } = usePayment();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(1); // Default to Scenario 2

  const activeScenario = demoScenarios[selectedScenarioIndex];

  const handleTestScenario = (sc, index) => {
    setSelectedScenarioIndex(index);
    setPaymentData({
      recipientName: sc.recipientName,
      upiId: sc.upiId,
      amount: sc.amount,
      purpose: sc.purpose,
    });
    navigate("/analyzing");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold">
              ₹
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-blue-700">PAYTM SUREPAY</p>
              <p className="text-xs text-slate-500">Multi-Agent Architecture & Decision Inspector</p>
            </div>
          </div>
          <Link
            to="/"
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8 space-y-8">
        <div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
            Payment Protection Insights
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Specialist Agent Architecture</h1>
          <p className="text-sm text-slate-600 mt-1">
            SurePay uses a targeted 4-agent committee. Each agent has an isolated identity, dedicated role, and
            transparent reasoning.
          </p>
        </div>

        {/* 4 Agent Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Agent 1 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                Agent 1 • Identity Specialist
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Payee Intelligence</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Payee Intelligence Agent</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Analyzes historical recipient relationship, frequency of transfers, last known contact, and verified merchant identity.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 font-mono">
              Output: {`{ payee_status: "NEW", previous_txns: 0, risk: "HIGH" }`}
            </div>
          </div>

          {/* Agent 2 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Agent 2 • Amount Specialist
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Personalized Ranges</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Amount Intelligence Agent</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Calculates user typical range (e.g. ₹50–₹2,000) rather than a rigid static rule, detecting statistical deviations and magnitude leaps.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 font-mono">
              Output: {`{ typical_max: 2000, current: 15000, ratio: "10x", risk: "HIGH" }`}
            </div>
          </div>

          {/* Agent 3 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                Agent 3 • Pattern Specialist
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Context Analysis</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Context Analysis Agent</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Validates time of day in Indian Standard Time (IST), recurring utility bills, and payment channel to suppress false alerts.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 font-mono">
              Output: {`{ channel: "UPI", recurring: false, time_normal: true, risk: "LOW" }`}
            </div>
          </div>

          {/* Agent 4 */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Agent 4 • Decision Specialist
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">Decision & Explanation</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Decision & Explanation Agent</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Synthesizes specialist votes into PASS, VERIFY, or STRONG_VERIFY and generates human-centric explanations without blocking.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 font-mono">
              Output: {`{ decision: "STRONG_VERIFY", user_can_override: true }`}
            </div>
          </div>
        </div>

        {/* Interactive protection scenarios */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Explore protection scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {demoScenarios.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => handleTestScenario(sc, idx)}
                className="text-left rounded-2xl border-2 border-slate-200 hover:border-blue-600 p-4 transition hover:bg-blue-50/30"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-blue-700">{sc.title}</span>
                  <span className="text-xs font-extrabold text-slate-900">₹{sc.amount}</span>
                </div>
                <p className="text-xs text-slate-500">{sc.subtitle}</p>
                <div className="mt-3 text-xs font-bold text-blue-700">Launch Test →</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
