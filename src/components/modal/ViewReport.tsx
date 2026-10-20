import { FC } from "react";
import Modal from "react-modal";

const ViewReport: FC<any> = ({ modalIsOpen, closeModal, report }) => {
   if (!modalIsOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full mx-auto relative outline-none animate-fade-in overflow-hidden"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="View Report"
      >
         <div className="p-6">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
               <h2 className="text-lg font-bold text-slate-900">Report Details</h2>
               <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" onClick={closeModal}>
                  ✕
               </button>
            </div>
            {report?.postId?.media?.path && report?.postId?.media?.type !== "undefined" && (
               <div className="mb-4 rounded-2xl overflow-hidden bg-slate-950/[0.04] border border-slate-200/80 flex items-center justify-center max-h-[460px]">
                  <img src={report?.postId?.media?.path} alt="Reported media" className="max-h-[460px] w-full object-contain" />
               </div>
            )}
            {report?.postId?.content && (
               <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl mb-4">
                  <p className="text-sm text-slate-800 leading-relaxed">{report?.postId?.content}</p>
               </div>
            )}
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
               <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wide mb-1">Reason for Report</h3>
               <p className="text-sm text-rose-900 font-medium">{report?.reason}</p>
            </div>
         </div>
      </Modal>
   );
};

export default ViewReport;
