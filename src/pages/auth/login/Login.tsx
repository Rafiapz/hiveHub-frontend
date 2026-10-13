import { Formik, Form, ErrorMessage, Field } from "formik";
import { loginSchema } from "../../../schemas/LoginSchemas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash, faLock, faEnvelope, faHexagonNodes } from "@fortawesome/free-solid-svg-icons";
import { IUserLogin } from "../../../interfaces/IUserLogin";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/store";
import { loginAction, loginWithGoogle } from "../../../store/actions/auth/userActions";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

function Login() {
   const dispatch = useDispatch<AppDispatch>();
   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);

   const initialValues: IUserLogin = { email: "", password: "" };
   const handleSubmit = (data: IUserLogin): void => {
      dispatch(loginAction(data))
         .then((res: any) => {
            if (res.payload.status == "ok") {
               if (res?.payload?.userData?.role === "admin") {
                  navigate("/admin");
               } else {
                  navigate("/");
               }
            } else {
               toast(res.payload.message, { style: { backgroundColor: "#EF4444", color: "white", fontWeight: "600" } });
            }
         })
         .catch((err: any) => {
            console.log(err, "message");
         });
   };

   const handleGoogleLoginSuccess = (tokenResponse: any) => {
      const accessToken = tokenResponse.access_token;
      dispatch(loginWithGoogle(accessToken)).then(() => {
         navigate("/");
      });
   };

   const handleGoogleLoginError = (error: any) => {
      toast(error.message);
   };

   const googleAuth = useGoogleLogin({ onSuccess: handleGoogleLoginSuccess, onError: handleGoogleLoginError });

   return (
      <div className="min-h-screen w-full flex overflow-hidden">
         {/* Left Panel - Brand / Illustration */}
         <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
               <div className="absolute top-1/2 -right-16 w-60 h-60 rounded-full opacity-15 animate-pulse-slow animation-delay-400"
                    style={{ background: 'radial-gradient(circle, #3B82F6, transparent 70%)' }} />
               <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-10 animate-pulse-slow animation-delay-200"
                    style={{ background: 'radial-gradient(circle, #F97316, transparent 70%)' }} />
               {/* Grid pattern */}
               <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="relative z-10 px-12 text-center animate-fade-in">
               {/* Logo */}
               <div className="mb-8 flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-brand-hover"
                       style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
                     <FontAwesomeIcon icon={faHexagonNodes} className="text-white text-2xl" />
                  </div>
                  <h1 className="text-5xl font-black text-white tracking-tight">
                     hive<span className="text-brand-orange">Hub</span>
                  </h1>
               </div>

               {/* Tagline */}
               <h2 className="text-2xl font-bold text-white mb-4">
                  Connect. Share. <span className="text-brand-orange">Thrive.</span>
               </h2>
               <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed">
                  Join thousands of creators and professionals building meaningful connections in the hive.
               </p>

               {/* Feature pills */}
               <div className="mt-10 flex flex-wrap gap-3 justify-center">
                  {['Stories', 'Live Polls', 'Messaging', 'Premium'].map((feat, i) => (
                     <span key={i}
                           className="px-4 py-2 rounded-full text-sm font-medium text-white border border-white/20 bg-white/5 backdrop-blur-sm">
                        {feat}
                     </span>
                  ))}
               </div>

               {/* Stats */}
               <div className="mt-12 grid grid-cols-3 gap-6">
                  {[['10K+', 'Users'], ['50K+', 'Posts'], ['99%', 'Uptime']].map(([val, label], i) => (
                     <div key={i} className="text-center">
                        <p className="text-3xl font-black text-brand-orange">{val}</p>
                        <p className="text-slate-400 text-sm mt-1">{label}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Panel - Login Form */}
         <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 px-6 py-12">
            <div className="w-full max-w-md animate-slide-up">
               {/* Mobile Logo */}
               <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
                     <FontAwesomeIcon icon={faHexagonNodes} className="text-white text-lg" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-800">
                     hive<span style={{ color: '#F97316' }}>Hub</span>
                  </h1>
               </div>

               {/* Form card */}
               <div className="bg-white rounded-3xl shadow-glass p-8 border border-slate-100">
                  <div className="mb-8">
                     <h2 className="text-2xl font-bold text-slate-900">Welcome back 👋</h2>
                     <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
                  </div>

                  <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={loginSchema}>
                     <Form className="space-y-5">
                        {/* Email */}
                        <div>
                           <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                              Email Address
                           </label>
                           <div className="relative">
                              <FontAwesomeIcon icon={faEnvelope}
                                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                              <Field
                                 name="email"
                                 type="email"
                                 id="email"
                                 placeholder="you@example.com"
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                              />
                           </div>
                           <ErrorMessage name="email" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Password */}
                        <div>
                           <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                              Password
                           </label>
                           <div className="relative">
                              <FontAwesomeIcon icon={faLock}
                                 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                              <Field
                                 name="password"
                                 type={showPassword ? "text" : "password"}
                                 id="password"
                                 placeholder="••••••••"
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                              />
                              <button
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                 <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                              </button>
                           </div>
                           <ErrorMessage name="password" component="span" className="text-red-500 text-xs mt-1 block" />
                        </div>

                        {/* Forgot password */}
                        <div className="flex justify-end">
                           <Link to="/forgot-password"
                              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                              Forgot password?
                           </Link>
                        </div>

                        {/* Submit button */}
                        <button
                           type="submit"
                           className="w-full text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-brand text-sm"
                           style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                        >
                           Sign In to HiveHub
                        </button>
                     </Form>
                  </Formik>

                  {/* Divider */}
                  <div className="flex items-center my-6">
                     <div className="flex-1 h-px bg-slate-200" />
                     <span className="px-4 text-xs text-slate-400 font-medium">OR CONTINUE WITH</span>
                     <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Google Sign-in */}
                  <button
                     onClick={() => googleAuth()}
                     className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:shadow-sm text-sm"
                  >
                     <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-base" />
                     Continue with Google
                  </button>

                  {/* Signup link */}
                  <p className="text-center text-sm text-slate-500 mt-6">
                     Don't have an account?{" "}
                     <Link to="/signup"
                        className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                        Create one free
                     </Link>
                  </p>
               </div>

               <p className="text-center text-xs text-slate-400 mt-6">
                  By signing in, you agree to our{" "}
                  <span className="text-orange-400 cursor-pointer hover:underline">Terms of Service</span> and{" "}
                  <span className="text-orange-400 cursor-pointer hover:underline">Privacy Policy</span>
               </p>
            </div>
         </div>
      </div>
   );
}

export default Login;
