import { Formik, Form, ErrorMessage, Field } from "formik";
import { signupSchema } from "../../schemas/SignupSchema";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  faEye,
  faEyeSlash,
  faLock,
  faEnvelope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { IUserSignupdata } from "../../interfaces/IUserSignup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import {
  loginWithGoogle,
  signupAction,
} from "../../store/actions/auth/userActions";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import AuthBrandPanel from "../auth/AuthBrandPanel";

function SignupForm() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: IUserSignupdata = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = (values: IUserSignupdata) => {
    const { confirmPassword, ...restValues } = values;

    dispatch(signupAction(restValues))
      .then((data: any) => {
        if (data?.payload?.status === "ok") {
          toast.success(
            "Account created successfully! Please verify your email.",
          );
          navigate(
            `/verification?email=${encodeURIComponent(restValues.email)}`,
          );
        } else {
          toast.error(data?.payload?.message || "Failed to create account");
        }
      })
      .catch(() => {
        toast.error("Registration error. Please try again.");
      });
  };

  const handleGoogleLoginSuccess = (tokenResponse: any) => {
    const accessToken = tokenResponse.access_token;
    dispatch(loginWithGoogle(accessToken)).then(() => {
      navigate("/");
    });
  };

  const handleGoogleLoginError = (error: any) => {
    toast.error(error.message || "Google sign in failed");
  };

  const googleAuth = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
  });

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-slate-900 lg:bg-slate-50 overflow-x-hidden lg:overflow-hidden">
      {/* Brand Showcase Panel - Top on mobile, Left half on desktop */}
      <AuthBrandPanel />

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full flex flex-col items-center justify-center bg-slate-50 px-4 py-8 sm:px-8 lg:px-8 lg:py-3 -mt-6 sm:-mt-8 lg:mt-0 rounded-t-[32px] lg:rounded-none shadow-2xl lg:shadow-none relative z-10 lg:overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md animate-slide-up my-auto py-1">
          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-glass p-5 sm:p-6 border border-slate-100">
            <div className="mb-3 sm:mb-3.5">
              <h2 className="text-2xl font-bold text-slate-900">
                Create account 🚀
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Join the HiveHub community today
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validationSchema={signupSchema}
            >
              <Form className="space-y-2.5 sm:space-y-3">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                    />
                    <Field
                      name="fullName"
                      type="text"
                      id="fullName"
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 sm:py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                    />
                  </div>
                  <ErrorMessage
                    name="fullName"
                    component="span"
                    className="text-red-500 text-xs mt-0.5 block"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                  >
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 sm:py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                    />
                  </div>
                  <ErrorMessage
                    name="email"
                    component="span"
                    className="text-red-500 text-xs mt-0.5 block"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                    />
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-2 sm:py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="text-sm"
                      />
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="span"
                    className="text-red-500 text-xs mt-0.5 block"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                    />
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-2 sm:py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all duration-200 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                        className="text-sm"
                      />
                    </button>
                  </div>
                  <ErrorMessage
                    name="confirmPassword"
                    component="span"
                    className="text-red-500 text-xs mt-0.5 block"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full text-white font-semibold py-2.5 sm:py-2.5 px-6 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-brand text-sm mt-1"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EA580C)",
                  }}
                >
                  Create HiveHub Account
                </button>
              </Form>
            </Formik>

            {/* Divider */}
            <div className="flex items-center my-3 sm:my-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="px-3 text-xs text-slate-400 font-medium tracking-wider">
                OR CONTINUE WITH
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Google Sign-in */}
            <button
              onClick={() => googleAuth()}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-2 sm:py-2.5 px-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 hover:shadow-xs text-sm"
            >
              <FontAwesomeIcon
                icon={faGoogle}
                className="text-red-500 text-base"
              />
              Continue with Google
            </button>

            {/* Login link */}
            <p className="text-center text-xs sm:text-sm text-slate-500 mt-3 sm:mt-3">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-2.5 sm:mt-3 pb-1">
            By registering, you agree to our{" "}
            <span className="text-orange-400 cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-orange-400 cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
