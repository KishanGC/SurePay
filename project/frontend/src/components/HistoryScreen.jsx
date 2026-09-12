import { useEffect, useState } from "react";
import { fetchTransactionHistory } from "../services/api";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]); const [query, setQuery] = useState("");
  useEffect(() => { fetchTransactionHistory("user_001").then(setTransactions); }, []);
  const visible = transactions.filter(txn => `${txn.recipient_name || txn.recipient} ${txn.upi_id || txn.payee_id} ${txn.purpose || ""}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="page-section"><div className="page-heading"><div><p className="eyebrow">YOUR MONEY</p><h1>Transaction history</h1></div><span className="status-dot">● Live</span></div><input className="search-input" placeholder="Search transactions" value={query} onChange={e => setQuery(e.target.value)} /><div className="history-list">{visible.length ? visible.map(txn => { const name = txn.recipient_name || txn.recipient || "Recipient"; return <article className="transaction-row" key={txn.transaction_id || txn.id}><div className="avatar">{name[0]}</div><div className="transaction-copy"><strong>{name}</strong><span>{txn.purpose || "Payment"} · {new Date(txn.created_at || txn.timestamp || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div><div className="transaction-amount"><strong>₹{Number(txn.amount || 0).toLocaleString("en-IN")}</strong><span className="safe-tag">✓ {txn.status || "SUCCESS"}</span></div></article>; }) : <p className="empty-state">No transactions found.</p>}</div></section>;
}
