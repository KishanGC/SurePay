import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mockContacts } from "../services/api";
import { usePayment } from "../context/PaymentContext";

const MODE_COPY = {
  send: { title: "Send money", eyebrow: "UPI PAYMENT", description: "Enter a UPI ID to begin a protected payment." },
  scan: { title: "Scan QR", eyebrow: "QR PAYMENT", description: "Scan a payment QR code. This prototype uses a simulated scan." },
  bank: { title: "Bank transfer", eyebrow: "BANK PAYMENT", description: "Enter bank details for a prototype transfer." },
  contacts: { title: "Pay contacts", eyebrow: "YOUR CONTACTS", description: "Choose a familiar recipient to continue." },
};

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return <label className="flow-field">{label}<input name={name} value={value} onChange={onChange} placeholder={placeholder} type={type} /></label>;
}

export default function SendMoneyForm({ mode = "send" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setPaymentData } = usePayment();
  const [stage, setStage] = useState(location.state?.recipientName ? "confirm" : "entry");
  const [form, setForm] = useState({ recipientName: location.state?.recipientName || "", upiId: location.state?.upiId || "", amount: "", purpose: "", accountName: "", accountNumber: "", confirmAccount: "", ifsc: "" });
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const copy = MODE_COPY[mode];

  useEffect(() => {
    if (location.state?.recipientName) setForm((current) => ({ ...current, recipientName: location.state.recipientName, upiId: location.state.upiId || "" }));
  }, [location.state]);

  const update = (event) => { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setError(""); };
  const chooseContact = (contact) => { setForm((current) => ({ ...current, recipientName: contact.name, upiId: contact.upiId })); setStage("confirm"); };

  const continueFromEntry = () => {
    if (mode === "send" && !/^[\w.-]+@[\w.-]+$/.test(form.upiId.trim())) return setError("Enter a valid UPI ID, such as rahul@upi.");
    if (mode === "scan") return setError("Tap Simulate QR Scan to load a recipient.");
    if (mode === "bank") {
      if (!form.accountName.trim() || !/^\d{9,18}$/.test(form.accountNumber) || form.accountNumber !== form.confirmAccount || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc)) return setError("Enter a name, matching account numbers, and a valid IFSC code.");
      setForm((current) => ({ ...current, recipientName: current.accountName, upiId: `bank-${current.accountNumber}@surepay` }));
      return setStage("confirm");
    }
    setError("");
    if (mode === "contacts") return setError("Choose a contact to continue.");
    setForm((current) => ({ ...current, recipientName: current.recipientName || "Verified recipient" }));
    setStage("confirm");
  };

  const simulateScan = () => { setForm((current) => ({ ...current, recipientName: "Rahul Kumar", upiId: "rahul@upi" })); setError("QR details simulated for this prototype."); };
  const continueFromConfirm = () => { if (!form.recipientName || !form.upiId) return setError("Recipient details are required."); setError(""); setStage("amount"); };
  const submitAmount = (event) => { event.preventDefault(); if (!form.amount || Number(form.amount) <= 0) return setError("Enter an amount greater than zero."); setPaymentData({ recipientName: form.recipientName, upiId: form.upiId, amount: Number(form.amount), purpose: form.purpose }); navigate("/analyzing"); };

  return <section className="page-section payment-flow"><button className="back-link" onClick={() => navigate("/")}>← Dashboard</button><div className="flow-heading"><p className="eyebrow">{copy.eyebrow}</p><h1>{stage === "confirm" ? "Confirm recipient" : stage === "amount" ? `Paying ${form.recipientName}` : copy.title}</h1><p className="muted">{stage === "confirm" ? "Check these details before entering the amount." : stage === "amount" ? `${form.upiId} · Protected by SurePay analysis` : copy.description}</p></div>{stage === "entry" && <>{mode === "send" && <div className="flow-card"><Field label="Enter UPI ID" name="upiId" value={form.upiId} onChange={update} placeholder="example@upi" /><button className="primary-button" onClick={continueFromEntry}>Continue <span>→</span></button></div>}{mode === "scan" && <div className="flow-card"><div className="qr-scanner"><span className="scan-line" /><strong>QR SCANNER</strong><small>Point a QR code at this frame</small></div><button className="primary-button" onClick={simulateScan}>Simulate QR Scan <span>⌾</span></button>{form.upiId && <button className="secondary-button" onClick={() => setStage("confirm")}>Continue with {form.recipientName} →</button>}</div>}{mode === "bank" && <div className="flow-card"><Field label="Account holder name" name="accountName" value={form.accountName} onChange={update} placeholder="Rahul Kumar" /><Field label="Account number" name="accountNumber" value={form.accountNumber} onChange={update} placeholder="9–18 digits" inputMode="numeric" /><Field label="Confirm account number" name="confirmAccount" value={form.confirmAccount} onChange={update} placeholder="Re-enter account number" inputMode="numeric" /><Field label="IFSC code" name="ifsc" value={form.ifsc} onChange={update} placeholder="HDFC0001234" /><button className="primary-button" onClick={continueFromEntry}>Review recipient <span>→</span></button><small className="prototype-note">Prototype transfer: no external bank rails are connected.</small></div>}{mode === "contacts" && <div className="flow-card"><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contacts" /> <div className="contact-options">{mockContacts.filter((contact) => `${contact.name} ${contact.upiId}`.toLowerCase().includes(query.toLowerCase())).map((contact) => <button key={contact.upiId} onClick={() => chooseContact(contact)}><span className="avatar">{contact.avatar}</span><span><strong>{contact.name}</strong><small>{contact.upiId}</small></span><b>›</b></button>)}</div></div>}</>}{stage === "confirm" && <div className="flow-card recipient-card"><div className="avatar large">{form.recipientName[0]}</div><p className="eyebrow">RECIPIENT</p><h2>{form.recipientName}</h2><p className="upi-value">{form.upiId}</p><span className="verified">✓ Details ready for review</span><button className="primary-button" onClick={continueFromConfirm}>Continue to amount <span>→</span></button></div>}{stage === "amount" && <form className="flow-card amount-card" onSubmit={submitAmount}><div className="amount-recipient"><div className="avatar">{form.recipientName[0]}</div><div><strong>{form.recipientName}</strong><small>{form.upiId}</small></div></div><label className="amount-label">₹<input autoFocus name="amount" value={form.amount} onChange={update} type="number" min="1" placeholder="0" /></label><Field label="Purpose (optional)" name="purpose" value={form.purpose} onChange={update} placeholder="Dinner, rent, invoice" /><button className="primary-button" type="submit">Pay ₹{Number(form.amount || 0).toLocaleString("en-IN")} securely <span>→</span></button></form>}{error && <p className="flow-error">{error}</p>}</section>;
}
