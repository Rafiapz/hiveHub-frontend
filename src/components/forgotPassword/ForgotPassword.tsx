import { FC, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { emailSchema } from "../../schemas/SignupSchema";
import { forgotPasswordSendEmail } from "../../service/api";
import toast from "react-hot-toast";
import ReactLoading from "react-loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import AuthBrandPanel from "../auth/AuthBrandPanel";

const ForgotPassword: FC = () => {
   const [loading, setLoading] = useState(false);
   const [emailSent, setEmailSent] = useState(false);
   const [sentEmail, setSentEmail] = useState("");

   const handleSubmit = (values: { email: string }) => {
      setLoading(true);
      const { email } = values;
      forgotPasswordSendEmail(email)
         .then((response: any) => {
            setLoading(false);
            if (response.data.status === "ok") {
               setEmailSent(true);
               setSentEmail(email);
               toast.success("Password reset instructions sent to your email!", {
                  style: { backgroundColor: "#10B981", color: "white", fontWeight: "600" },
                  duration: 8000,
               });
            } else {
               toast.error(response.data.message || "Failed to send reset email", {
                  style: { backgroundColor: "#EF4444", color: "white", fontWeight: "600" },
               });
            }
         })
         .catch(() => {
            setLoading(false);
            toast.error("Something went wrong. Please try again.");
         });
   };

   return (
      <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-slate-900 lg:bg-slate-50 overflow-x-hidden lg:overflow-hidden">
         {/* Brand Showcase Panel - Top on mobile, Left half on desktop */}
         <AuthBrandPanel />

         {/* Right Panel */}
         <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full flex flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-8 lg:px-8 lg:py-6 -mt-6 sm:-mt-8 lg:mt-0 rounded-t-[32px] lg:rounded-none shadow-2xl lg:shadow-none relative z-10 lg:overflow-y-auto no-scrollbar">
            <div className="w-full max-w-md animate-slide-up my-auto py-2">
               <div className="bg-white rounded-3xl shadow-glass p-6 sm:p-8 border border-slate-100">
                  {/* Header */}
                  <div className="mb-6">
                     <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                        style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.18))" }}
                     >
                        <FontAwesomeIcon icon={faKey} className="text-brand-orange text-xl" />
                     </div>
                     <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Forgot password? 🔐</h2>
                     <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        {emailSent
                           ? `We've sent a password reset link to ${sentEmail}. Please check your inbox and spam folder.`
                           : "No worries! Enter the email address associated with your account and we'll send you a password reset link."}
                     </p>
                  </div>

                  {!emailSent ? (
                     <Formik initialValues={{ email: "" }} onSubmit={handleSubmit} validationSchema={emailSchema}>
                        <Form className="space-y-4">
                           <div>
                              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                                 Email Address
                              </label>
                              <div className="relative">
                                 <FontAwesomeIcon
                                    icon={faEnvelope}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                                 />
                                 <Field
                                    name="email"
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                                 />
                              </div>
                              <ErrorMessage name="email" component="span" className="text-red-500 text-xs mt-1 block" />
                           </div>

                           <button
                              type="submit"
                              disabled={loading}
                              className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-brand text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                              style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}
                           >
                              {loading ? (
                                 <>
                                    <ReactLoading type={"spin"} color="#ffffff" height={18} width={18} />
                                    <span>Sending Reset Link...</span>
                                 </>
                              ) : (
                                 <span>Send Reset Link</span>
                              )}
                           </button>
                        </Form>
                     </Formik>
                  ) : (
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm flex items-start gap-3">
                           <span className="text-base">✉️</span>
                           <div>
                              <p className="font-semibold">Check your email</p>
                              <p className="text-emerald-700 mt-0.5 text-xs">
                                 Click the link in the email to set a new password. If you don't see it, check your spam folder.
                              </p>
                           </div>
                        </div>

                        <button
                           type="button"
                           onClick={() => setEmailSent(false)}
                           className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                        >
                           Try a different email
                        </button>
                     </div>
                  )}

                  {/* Back to sign in */}
                  <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                     <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-orange transition-colors"
                     >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        <span>Back to Sign In</span>
                     </Link>
                  </div>
               </div>

               <p className="text-center text-xs text-slate-400 mt-4 pb-1">
                  Remembered your password?{" "}
                  <Link to="/" className="text-orange-400 font-semibold hover:underline">
                     Sign in now
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default ForgotPassword;
