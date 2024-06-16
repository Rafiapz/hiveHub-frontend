import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { createConversation } from "../../store/actions/message/messageActions";
import { searchUser } from "../../service/api";

const NewMessage = ({ modalIsOpen, closeModal, handleFetchConversations, handleSelectConversation, conversations, onlineUsers }: any) => {
   const allUsers: any = useSelector((state: RootState) => state?.user?.allUsers?.data);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const [suggestions, setSuggestions] = useState<any>([]);

   useEffect(() => {
      setSuggestions(allUsers);
      return () => {
         setSuggestions(allUsers);
      };
   }, []);

   const dispatch = useDispatch<AppDispatch>();

   const handleClick = (receiverId: any) => {
      let flag = "ok";
      let conv;

      conversations?.forEach((ob: any) => {
         if (ob?.members[0]?._id === receiverId || ob?.members[1]?._id === receiverId) {
            handleSelectConversation(ob);
            flag = "return ";
            conv = ob;
            return;
         }
      });

      if (flag === "return ") {
         handleFetchConversations();
         handleSelectConversation(conv);
         closeModal();
         return;
      }

      const form = new FormData();
      form.append("senderId", userId || "");
      form.append("receiverId", receiverId);

      dispatch(createConversation(form)).then((response) => {
         if (response?.payload?.status === "ok") {
            closeModal();
            handleFetchConversations();
            handleSelectConversation(response?.payload?.data);
         }
      });
   };

   const handleCloseModal = () => {
      setSuggestions(allUsers);
      closeModal();
   };

   const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event?.target?.value === "") {
         return;
      }
      const searchQuery = event.target.value;

      const newSuggestions = await searchUser(searchQuery);

      setSuggestions(newSuggestions?.data);
   };

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         className="modal-content bg-white  h-[500px] rounded-lg shadow-xl  min-w-3/4 w-[550px]  "
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         contentLabel="Report Post Modal"
      >
         <div className="p-6 flex flex-col h-full">
            <div className="mb-4">
               <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">New Message</h2>
                  <button className="text-gray-600 hover:text-gray-800 focus:outline-none" onClick={handleCloseModal}>
                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
               <div className="flex items-center mb-2 mt-2">
                  <label htmlFor="search" className="text-gray-700 font-semibold mr-2">
                     To:
                  </label>
                  <div className="relative flex-grow">
                     <input
                        type="text"
                        id="search"
                        className="border border-gray-300 rounded-lg py-2 px-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search..."
                        onChange={handleInputChange}
                     />
                  </div>
               </div>
            </div>
            <div className="flex-grow overflow-y-auto">
               <div className="grid grid-cols-1  gap-4">
                  {suggestions?.map((user: any) => (
                     <div key={user?._id} className="user-card bg-white rounded-lg shadow-md p-3 h-24 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center mb-4">
                           <div className="profile-photo mr-4 hover:cursor-pointer" onClick={() => handleClick(user?._id)}>
                              <img src={user?.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                           </div>
                           <div className="user-name hover:cursor-pointer" onClick={() => handleClick(user?._id)}>
                              <h1 className="text-lg font-semibold">{user?.fullName}</h1>
                              <h5>{user?.email}</h5>
                              {onlineUsers?.includes(user?._id) && (
                                 <div className="flex">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500 mr-1" />
                                    <span className="text-green-500">Online</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </Modal>
   );
};

export default NewMessage;
