import { useState } from "react";
import OtpInput from "react-otp-input";
import CountdownTimer from "../CountdownTimerrr/CountdownTimer";
import { useDispatch } from "react-redux";
import { otpVerification } from "../../store/actions/auth/userActions";
import { AppDispatch } from "../../store/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

function OTPVerfitication() {
   const [otp, setOtp] = useState<string>("");
   const initialTime: string | null = localStorage.getItem("timer");
   const initialTimeValue: number = initialTime ? parseInt(initialTime, 10) : 60 * 2;
   const [timer, setTimer] = useState<number>(initialTimeValue);
   const [error, setError] = useState<string>("");
   const dispatch = useDispatch<AppDispatch>();
   const [search] = useSearchParams();
   const navigate = useNavigate();
   const email = search.get("email");
   const handleChange = (otp: string) => {
      setOtp(otp);
   };

   const handleVerify = () => {
      if (timer <= 0) {
         setError("Your OTP has timed out. Please request a new one.");
         return;
      } else if (otp.length < 4) {
         setError("Invalid OTP length. Please enter a 4-digit code.");
      } else {
         dispatch(otpVerification({ otp: otp, email })).then((data: any) => {
            if (data?.payload?.status === "ok") {
               navigate("/");
               toast(data?.payload?.message, { style: { backgroundColor: "green", color: "white" } });
            } else {
               toast(data?.payload?.message, { style: { backgroundColor: "red", color: "white" } });
            }
         });
      }
   };

   return (
      <div className="mt-40 ml-36 max-w-lg mx-auto">
         <div className="mb-6">
            <h3 className="text-gray-700">
               Please check your email inbox, including the spam folder, for the OTP. Once received, kindly submit it for verification. Thank you for
               your cooperation!
            </h3>
         </div>
         <h2 className="text-3xl font-bold mb-4 ml-7">Enter OTP</h2>
         <div className="flex items-center ">
            <OtpInput
               value={otp}
               onChange={handleChange}
               numInputs={4}
               renderSeparator={<span> - </span>}
               renderInput={(props) => <input {...props} />}
               inputStyle={{
                  border: "2px solid black",
                  borderRadius: "8px",
                  width: "54px",
                  height: "54px",
                  fontSize: "20px",
                  color: "black",
                  fontWeight: "400",
                  caretColor: "#ffffff",
                  backgroundColor: "transparent",
                  textTransform: "uppercase",
               }}
               shouldAutoFocus
            />
            <button onClick={handleVerify} className="ml-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-md">
               Verify
            </button>
         </div>
         <span className="text-red-700">{error}</span>
         <div className="flex items-center mt-4 mr-32">
            <CountdownTimer email={email} timer={timer} setTimer={setTimer} />
         </div>
      </div>
   );
}

export default OTPVerfitication;
