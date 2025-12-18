import React, { useState } from "react";
import { Eye, EyeOff, LogIn, Send } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

const toHex = (buf: ArrayBuffer) => {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
};

const hashPassword = async (password: string) => {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return toHex(digest);
};

const Login: React.FC<Props> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("inv_admin_token", data.token);
      localStorage.setItem("inv_admin_auth", "1");
      onSuccess();
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    try {
      const resp = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const text = await resp.text();
      let data: any = {};
      if (text && text.trim().length > 0) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid response from server");
        }
      }
      if (!resp.ok || data.success === false) {
        throw new Error((data && data.message) || "Failed to send OTP");
      }
      setOtpSent(true);
      if (data && data.emailed === false) {
        setError(
          "OTP generated. Email delivery not configured; use code from server log."
        );
      }
    } catch (e: any) {
      setError(e.message || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Sign In</h2>
          <p className="text-sm text-gray-500">
            Access the inventory dashboard
          </p>
        </div>
        {error && (
          <div className="text-red-600 text-sm font-medium">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin@enterprise-inventory.com"
              required
            />
            <button
              type="button"
              onClick={handleSendOtp}
              className="mt-2 inline-flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-lg text-xs font-semibold"
            >
              <Send size={14} />
              <span>Send OTP</span>
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={
                otpSent ? "Enter 4-digit OTP" : "Click Send OTP first"
              }
              required
            />
            {otpSent && (
              <p className="text-xs text-gray-400">
                OTP sent to your admin email. Expires in a few minutes.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            <LogIn size={18} />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
