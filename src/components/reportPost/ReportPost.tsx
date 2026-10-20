import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Modal from "react-modal";
import "../modal/ConfirmModal.css";
import { reportSchema } from "../../schemas/ReportPostSchema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { reportPost } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";

const ReportPost = ({ closeModal, modalIsOpen }: any) => {
   const [error, setError] = useState<string>("");
   const postId: any = useSelector((state: RootState) => state?.posts?.report?.postId);
   const dispatch = useDispatch<AppDispatch>();

   const handleChange = (e: any) => {
      if (e?.target?.value !== "") {
         setError("");
      }
   };

   const handleSubmit = (values: any) => {
      const { option, otherReason } = values;
      if (option.trim() === "other" && otherReason.trim() == "") {
         setError("This field is required");
         return;
      } else {
         setError("");

         const formData = new FormData();

         formData.append("reason", otherReason || option);

         formData.append("postId", postId);

         dispatch(reportPost(formData)).then((reponse: any) => {
            if (reponse?.payload?.status === "ok") {
               toast.success("Report submitted succefully");
            } else {
               toast.error("Unable to report the post");
            }
         });
      }

      closeModal();
   };

   const afterOpenModal = () => {
      document.body.style.overflow = "hidden";
   };
   const afterCloseModal = () => {
      document.body.style.overflow = "auto";
   };

   const options = [
      { label: "Spam", value: "spam" },
      { label: "Harmful, misleading, or damaging content", value: "Harmful, misleading, or damaging content" },
      { label: "Nudity or sexual activity", value: "Nudity or sexual activity" },
      { label: "Other", value: "other" },
   ];

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="modal-bg-overlay"
         className="bg-white p-6 shadow-2xl rounded-3xl border border-slate-100 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 outline-none animate-fade-in"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         onAfterOpen={afterOpenModal}
         onAfterClose={afterCloseModal}
      >
         <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
               🚩
            </div>
            <div>
               <h2 className="text-base font-bold text-slate-900">Report Post</h2>
               <p className="text-xs text-slate-400">Help us understand what's wrong with this post.</p>
            </div>
         </div>

         <Formik initialValues={{ option: "", otherReason: "" }} onSubmit={handleSubmit} validationSchema={reportSchema}>
            {({ values }) => (
               <Form className="space-y-3">
                  <div className="space-y-2">
                     {options.map((option, index) => (
                        <label
                           key={index}
                           className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              values.option === option.value
                                 ? "border-orange-500 bg-orange-50/50"
                                 : "border-slate-200/80 hover:bg-slate-50"
                           }`}
                        >
                           <Field
                              type="radio"
                              name="option"
                              value={option.value}
                              className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                           />
                           <span className="text-xs font-semibold text-slate-800">{option.label}</span>
                        </label>
                     ))}
                     <ErrorMessage name="option" className="text-rose-600 text-xs block" component={"span"} />

                     {values.option === "other" && (
                        <div className="pt-2">
                           <Field
                              as="textarea"
                              name="otherReason"
                              onMouseLeave={handleChange}
                              placeholder="Please describe why you are reporting this post..."
                              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                              rows={3}
                           />
                           {error && <span className="text-rose-600 text-xs block mt-1">{error}</span>}
                        </div>
                     )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                     <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        type="submit"
                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all"
                        style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                     >
                        Submit Report
                     </button>
                  </div>
               </Form>
            )}
         </Formik>
      </Modal>
   );
};

export default ReportPost;
