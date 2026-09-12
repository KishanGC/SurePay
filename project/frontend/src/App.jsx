import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PaymentProvider } from "./context/PaymentContext";
import Onboarding from "./components/Onboarding";
import AppLayout from "./components/AppLayout";
import Dashboard from "./components/Dashboard";
import SendMoneyForm from "./components/SendMoneyForm";
import HistoryScreen from "./components/HistoryScreen";
import MoreScreen from "./components/MoreScreen";
import AgentAnalysisScreen from "./components/AgentAnalysisScreen";
import VerificationScreen from "./components/VerificationScreen";
import PaymentSuccessScreen from "./components/PaymentSuccessScreen";
import AgentInsightsDashboard from "./components/AgentInsightsDashboard";

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("surepay_onboarded") === "true");

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  return (
    <PaymentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pay" element={<Navigate to="/pay/send" replace />} />
            <Route path="/pay/send" element={<SendMoneyForm mode="send" />} />
            <Route path="/pay/scan" element={<SendMoneyForm mode="scan" />} />
            <Route path="/pay/bank" element={<SendMoneyForm mode="bank" />} />
            <Route path="/pay/contacts" element={<SendMoneyForm mode="contacts" />} />
            <Route path="/send-money" element={<Navigate to="/pay/send" replace />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/more" element={<MoreScreen />} />
            <Route path="/insights" element={<AgentInsightsDashboard />} />
          </Route>
          <Route path="/analyzing" element={<AgentAnalysisScreen />} />
          <Route path="/verification" element={<VerificationScreen />} />
          <Route path="/success" element={<PaymentSuccessScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PaymentProvider>
  );
}
