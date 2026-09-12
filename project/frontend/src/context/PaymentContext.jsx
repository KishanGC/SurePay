import React, { createContext, useContext, useState } from "react";

const PaymentContext = createContext(null);

export function PaymentProvider({ children }) {
  const [paymentData, setPaymentData] = useState({
    recipientName: "",
    upiId: "",
    amount: "",
    purpose: "",
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PaymentContext.Provider
      value={{
        paymentData,
        setPaymentData,
        analysisResult,
        setAnalysisResult,
        paymentResult,
        setPaymentResult,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayment must be used within PaymentProvider");
  return ctx;
}
