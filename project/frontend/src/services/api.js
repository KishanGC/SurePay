const BASE_URL = import.meta.env.VITE_API_URL;

export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

export async function fetchTransactionHistory(userId = "user_001") {
  try {
    const res = await fetch(`${BASE_URL}/users/${userId}/history`);
    if (!res.ok) throw new Error("Failed to fetch history");
    const data = await res.json();
    return data.transactions || [];
  } catch (err) {
    console.warn("Backend unreachable for history, using local fallback:", err);
    return mockTransactions;
  }
}

export async function analyzePayment(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "user_001",
        recipient_name: payload.recipientName,
        upi_id: payload.upiId,
        amount: Number(payload.amount),
        purpose: payload.purpose || "Payment",
      }),
    });
    if (!res.ok) throw new Error("Analysis failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable, using client-side multi-agent simulation:", err);
    return getMockAnalysis(payload);
  }
}

export async function submitPayment(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "user_001",
        recipient_name: payload.recipientName,
        upi_id: payload.upiId,
        amount: Number(payload.amount),
        purpose: payload.purpose || "Payment",
        override_reason: payload.overrideReason || null,
      }),
    });
    if (!res.ok) throw new Error("Payment submission failed");
    return await res.json();
  } catch (err) {
    return getMockPaymentResult(payload);
  }
}

function getMockAnalysis({ recipientName, upiId, amount }) {
  const isFamiliar = ["rahul", "priya", "amit", "sneha", "rohit"].some((k) =>
    (recipientName || "").toLowerCase().includes(k) || (upiId || "").toLowerCase().includes(k)
  );
  const numAmount = Number(amount) || 0;
  const isHighAmount = numAmount > 3000;

  let decision = "PASS";
  let overallRisk = "LOW";
  let requiresVerification = false;
  let explanation = "Familiar recipient and normal amount. Safe to proceed without interruption.";

  if (!isFamiliar && isHighAmount) {
    decision = "STRONG_VERIFY";
    overallRisk = "HIGH";
    requiresVerification = true;
    explanation = `You have never paid ${recipientName || upiId} before, and ₹${numAmount.toLocaleString("en-IN")} is significantly higher than your usual transaction amount (₹250–₹1,200). Please verify the recipient and amount before proceeding.`;
  } else if (!isFamiliar) {
    decision = "VERIFY";
    overallRisk = "MEDIUM";
    requiresVerification = true;
    explanation = `You have not paid ${recipientName || upiId} before. Please confirm the UPI ID is correct.`;
  } else if (isHighAmount) {
    decision = "VERIFY";
    overallRisk = "MEDIUM";
    requiresVerification = true;
    explanation = `Amount ₹${numAmount.toLocaleString("en-IN")} is higher than your usual payments to this recipient.`;
  }

  return {
    transaction_id: "TXN" + Date.now().toString().slice(-8),
    decision: decision,
    overall_risk: overallRisk,
    confidence: isFamiliar && !isHighAmount ? 0.98 : 0.93,
    requires_verification: requiresVerification,
    can_proceed: true,
    explanation: explanation,
    recommendation: decision === "PASS" ? "PROCEED" : "VERIFY",
    agents: [
      {
        agent_name: "Payee Intelligence Agent",
        role: "Recipient Familiarity Specialist",
        risk_level: isFamiliar ? "LOW" : "HIGH",
        explanation: isFamiliar
          ? `Familiar recipient (${recipientName}). Previous payments recorded.`
          : `New recipient. You have never sent money to ${recipientName || upiId} before.`,
        flags: isFamiliar ? [] : ["UNFAMILIAR_PAYEE", "NEW_RECIPIENT"],
      },
      {
        agent_name: "Amount Intelligence Agent",
        role: "Personalized Amount Specialist",
        risk_level: isHighAmount ? (numAmount > 10000 ? "HIGH" : "MEDIUM") : "LOW",
        explanation: isHighAmount
          ? `₹${numAmount.toLocaleString("en-IN")} is significantly higher than your typical payment of ₹250–₹1,200.`
          : `₹${numAmount.toLocaleString("en-IN")} is within your typical transaction range.`,
        flags: isHighAmount ? ["SIGNIFICANTLY_HIGH_AMOUNT"] : [],
      },
      {
        agent_name: "Context Analysis Agent",
        role: "Transaction Pattern Specialist",
        risk_level: "LOW",
        explanation: "Standard UPI channel during your regular activity period.",
        flags: [],
      },
      {
        agent_name: "Decision & Explanation Agent",
        role: "Safety Decision & Communication Specialist",
        risk_level: overallRisk,
        explanation: explanation,
        flags: [decision],
      },
    ],
  };
}

