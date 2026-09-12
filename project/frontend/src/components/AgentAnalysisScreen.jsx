import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePayment } from "../context/PaymentContext";
import { analyzePayment, submitPayment } from "../services/api";

const AGENTS = [
  {
    key: "payee",
    name: "Payee Intelligence Agent",
    role: "Recipient Familiarity Specialist",
    description: "Verifying recipient history, frequency & known merchant status",
  },
  {
    key: "amount",
    name: "Amount Intelligence Agent",
    role: "Personalized Amount Specialist",
    description: "Comparing amount against your personalized historical ranges",
  },
  {
    key: "context",
    name: "Context Analysis Agent",
    role: "Transaction Pattern Specialist",
    description: "Checking channel legitimacy and time-of-day behavioral context",
  },
  {
    key: "decision",
    name: "Decision & Explanation Agent",
    role: "Safety Decision & Communication Specialist",
    description: "Synthesizing agent signals into an explainable safety recommendation",
  },
];

export default function AgentAnalysisScreen() {
  const navigate = useNavigate();
  const { paymentData, setAnalysisResult, setPaymentResult, setIsLoading } = usePayment();
  const [completedAgents, setCompletedAgents] = useState([]);
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);

  useEffect(() => {
    if (!paymentData.recipientName) {
      navigate("/send-money");
      return;
    }

    let isMounted = true;

    async function runPipeline() {
      setIsLoading(true);

      // Start backend multi-agent analysis in parallel with UI progression
      const analysisPromise = analyzePayment(paymentData);

      // Sequential visual progression for each specialist agent
      for (let i = 0; i < AGENTS.length; i++) {
        if (!isMounted) return;
        setActiveAgentIndex(i);
        await new Promise((r) => setTimeout(r, 450));
        if (!isMounted) return;
        setCompletedAgents((prev) => [...prev, AGENTS[i].key]);
      }

      const result = await analysisPromise;
      if (!isMounted) return;

      setAnalysisResult(result);
      setIsLoading(false);

      await new Promise((r) => setTimeout(r, 400));
      if (!isMounted) return;

      // Hackathon requirement:
      // Normal payment (PASS) -> Continue without interruption!
      // Unusual payment (VERIFY / STRONG_VERIFY) -> Personalized verification warning!
      if (result.decision === "PASS" || result.requires_verification === false) {
        const payRes = await submitPayment(paymentData);
        setPaymentResult(payRes);
        navigate("/success");
      } else {
        navigate("/verification");
      }
    }

    runPipeline();

    return () => {
      isMounted = false;
    };
  }, []);

  const isDone = (key) => completedAgents.includes(key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 mb-3">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            SurePay Safety Layer Active
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Analyzing Payment Safety</h2>
          <p className="mt-1 text-sm text-slate-500">
            Evaluating ₹{Number(paymentData.amount || 0).toLocaleString("en-IN")} to {paymentData.recipientName}
          </p>
        </div>

        {/* Multi-Agent Progress List */}
        <div className="space-y-3">
          {AGENTS.map((agent, index) => {
            const done = isDone(agent.key);
            const isCurrent = activeAgentIndex === index && !done;

            return (
              <div
                key={agent.key}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 ${
                  done
                    ? "border-emerald-200 bg-emerald-50/50 text-slate-900"
                    : isCurrent
                    ? "border-blue-400 bg-blue-50/70 shadow-sm"
                    : "border-slate-100 bg-slate-50/50 opacity-60 text-slate-500"
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    done
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isCurrent ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold truncate ${done ? "text-emerald-900" : isCurrent ? "text-blue-900" : "text-slate-700"}`}>
                      {agent.name}
                    </p>
                    {done && <span className="text-xs font-semibold text-emerald-600 ml-2">Verified</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{agent.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Progress: {completedAgents.length} of {AGENTS.length} agents evaluated</span>
            <span>{Math.round((completedAgents.length / AGENTS.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${(completedAgents.length / AGENTS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
