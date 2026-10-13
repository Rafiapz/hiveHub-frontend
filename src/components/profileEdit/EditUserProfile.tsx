import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editUserPassword,
  editUserProfile,
  fetchuser,
  logoutAction,
} from "../../store/actions/auth/userActions";
import { AppDispatch, RootState } from "../../store/store";
import { ErrorMessage, Field, Form, Formik } from "formik";
import {
  emailSchema,
  fullNameSchema,
  passwordSchema,
} from "../../schemas/SignupSchema";
import toast from "react-hot-toast";
import OtpInput from "react-otp-input";
import EditEmailCountdown from "../CountdownTimerrr/EditEmailCountdown";
import { verifyEmailUpdateOtp } from "../../service/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUser,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import socketService from "../../service/socketService";
import { useNavigate } from "react-router-dom";

const socket = socketService.socket;

function EditUserProfile() {
  const userData: any = useSelector(
    (state: RootState) => state?.user?.user?.data,
  );
  const [error, setError] = useState("");
  const [emailEditing, setEmailEditing] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const initialTime: string | null = localStorage.getItem("timer");
  const initialTimeValue: number = initialTime
    ? parseInt(initialTime, 10)
    : 60 * 2;
  const [timer, setTimer] = useState<number>(initialTimeValue);
  const [emailForm, setEmailForm] = useState<any>({});
  const [change, setChange] = useState<boolean>(true);
  const [otpError, setOtpError] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleChangeOtp = (otp: string) => {
    setOtp(otp);
  };

  const resendOtp = () => {
    handleEmailSubmit(emailForm);
  };

  useEffect(() => {
    if (timer <= 0) {
      setChange(true);
    }
  }, [timer]);

  useEffect(() => {
    dispatch(fetchuser());
  }, [dispatch]);

  const handleFullNameSubmit = (values: any) => {
    const { fullName } = values;
    const formData = new FormData();
    formData.append("fullName", fullName);

    dispatch(editUserProfile(formData)).then((response) => {
      dispatch(fetchuser());
      if (response?.payload?.status === "ok") {
        toast.success(
          response?.payload?.message || "Name updated successfully",
        );
      } else {
        toast.error(response?.payload?.message || "Failed to update name");
      }
    });
  };

  const handleEmailSubmit = (values: any) => {
    const { email } = values;
    const formData = new FormData();
    formData.append("email", email);

    dispatch(editUserProfile(formData)).then((response) => {
      dispatch(fetchuser());
      if (response?.payload?.status === "ok") {
        setChange(false);
        toast.success(
          response?.payload?.message || "Verification code sent to email",
        );
        setEmailEditing(true);
      } else {
        toast.error(
          response?.payload?.message || "Failed to initiate email change",
        );
      }
    });

    setEmailForm(values);
  };

  const handlePasswordSubmit = (values: any) => {
    const { password, oldPassword } = values;
    const formData = new FormData();

    formData.append("oldPassword", oldPassword);
    formData.append("ogOldPassword", userData.password);
    formData.append("password", password);

    dispatch(editUserPassword(formData)).then((response) => {
      dispatch(fetchuser());
      if (response?.payload?.status === "ok") {
        toast.success(
          response?.payload?.message || "Password updated successfully",
        );
      } else {
        if (response?.payload?.status === "invalid") {
          setError(response?.payload?.error);
        }
        toast.error(response?.payload?.error || "Failed to update password");
      }
    });
  };

  const handleOtpSubmit = async () => {
    if (timer <= 0) {
      setOtpError("Your OTP has timed out. Please request a new one.");
      return;
    } else if (otp.length < 4) {
      setOtpError("Invalid OTP length. Please enter a 4-digit code.");
      return;
    }
    setOtpError("");
    try {
      const response = await verifyEmailUpdateOtp({
        otp,
        oldEmail: userData?.email,
        newEmail: emailForm?.email,
      });
      if (response.data.status === "ok") {
        toast.success(response?.data?.message);
        dispatch(fetchuser());
        setTimer(0);
        setEmailEditing(false);
        setOtp("");
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const handleLogout = () => {
    dispatch(logoutAction()).then((response) => {
      if (response?.payload?.status === "ok") {
        socket.disconnect();
        navigate("/");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Personal Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-sm" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Personal Details
            </h3>
            <p className="text-xs text-slate-500">
              Update your public display name and email
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Full Name Form */}
          <Formik
            initialValues={{ fullName: userData?.fullName || "" }}
            enableReinitialize
            validationSchema={fullNameSchema}
            onSubmit={handleFullNameSubmit}
          >
            <Form className="space-y-3">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <Field
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <ErrorMessage
                  className="text-xs text-red-500 mt-1 block"
                  component="span"
                  name="fullName"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Update Name
                </button>
              </div>
            </Form>
          </Formik>

          {/* Email Form */}
          <Formik
            initialValues={{ email: userData?.email || "" }}
            enableReinitialize
            validationSchema={emailSchema}
            onSubmit={handleEmailSubmit}
          >
            <Form className="space-y-3 pt-4 border-t border-slate-100">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-3.5 text-slate-400 text-xs"
                  />
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <ErrorMessage
                  className="text-xs text-red-500 mt-1 block"
                  component="span"
                  name="email"
                />
              </div>

              <div className="flex justify-end">
                {change && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                  >
                    Change Email
                  </button>
                )}
              </div>
            </Form>
          </Formik>

          {/* OTP Verification Section */}
          {emailEditing && (
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-orange-950">
                Enter Verification Code
              </h4>
              <p className="text-xs text-slate-600">
                Enter the 4-digit code sent to {emailForm?.email}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <OtpInput
                  value={otp}
                  onChange={handleChangeOtp}
                  numInputs={4}
                  renderSeparator={
                    <span className="mx-1 text-slate-400">-</span>
                  }
                  renderInput={(props) => <input {...props} />}
                  inputStyle={{
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    width: "44px",
                    height: "44px",
                    fontSize: "18px",
                    color: "#0F172A",
                    fontWeight: "600",
                    backgroundColor: "#FFFFFF",
                    textAlign: "center",
                  }}
                  shouldAutoFocus
                />
                <button
                  onClick={handleOtpSubmit}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Verify
                </button>
              </div>
              {otpError && (
                <p className="text-xs text-red-600 font-medium">{otpError}</p>
              )}
              <div className="text-xs text-slate-500">
                <EditEmailCountdown
                  email={emailForm?.email}
                  timer={timer}
                  setTimer={setTimer}
                  resendOtp={resendOtp}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="text-sm" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Security & Password
              </h3>
              <p className="text-xs text-slate-500">
                Ensure your account is using a strong password
              </p>
            </div>
          </div>

          <Formik
            initialValues={{
              password: "",
              oldPassword: "",
              confirmPassword: "",
            }}
            validationSchema={passwordSchema}
            onSubmit={handlePasswordSubmit}
          >
            <Form className="space-y-4">
              <div>
                <label
                  htmlFor="oldPassword"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Current Password
                </label>
                <Field
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <ErrorMessage
                  className="text-xs text-red-500 mt-1 block"
                  component="span"
                  name="oldPassword"
                />
                {error && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {error}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  New Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <ErrorMessage
                  className="text-xs text-red-500 mt-1 block"
                  component="span"
                  name="password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Confirm New Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <ErrorMessage
                  className="text-xs text-red-500 mt-1 block"
                  component="span"
                  name="confirmPassword"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Update Password
                </button>
              </div>
            </Form>
          </Formik>
        </div>

        {/* Account Session / Log Out Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Account Session
            </h4>
            <p className="text-xs text-slate-500">
              Sign out of your HiveHub account on this device
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserProfile;
