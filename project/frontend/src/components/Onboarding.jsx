import { useEffect, useState } from "react";

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState("splash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [upi, setUpi] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== "otp" || seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [step, seconds]);

  const continuePhone = () => {
    if (name.trim().length < 2) return setError("Enter your name to personalize SurePay.");
    if (phone.replace(/\D/g, "").length !== 10) return setError("Enter a valid 10-digit mobile number.");
    const nextOtp = createOtp();
    setGeneratedOtp(nextOtp); setOtp(""); setSeconds(30); setMessage("Demo OTP generated successfully."); setError(""); setStep("otp");
  };
  const resendOtp = () => { const nextOtp = createOtp(); setGeneratedOtp(nextOtp); setOtp(""); setSeconds(30); setMessage("A new demo OTP was generated."); setError(""); };
  const continueOtp = () => {
    if (otp !== generatedOtp) return setError("That OTP is incorrect. Enter the generated 6-digit code.");
    setError(""); setMessage(""); setStep("upi");
  };
  const finish = () => {
    if (!/^[a-z0-9._-]{3,}@[a-z]{3,}$/i.test(upi)) return setError("Enter a valid UPI ID, such as yourname@surepay.");
    localStorage.setItem("surepay_onboarded", "true");
    localStorage.setItem("surepay_profile", JSON.stringify({ name: name.trim(), upi: upi.trim().toLowerCase(), phone }));
    onComplete();
  };

  if (step === "splash") return <main className="onboarding splash"><div className="brand-mark shield">✓</div><p className="eyebrow">PAYMENT PROTECTION</p><h1>SurePay</h1><p className="muted">Smarter payments. Safer tomorrows.</p><div className="pulse-ring" /><button className="text-button" onClick={() => setStep("login")}>Get started <span>→</span></button></main>;
  return <main className="onboarding"><div className="onboard-panel"><div className="brand-line"><span className="brand-mark small">✓</span><strong>SurePay</strong></div>{step === "login" && <><p className="eyebrow">WELCOME TO SUREPAY</p><h1>Secure. Smart. Simple.</h1><p className="muted">Tell us who you are and we will set up your protected payment space.</p><label>Your name<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" /></label><label>Mobile number<div className="phone-input"><span>+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="10-digit number" /></div></label><button className="primary-button" onClick={continuePhone}>Send demo OTP <span>→</span></button></>}{step === "otp" && <><p className="eyebrow">SIMULATED SECURITY CHECK</p><h1>Verify your number</h1><p className="muted">No SMS provider is configured. This prototype validates the generated code below.</p><div className="demo-otp">Demo OTP: <strong>{generatedOtp}</strong></div><label>Enter OTP<input autoFocus maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="6-digit code" /></label><button className="primary-button" onClick={continueOtp}>Verify OTP <span>→</span></button><button className="link-button" disabled={seconds > 0} onClick={resendOtp}>{seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}</button></>}{step === "upi" && <><p className="eyebrow">YOUR PAYMENT IDENTITY</p><h1>Set up your UPI ID</h1><p className="muted">Choose an identity protected by SurePay.</p><label>UPI ID<input autoFocus value={upi} onChange={(event) => setUpi(event.target.value)} placeholder="yourname@surepay" /></label><div className="benefits"><span>✓ Secure UPI identity</span><span>✓ Easy payments</span><span>✓ SurePay protection</span></div><button className="primary-button" onClick={finish}>Enter SurePay <span>→</span></button></>}{message && <p className="form-success">{message}</p>}{error && <p className="form-error">{error}</p>}</div></main>;
}
