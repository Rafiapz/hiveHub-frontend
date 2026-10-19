import { useState } from "react";
import OtpInput from "react-otp-input";
import CountdownTimer from "../CountdownTimerrr/CountdownTimer";
import { useDispatch } from "react-redux";
import { otpVerification } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeOpenText, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function OTPVerfitication() {
   const [otp, setOtp] = useState<string>("");
   const initialTime: string | null = localStorage.getItem("timer");
   const initialTimeValue: number = initialTime ? parseInt(initialTime, 10) : 60 * 2;
   const [timer, setTimer] = useState<number>(initialTimeValue);
   const [error, setError] = useState<string>("");
   const [verifying, setVerifying] = useState<boolean>(false);
   const dispatch = useDispatch<AppDispatch>();
   const [search] = useSearchParams();
   const navigate = useNavigate();
   const email = search.get("email");

   const handleChange = (newOtp: string) => {
      setOtp(newOtp);
      if (error) setError("");
   };

   const handleVerify = () => {
      if (timer <= 0) {
         setError("Your OTP has timed out. Please request a new one.");
         return;
      } else if (otp.length < 4) {
         setError("Invalid OTP length. Please enter a 4-digit code.");
         return;
      } else {
         setError("");
         setVerifying(true);
         dispatch(otpVerification({ otp: otp, email }))
            .then((data: any) => {
               setVerifying(false);
               if (data?.payload?.status === "ok") {
                  navigate("/");
                  toast.success(data?.payload?.message || "Email verified successfully!", {
                     style: { backgroundColor: "#10B981", color: "white", fontWeight: "600" },
                  });
               } else {
                  toast.error(data?.payload?.message || "Verification failed. Please check your code.", {
                     style: { backgroundColor: "#EF4444", color: "white", fontWeight: "600" },
                  });
               }
            })
            .catch(() => {
               setVerifying(false);
               toast.error("Verification failed. Please try again.");
            });
      }
   };

   return (
      <div className="w-full max-w-md animate-slide-up my-auto py-2">
         {/* Form card */}
         <div className="bg-white rounded-3xl shadow-glass p-6 sm:p-8 border border-slate-100">
            <div className="mb-6 text-center">
               <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm"
                  style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.18))" }}
               >
                  <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-brand-orange text-2xl" />
               </div>
               <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Verify your email ✉️</h2>
               <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  We've sent a 4-digit verification code to
               </p>
               {email && (
                  <p className="font-semibold text-slate-800 text-sm mt-0.5 break-all">
                     {email}
                  </p>
               )}
            </div>

            <div className="flex flex-col items-center">
               {/* Otp inputs */}
               <div className="my-2 flex justify-center w-full">
                  <OtpInput
                     value={otp}
                     onChange={handleChange}
                     numInputs={4}
                     renderSeparator={<span className="w-2.5 sm:w-3" />}
                     renderInput={(props) => (
                        <input
                           {...props}
                           className="focus:!border-orange-500 focus:!ring-2 focus:!ring-orange-400/25 focus:!bg-white outline-none"
                        />
                     )}
                     inputStyle={{
                        width: "56px",
                        height: "60px",
                        fontSize: "24px",
                        fontWeight: "700",
                        borderRadius: "16px",
                        border: "2px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        color: "#0F172A",
                        textAlign: "center",
                        outline: "none",
                        transition: "all 0.2s ease",
                     }}
                     shouldAutoFocus
                  />
               </div>

               {error && (
                  <span className="text-red-500 text-xs mt-2 text-center font-medium block">
                     {error}
                  </span>
               )}

               {/* Timer / Resend */}
               <div className="mt-4 mb-6">
                  <CountdownTimer email={email} timer={timer} setTimer={setTimer} />
               </div>

               {/* Verify button */}
               <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-brand text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
               >
                  {verifying ? "Verifying code..." : "Verify & Proceed"}
               </button>
            </div>

            {/* Back to signup / signin */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
               <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-brand-orange transition-colors"
               >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  <span>Change email</span>
               </Link>
               <Link
                  to="/"
                  className="font-semibold text-brand-orange hover:text-brand-orange-dark transition-colors"
               >
                  Back to Sign In
               </Link>
            </div>
         </div>

         <p className="text-center text-xs text-slate-400 mt-4 pb-1">
            Didn't receive the email? Check spam or promotions tab.
         </p>
      </div>
   );
}

export default OTPVerfitication;
