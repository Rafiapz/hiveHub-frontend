import { FC, useState } from "react";
import ReactPlayer from "react-player";
import { format } from "timeago.js";
import ViewModal from "../modal/ViewModal";

const Chat: FC<any> = ({ message, own, playerRef }) => {
   const [modalIsOpen, setModalIsOpen] = useState(false);
   const [item, setItem] = useState<any>({});

   const openModal = (image: any) => {
      setItem(() => {
         return {
            media: image,
         };
      });
      setModalIsOpen(true);
   };

   const closeModal = () => {
      setModalIsOpen(false);
   };

   return (
      <div className={`flex ${own ? "flex-row-reverse" : "flex-row"} items-start`}>
         <div className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
            {message?.message && (
               <>
                  <div className={`mt-2 p-2 min-w-24 bg-green-200 rounded-md max-w-xs ${own ? "mr-2" : "ml-2"}`}>{message?.message}</div>
                  <div className="text-xs text-gray-500 mt-1">{format(message?.createdAt)}</div>
               </>
            )}
            {message?.image && (
               <div className={`${own ? "mr-2" : "ml-2"}`} onClick={() => openModal(message?.image)}>
                  <img src={message?.image} className="max-h-32" alt="" />
                  <div className="text-xs text-gray-500 mt-1">{format(message?.createdAt)}</div>
               </div>
            )}
         </div>
         {message?.video && (
            <div className={`${own ? "order-2" : "order-1"}`}>
               <ReactPlayer ref={playerRef} url={message?.video} controls width="100%" height="auto" className="max-w-xs" />
               <div className={`text-xs text-gray-500 mt-1 ${own ? "text-right" : "text-left"}`}>{format(message?.createdAt)}</div>
            </div>
         )}
         <ViewModal modalIsOpen={modalIsOpen} closeModal={closeModal} item={item} />
      </div>
   );
};

export default Chat;
