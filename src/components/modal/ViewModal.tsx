import { FC } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ViewModal: FC<any> = ({ modalIsOpen, closeModal, item }) => {
   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all"
         className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto relative overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="View Media"
      >
         <div className="relative p-5">
            <button
               className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all shadow-sm"
               onClick={closeModal}
               aria-label="Close"
            >
               <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>

            {item?.media && item?.media !== "undefined" && (
               <div className="mb-4 flex items-center justify-center bg-slate-900/5 rounded-xl overflow-hidden p-2">
                  <img
                     src={item?.media}
                     alt="Media Preview"
                     className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
                  />
               </div>
            )}

            {item?.content && (
               <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <p className="text-sm text-slate-700 leading-relaxed">{item?.content}</p>
               </div>
            )}
         </div>
      </Modal>
   );
};

export default ViewModal;
