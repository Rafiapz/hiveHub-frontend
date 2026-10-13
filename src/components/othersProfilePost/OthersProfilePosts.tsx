import { useState } from "react";
import OthersPost from "../OthersPost/OthersPost";
import ReportPost from "../reportPost/ReportPost";

function OthersProfilePosts() {
   const [modalIsOpen, setIsOpen] = useState(false);

   function openModal() {
      setIsOpen(true);
   }
   function closeModal() {
      setIsOpen(false);
   }
   return (
      <>
         <OthersPost openModal={openModal} />;
         <ReportPost modalIsOpen={modalIsOpen} openModal={openModal} closeModal={closeModal} />
      </>
   );
}

export default OthersProfilePosts;
