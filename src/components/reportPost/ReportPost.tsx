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
      console.log(e?.target?.value);
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
      <div>
         <Modal
            appElement={document.getElementById("root") as HTMLElement}
            overlayClassName="modal-bg-overlay"
            className="bg-white py-4 shadow-xl rounded-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full sm:w-1/3"
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            onAfterOpen={afterOpenModal}
            onAfterClose={afterCloseModal}
         >
            <h2 className="text-center text-lg font-semibold mb-4">Report Post</h2>
            <Formik initialValues={{ option: "", otherReason: "" }} onSubmit={handleSubmit} validationSchema={reportSchema}>
               {({ values }) => (
                  <Form>
                     <div className="px-4 md:px-10 gap-2">
                        {options.map((option, index) => (
                           <label key={index} className="flex items-center">
                              <Field
                                 type="radio"
                                 name="option"
                                 value={option.value}
                                 checked={values.option === option.value}
                                 className="form-radio h-4 w-4 text-blue-500 mr-2"
                              />
                              <span className="text-gray-800">{option.label}</span>
                           </label>
                        ))}
                        <ErrorMessage name="option" className="text-red-700" component={"span"} />
                        {values.option === "other" && (
                           <div>
                              <Field
                                 as="textarea"
                                 name="otherReason"
                                 onMouseLeave={handleChange}
                                 className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:border-blue-500 mb-4"
                                 cols={1}
                                 rows={3}
                              />
                              {error && <span className="text-red-500">{error}</span>}
                           </div>
                        )}
                     </div>
                     <div className="flex justify-center mt-4">
                        <button type="submit" className="bg-blue-500 text-white rounded-md py-2 px-4 mr-4 hover:bg-blue-600 focus:outline-none">
                           Submit
                        </button>
                        <button onClick={closeModal} className="bg-gray-500 text-white rounded-md py-2 px-4 hover:bg-gray-600 focus:outline-none">
                           Close
                        </button>
                     </div>
                  </Form>
               )}
            </Formik>
         </Modal>
      </div>
   );
};

export default ReportPost;