function getMockPaymentResult({ recipientName, amount, upiId }) {
  const numAmount = Number(amount) || 0;
  return {
    status: "SUCCESS",
    transaction_id: "TXN" + Date.now().toString().slice(-8),
    amount: numAmount,
    recipient_name: recipientName,
    upi_id: upiId,
    message: `₹${numAmount.toLocaleString("en-IN")} sent to ${recipientName} successfully.`,
    timestamp: new Date().toISOString(),
  };
}

export const mockTransactions = [
  { id: "TXN101", recipient: "Rahul Sharma", upiId: "rahul@hdfc", amount: 500, date: "Today", status: "completed", purpose: "Dinner split" },
  { id: "TXN102", recipient: "Priya Patel", upiId: "priya@okhdfc", amount: 1200, date: "Yesterday", status: "completed", purpose: "Book purchase" },
  { id: "TXN103", recipient: "Amit Verma", upiId: "amit@yesbank", amount: 250, date: "09 Sep", status: "completed", purpose: "Coffee" },
  { id: "TXN104", recipient: "Sneha Gupta", upiId: "sneha@icici", amount: 800, date: "07 Sep", status: "completed", purpose: "Groceries" },
  { id: "TXN105", recipient: "Rohit Singh", upiId: "rohit@axis", amount: 1500, date: "06 Sep", status: "completed", purpose: "Gift" },
];

export const mockContacts = [
  { name: "Rahul Sharma", upiId: "rahul@hdfc", avatar: "RS", isFamiliar: true },
  { name: "Priya Patel", upiId: "priya@okhdfc", avatar: "PP", isFamiliar: true },
  { name: "Amit Verma", upiId: "amit@yesbank", avatar: "AV", isFamiliar: true },
  { name: "Sneha Gupta", upiId: "sneha@icici", avatar: "SG", isFamiliar: true },
  { name: "Rohit Singh", upiId: "rohit@axis", avatar: "RS", isFamiliar: true },
];

export const demoScenarios = [
  {
    id: "scenario_1",
    title: "Scenario 1: Normal Payment",
    subtitle: "Familiar Payee + Typical Amount",
    recipientName: "Rahul Sharma",
    upiId: "rahul@hdfc",
    amount: 500,
    purpose: "Dinner split",
    expectedDecision: "PASS",
    badge: "PASS — Instant Payment",
    description: "System verifies contact is familiar & amount is within typical range. Completes instantly without interrupting user.",
  },
  {
    id: "scenario_2",
    title: "Scenario 2: Unusual Payment",
    subtitle: "New Recipient + 10x Higher Amount",
    recipientName: "Unknown Contact",
    upiId: "newperson@upi",
    amount: 15000,
    purpose: "Urgent transfer",
    expectedDecision: "STRONG_VERIFY",
    badge: "STRONG_VERIFY — Warning",
    description: "Detects recipient has never been paid and ₹15,000 is 10x above normal. Shows personalized smart verification warning.",
  },
  {
    id: "scenario_3",
    title: "Scenario 3: User Override",
    subtitle: "Safety Warning with User Control",
    recipientName: "Vendor Store",
    upiId: "vendor_unknown@paytm",
    amount: 12000,
    purpose: "Equipment purchase",
    expectedDecision: "STRONG_VERIFY",
    badge: "User in Control",
    description: "User receives the personalized warning but intentionally chooses 'Proceed Anyway' to complete their legitimate transfer.",
  },
];
