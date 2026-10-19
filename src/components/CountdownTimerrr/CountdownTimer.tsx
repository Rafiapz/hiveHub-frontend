import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { resendOtpAction } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faClock } from "@fortawesome/free-solid-svg-icons";

interface ChildProps {
   timer: number;
   setTimer: React.Dispatch<React.SetStateAction<number>>;
   email: string | null;
}

const CountdownTimer: React.FC<ChildProps> = ({ timer, setTimer, email }) => {
   const intervalRef = useRef<any>();
   const dispatch = useDispatch<AppDispatch>();

   const decreaseTime = () => {
      if (timer > 0) {
         setTimer((prev: number) => prev - 1);
      } else {
         clearInterval(intervalRef.current);
         localStorage.removeItem("timer");
      }
   };

   useEffect(() => {
      localStorage.setItem("timer", timer.toString());
      intervalRef.current = setInterval(decreaseTime, 1000);
      return () => {
         clearInterval(intervalRef.current);
         localStorage.removeItem("timer");
      };
   }, [timer]);

   const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
   };

   const handleResendOtp = () => {
      dispatch(resendOtpAction(email)).then((data: any) => {
         if (data?.payload?.status === "ok") {
            setTimer(120);
            toast.success(data?.payload?.message || "OTP resent successfully!");
         } else {
            toast.error(data?.payload?.message || "Failed to resend OTP");
         }
      });
   };

   return (
      <div className="flex items-center justify-center w-full">
         {timer > 0 ? (
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3.5 py-1.5 rounded-full text-xs font-medium">
               <FontAwesomeIcon icon={faClock} className="text-orange-500 text-xs" />
               <span>Code expires in</span>
               <span className="font-mono font-bold text-brand-orange">{formatTime(timer)}</span>
            </div>
         ) : (
            <button
               type="button"
               onClick={handleResendOtp}
               className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-orange hover:text-brand-orange-dark transition-colors group cursor-pointer"
            >
               <FontAwesomeIcon icon={faRotateRight} className="text-xs group-hover:rotate-180 transition-transform duration-300" />
               <span>Didn't receive code? <span className="underline">Resend OTP</span></span>
            </button>
         )}
      </div>
   );
};

export default React.memo(CountdownTimer);
