import { FC } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const PremiumSuccessModal: FC<any> = ({ modalIsOpen, closeModal }) => {
   const navigate = useNavigate();

   const handleClose = () => {
      closeModal();
      navigate("/");
   };
   return (
      <Modal
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="Premium Benefits"
         className="fixed inset-0 z-50 flex items-center justify-center"
         overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
         <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Congratulations! You've unlocked Premium Benefits!</h2>
            <ul className="list-disc list-inside mb-6">
               <li className="mb-2">
                  <strong>Premium badge:</strong> Enjoy an enhanced browsing experience with our premium badge
               </li>
               <li className="mb-2">
                  <strong>Exclusive Content:</strong> Access to premium content and features not available to regular users.
               </li>
               <li className="mb-2">
                  <strong>Priority Support:</strong> Get your issues resolved faster with priority customer support.
               </li>
               <li className="mb-2">
                  <strong>Increased Storage:</strong> Enjoy more storage space for your files and data.
               </li>
               <li className="mb-2">
                  <strong>Early Access:</strong> Be among the first to try out new features and updates.
               </li>
            </ul>
            <button onClick={handleClose} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
               Close
            </button>
         </div>
      </Modal>
   );
};

export default PremiumSuccessModal;
