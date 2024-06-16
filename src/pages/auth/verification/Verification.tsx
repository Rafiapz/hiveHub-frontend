import AuthBody from "../../../components/authBody/AuthBody";
import OTP from "../../../components/OTP/OTPVerfitication";

function Verification() {
   return (
      <div className="flex w-full  overflow-auto">
         <AuthBody />
         <OTP />
      </div>
   );
}

export default Verification;
