import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Chrome, 
  Apple, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseService } from "../services/firebase";
import { useAppStore } from "../store/useAppStore";

type AuthMode = "login" | "signup" | "forgot";

interface AuthScreensProps {
  onSuccess: () => void;
}

export default function AuthScreens({ onSuccess }: AuthScreensProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { setUser, setAuthenticated } = useAppStore();

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      // Simulate OAuth Login in AI Studio container safely
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockUser = {
        uid: `oauth-${provider}-${Date.now()}`,
        name: `Dr. ${provider === "google" ? "Alex Rivera" : "Julian Vance"}`,
        email: `${provider}@medisage.ai`,
        membershipStatus: "Premium Member" as const,
        healthScore: 98.4
      };
      
      setUser(mockUser);
      setAuthenticated(true);
      onSuccess();
    } catch (err: any) {
      setErrorMsg("OAuth authorization failed. Please try Email login instead.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid medical email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const { auth, db } = getFirebaseService();

    if (!auth) {
      // Offline/Fallback mode
      setTimeout(() => {
        setIsLoading(false);
        const guestUser = {
          uid: "guest-dr-1",
          name: "Dr. Specialist",
          email: email,
          membershipStatus: "Premium Member" as const,
          healthScore: 98.4
        };
        setUser(guestUser);
        setAuthenticated(true);
        onSuccess();
      }, 1000);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const loggedUser = {
        uid: user.uid,
        name: user.displayName || "Dr. Specialist",
        email: user.email || email,
        membershipStatus: "Premium Member" as const,
        healthScore: 98.4
      };

      setUser(loggedUser);
      setAuthenticated(true);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMsg("Invalid credentials. Please verify your secure token.");
      } else if (err.code === "auth/invalid-credential") {
        setErrorMsg("Incorrect secure credentials. Please check your medical token.");
      } else {
        setErrorMsg(err.message || "Authentication failed. Server offline.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full clinical name.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Invalid email format.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Secure password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!acceptTerms) {
      setErrorMsg("You must accept the HIPAA Privacy & Terms of Service.");
      return;
    }

    setIsLoading(true);
    const { auth, db } = getFirebaseService();

    if (!auth) {
      // Fallback Signup
      setTimeout(() => {
        setIsLoading(false);
        const guestUser = {
          uid: `guest-${Date.now()}`,
          name: fullName,
          email: email,
          membershipStatus: "Premium Member" as const,
          healthScore: 98.4
        };
        setUser(guestUser);
        setAuthenticated(true);
        onSuccess();
      }, 1000);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update Auth Profile
      await updateProfile(user, { displayName: fullName });

      const newUserProfile = {
        uid: user.uid,
        name: fullName,
        email: email,
        membershipStatus: "Premium Member" as const,
        healthScore: 98.4
      };

      // Store profile in Firestore
      if (db) {
        await setDoc(doc(db, "users", user.uid), newUserProfile);
      }

      setUser(newUserProfile);
      setAuthenticated(true);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This medical email address is already registered.");
      } else {
        setErrorMsg(err.message || "Failed to establish a clinical profile.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid clinical email address.");
      return;
    }

    setIsLoading(true);
    const { auth } = getFirebaseService();

    if (!auth) {
      // Fallback forgot
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMsg("Secure token link has been dispatched to your inbox (simulation mode).");
      }, 1200);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Secure recovery token has been dispatched to your inbox. Check spam if unreceived.");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to execute clinical password recovery.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center bg-[#F6F8FB] dark:bg-[#07111F] px-8 py-12 h-full overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#07111F] dark:text-white font-sans">
            {mode === "login" && "Clinical Login"}
            {mode === "signup" && "Create Profile"}
            {mode === "forgot" && "Recover Token"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {mode === "login" && "Unlock medical intelligence with credentials"}
            {mode === "signup" && "Establish a secure clinical portal profile"}
            {mode === "forgot" && "Reset your medical-grade security token"}
          </p>
        </div>

        {/* Action feedback banner */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-3 rounded-2xl border border-red-200 dark:border-red-900/30 text-xs font-medium"
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-[#19C37D] p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold"
          >
            <ShieldCheck size={15} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Doctor's Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Access Token / Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => { setMode("forgot"); setErrorMsg(""); }}
                className="text-xs font-semibold text-[#0B5FFF] dark:text-[#3EC7FF] hover:underline"
              >
                Forgot Security Token?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-[#0B5FFF] to-[#3EC7FF] hover:from-[#0049CC] hover:to-[#0B5FFF] text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Consultation</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Signup Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Clinical Full Name (e.g. Dr. Specialist)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Clinical Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Secure Token"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Token"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <label className="flex items-start space-x-2 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 accent-[#0B5FFF] rounded-md"
              />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal">
                I accept HIPAA clinical terms & secure telemetry encryption protocol.
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-[#0B5FFF] to-[#3EC7FF] hover:from-[#0049CC] hover:to-[#0B5FFF] text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Clinical Profile</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Forgot Form */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Enter Clinical Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 focus:border-[#0B5FFF] dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 bg-gradient-to-r from-[#0B5FFF] to-[#3EC7FF] hover:from-[#0049CC] hover:to-[#0B5FFF] text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-blue-500/10 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Dispatch Secure Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="relative bg-[#F6F8FB] dark:bg-[#07111F] px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Identity Authorization
          </span>
        </div>

        {/* Secure Provider Buttons */}
        <div className="grid grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 transition cursor-pointer"
          >
            <Chrome size={15} className="text-red-500" />
            <span>Google ID</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthLogin("apple")}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-slate-950 transition cursor-pointer"
          >
            <Apple size={15} className="text-slate-800 dark:text-white" />
            <span>Apple ID</span>
          </button>
        </div>

        {/* Screen Swapping Navigation Links */}
        <div className="text-center">
          {mode === "login" && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              New clinician?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setErrorMsg(""); }}
                className="text-[#0B5FFF] dark:text-[#3EC7FF] hover:underline"
              >
                Register Secured Profile
              </button>
            </p>
          )}

          {(mode === "signup" || mode === "forgot") && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Already have credentials?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setErrorMsg(""); }}
                className="text-[#0B5FFF] dark:text-[#3EC7FF] hover:underline"
              >
                Sign In securely
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
