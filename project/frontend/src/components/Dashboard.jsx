import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTransactionHistory, healthCheck, mockContacts } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [online, setOnline] = useState(null);
  const profile = JSON.parse(localStorage.getItem("surepay_profile") || '{"name":"Vedamurthy"}');

  useEffect(() => {
    healthCheck().then(() => setOnline(true)).catch(() => setOnline(false));
    fetchTransactionHistory().then(setTransactions);
  }, []);

  return (
    <section className="page-section home-page">
      <header className="home-header">
        <div>
          <p className="eyebrow">SATURDAY, 12 SEPTEMBER</p>
          <h1>Welcome, {profile.name || "there"} <span>✦</span></h1>
        </div>
        <button className="icon-button" aria-label="Notifications" onClick={() => navigate("/more")}>♧</button>
      </header>

      <div className="protection-card">
        <div className="protection-orbit"><div className="shield">✓</div></div>
        <div>
          <p className="eyebrow light">SUREPAY PROTECTION</p>
          <h2>Your payments are protected</h2>
          <p>Every payment is quietly checked for unusual patterns before it leaves your account.</p>
        </div>
        <span className="protection-status">{online ? "● ACTIVE" : "○ OFFLINE"}</span>
      </div>

      <div className="section-heading"><h2>Pay anyone</h2><button className="link-button" onClick={() => navigate("/pay")}>View all</button></div>
      <div className="quick-actions">
        <button onClick={() => navigate("/pay/send")}><span className="action-icon blue">↗</span><strong>Send money</strong><small>To UPI ID</small></button>
        <button onClick={() => navigate("/pay/scan")}><span className="action-icon coral">⌾</span><strong>Scan QR</strong><small>Pay in seconds</small></button>
        <button onClick={() => navigate("/pay/bank")}><span className="action-icon mint">↔</span><strong>Bank transfer</strong><small>Move money</small></button>
        <button onClick={() => navigate("/pay/contacts")}><span className="action-icon gold">♧</span><strong>Pay contacts</strong><small>From your list</small></button>
      </div>

      <div className="section-heading"><h2>Recent contacts</h2><button className="link-button" onClick={() => navigate("/pay/contacts")}>See all</button></div>
      <div className="contact-strip">
        {mockContacts.slice(0, 5).map((contact) => (
          <button key={contact.upiId} onClick={() => navigate("/pay/contacts", { state: { recipientName: contact.name, upiId: contact.upiId } })}>
            <span className="avatar">{contact.avatar}</span><small>{contact.name.split(" ")[0]}</small>
          </button>
        ))}
      </div>

      <div className="section-heading"><h2>Recent transactions</h2><button className="link-button" onClick={() => navigate("/history")}>See all</button></div>
      <div className="transaction-list">
        {transactions.slice(0, 3).map((txn) => {
          const name = txn.recipient_name || txn.recipient || "Recipient";
          return <div className="transaction-row" key={txn.transaction_id || txn.id}><div className="avatar">{name[0]}</div><div className="transaction-copy"><strong>{name}</strong><span>{txn.purpose || "Payment"}</span></div><div className="transaction-amount"><strong>₹{Number(txn.amount || 0).toLocaleString("en-IN")}</strong><span className="safe-tag">✓ Completed</span></div></div>;
        })}
      </div>
    </section>
  );
}
