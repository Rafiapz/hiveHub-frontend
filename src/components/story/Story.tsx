import { FC, useEffect, useState } from "react";
import AddStory from "../addStory/AddStory";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchAllStories, fetchOthersStory, storySeen } from "../../store/actions/post/postActions";
import { setCurrentStory } from "../../store/slices/posts/postSlice";
import "./Story.css";

const Story: FC<any> = ({ setView }: any) => {
   const [modalIsOpen, setModalIsOpen] = useState(false);
   const stories: any = useSelector((state: RootState) => state?.posts?.stories?.data);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const myStories: any = useSelector((state: RootState) => state?.posts?.stories?.myStories);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);

   //const stories = Array.from({ length: 20 });

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(fetchAllStories(userId));
   }, []);

   const closeModal = () => {
      setModalIsOpen(false);
   };

   const handleCurrentStory = (story: any, index: number, myStoryId?: any) => {
      setView(true);

      if (myStoryId) {
         let myStoryIndex;

         stories?.forEach((ob: any, i: number) => {
            if (ob?._id === myStoryId) {
               myStoryIndex = i;
            }
         });

         dispatch(setCurrentStory({ index: myStoryIndex }));
         const form = new FormData();
         form.append("userId", userId);
         form.append("storyId", myStoryId);
         dispatch(storySeen(form)).then(() => {
            dispatch(fetchAllStories(userId));
         });
      } else {
         dispatch(setCurrentStory({ index }));
         const form = new FormData();
         form.append("userId", userId);
         form.append("storyId", story?._id);
         dispatch(storySeen(form)).then(() => {
            dispatch(fetchAllStories(userId));
         });
         dispatch(fetchOthersStory(story?.userId?._id));
      }
   };

   return (
      <div className="flex flex-col md:flex-row items-center sm:justify-center ">
         <div className=" sm:w-[800px] items-center">
            <div className=" flex flex-col md:flex-row mt-12 items-center w-full  justify-center p-4 bg-gray-50">
               <ul className="overflow-scroll flex gap-2 w-screen stories   p-2">
                  <li className="flex flex-col items-center">
                     <div
                        className={`bg-gradient-to-tr h-14 w-14 sm:w-24 sm:h-24 rounded-full  p-1 relative ${
                           myStories?.[0]?.seenBy?.some((ob: any) => ob === userId) || myStories?.length <= 0 || myStories?.[0]?.media.length <= 0
                              ? ""
                              : "from-yellow-500 to-pink-600"
                        }`}
                     >
                        <div className="block bg-white p-1 rounded-full transform transition hover:-rotate-12 duration-300">
                           {myStories?.length <= 0 || myStories?.[0]?.media.length <= 0 ? (
                              <img className="h-10 w-14 sm:w-24 sm:h-20 rounded-full object-cover " src={userData?.profilePhoto} alt="image" />
                           ) : (
                              <img
                                 className="h-10 w-14 sm:w-24 sm:h-20 rounded-full object-cover"
                                 src={myStories?.[0]?.media[0]}
                                 alt="https://i.ibb.co/yhh0Ljy/profile.jp"
                                 onClick={() => handleCurrentStory(myStories?.[0], 0, myStories?.[0]?._id)}
                              />
                           )}
                        </div>

                        <button
                           onClick={() => setModalIsOpen(true)}
                           className="transition duration-500 absolute -z- bottom-0 right-0 bg-blue-700 size-6 md:size-8 rounded-full text-white text-2xl font-semibold border-4 border-white flex justify-center items-center hover:bg-blue-900"
                        >
                           +
                        </button>
                     </div>
                     <p>you</p>
                  </li>
                  <AddStory modalIsOpen={modalIsOpen} closeModal={closeModal} />
                  {stories?.map(
                     (story: any, i: number) =>
                        story?.userId._id !== userId && (
                           <li key={story?._id} className="flex flex-col items-center" onClick={() => handleCurrentStory(story, i)}>
                              <div
                                 className={`bg-gradient-to-tr h-14 w-14 sm:w-24 sm:h-24 rounded-full p-1 ${
                                    story?.seenBy?.some((ob: any) => ob === userId) ? "" : "from-yellow-500 to-pink-600"
                                 }`}
                              >
                                 <div className="bg-white p-1  rounded-full hover:-rotate-12 duration-300">
                                    <img className="h-10 w-14 sm:w-24 sm:h-20 rounded-full object-cover" src={story?.media[0]} alt="image" />
                                 </div>
                              </div>
                              <p className="max-w-14 truncate whitespace-nowrap">{story?.userId?.fullName}</p>
                           </li>
                        )
                  )}
               </ul>
            </div>
         </div>
      </div>
   );
};

export default Story;
