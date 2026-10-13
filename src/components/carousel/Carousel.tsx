import { FC, useState } from "react";
import { BsFillArrowRightCircleFill, BsFillArrowLeftCircleFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deleteStory, fetchAllStories } from "../../store/actions/post/postActions";
import toast from "react-hot-toast";

const Carousel: FC<any> = ({ slides, user, closeModal }) => {
   const [current, setCurrent] = useState<number>(0);
   const userId = useSelector((state: RootState) => state?.user?.user?.userId);

   const dispatch = useDispatch<AppDispatch>();

   const previousSlide = () => {
      if (current === 0) setCurrent(slides.length - 1);
      else setCurrent(current - 1);
   };

   const nextSlide = () => {
      if (current === slides.length - 1) setCurrent(0);
      else setCurrent(current + 1);
   };

   const handleDeleteStory = (id: any) => {
      dispatch(deleteStory(id))
         .then((response) => {
            if (response?.payload?.status === "ok") {
               toast.success("Succefully deleted story");
               dispatch(fetchAllStories(userId));
            }
            closeModal();
         })
         .catch((err) => {
            toast.error(err?.response?.data?.message);
         });
   };

   return (
      <div className="overflow-hidden relative">
         <div
            className={`flex transition ease-out duration-40`}
            style={{
               transform: `translateX(-${current * 100}%)`,
            }}
         >
            {slides?.map((s: any) => {
               return <img className="w-full" src={s} />;
            })}
         </div>

         <div className="absolute top-0 h-full w-full   flex text-white px-10 text-xl">
            <button className="text-3xl" onClick={previousSlide}>
               <BsFillArrowLeftCircleFill />
            </button>
            <div className="flex mt-5 min-w-56 ">
               <img className="w-10 h-10 rounded-full mr-2" src={user?.profilePhoto} alt="User Profile" />

               <span>{user?.fullName}</span>
            </div>

            <div style={{ marginLeft: "320px" }} className="">
               {user?.userId === userId && (
                  <button
                     onClick={() => handleDeleteStory(user?.storyId)}
                     className="bg-white hover:bg-white text-red-700 font-semibold mt-5 w-32  rounded-md focus:outline-none"
                  >
                     Delete Story
                  </button>
               )}
               <button className="text-3xl mt-44 ml-20" onClick={nextSlide}>
                  <BsFillArrowRightCircleFill />
               </button>
            </div>
         </div>

         <div className="absolute bottom-0 py-4 flex justify-center gap-3 w-full">
            {slides?.map((_: any, i: number) => {
               return (
                  <div
                     onClick={() => {
                        setCurrent(i);
                     }}
                     key={"circle" + i}
                     className={`rounded-full w-5 h-5 cursor-pointer  ${i == current ? "bg-white" : "bg-gray-500"}`}
                  ></div>
               );
            })}
         </div>
      </div>
   );
};

export default Carousel;
