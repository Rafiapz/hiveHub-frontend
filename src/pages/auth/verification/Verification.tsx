import AuthBrandPanel from "../../../components/auth/AuthBrandPanel";
import OTPVerification from "../../../components/OTP/OTPVerfitication";

function Verification() {
   return (
      <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-slate-900 lg:bg-slate-50 overflow-x-hidden lg:overflow-hidden">
         {/* Brand Showcase Panel - Top on mobile, Left half on desktop */}
         <AuthBrandPanel />

         {/* Right Panel - OTP Form */}
         <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full flex flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-8 lg:px-8 lg:py-6 -mt-6 sm:-mt-8 lg:mt-0 rounded-t-[32px] lg:rounded-none shadow-2xl lg:shadow-none relative z-10 lg:overflow-y-auto no-scrollbar">
            <OTPVerification />
         </div>
      </div>
   );
}

export default Verification;
