import { FC } from "react";
import Modal from "react-modal";

const ViewReport: FC<any> = ({ modalIsOpen, closeModal, report }) => {
   if (!modalIsOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   console.log(report);

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="modal-bg-overlay fixed inset-0 z-50 flex items-center justify-center"
         className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-auto relative"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="View Report"
      >
         <div className="p-6">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold">View Report</h2>
               <button className="text-gray-500 hover:text-gray-700 focus:outline-none" onClick={closeModal}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
               </button>
            </div>
            {report?.postId?.media?.type !== "undefined" && (
               <div className="mb-4">
                  <img src={report?.postId?.media?.path} className="max-h-96 mx-auto" />
               </div>
            )}
            {report?.postId?.content && (
               <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p>{report?.postId?.content}</p>
               </div>
            )}
            <div className="bg-red-100 p-4 rounded-md">
               <h3 className="text-lg font-bold mb-2">Reason for Report</h3>
               <p>{report?.reason}</p>
            </div>
         </div>
      </Modal>
   );
};

export default ViewReport;
