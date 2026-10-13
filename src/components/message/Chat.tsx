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
      <div className={`flex ${own ? "justify-end" : "justify-start"} my-1.5`}>
         <div className={`flex flex-col ${own ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}>
            {/* Text Message */}
            {message?.message && (
               <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-xs ${
                     own
                        ? "text-white rounded-tr-xs shadow-orange-500/10"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                  }`}
                  style={own ? { background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' } : {}}
               >
                  {message?.message}
               </div>
            )}

            {/* Image Message */}
            {message?.image && (
               <div
                  className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs cursor-pointer group max-w-xs relative bg-slate-900"
                  onClick={() => openModal(message?.image)}
               >
                  <img
                     src={message?.image}
                     className="max-h-60 w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                     alt="Attached"
                     loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                     Click to expand
                  </div>
               </div>
            )}

            {/* Video Message */}
            {message?.video && (
               <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs max-w-xs sm:max-w-sm bg-black">
                  <ReactPlayer ref={playerRef} url={message?.video} controls width="100%" height="auto" />
               </div>
            )}

            {/* Timestamp */}
            <span className={`text-[10px] text-slate-400 font-medium mt-1 px-1 ${own ? "text-right" : "text-left"}`}>
               {format(message?.createdAt)}
            </span>
         </div>

         <ViewModal modalIsOpen={modalIsOpen} closeModal={closeModal} item={item} />
      </div>
   );
};

export default Chat;
