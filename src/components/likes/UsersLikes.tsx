import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
   deletePostAction,
   fetchAllCommentsOfPost,
   fetchAllposts,
   fetchUsersLikedPosts,
   fetchUsersPost,
   likePostAction,
} from "../../store/actions/post/postActions";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import { handleCommentModal, handleEditPostModal, setSharePost } from "../../store/slices/posts/postSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark, faComment, faHeart, faShare } from "@fortawesome/free-solid-svg-icons";
import { format } from "timeago.js";
import ConfirmationModal from "../modal/ConfirmationModal";

const UsersLikes: FC = () => {
   const dispatch = useDispatch<AppDispatch>();
   const likes: any = useSelector((state: RootState) => state?.posts?.likedPosts?.likes);
   const posts: any = useSelector((state: RootState) => state?.posts?.likedPosts?.data);

   const userId = useSelector((state: RootState) => state?.user?.user?.userId);
   const [curPostId, setCurPostId] = useState<number | null>();
   // const [hasMore, setHasMore] = useState<boolean>(true);
   // const likes: any = useSelector((state: RootState) => state?.posts?.posts?.likes);
   // const posts: any = useSelector((state: RootState) => state.posts.posts.data);
   const [page] = useState<number>(1);
   const [_, setItems] = useState<any>(posts);

   useEffect(() => {
      dispatch(fetchUsersLikedPosts());
   }, []);

   // const navigate = useNavigate();

   useEffect(() => {
      dispatch(fetchAllposts({ page })).then((response) => {
         if (response?.payload?.status !== "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
         setItems(response.payload?.data?.posts);
      });
   }, []);

   const [showOptions, setShowOptions] = useState<{
      status: boolean;
      index: number;
   }>({ status: false, index: 0 });

   const { pathname } = useLocation();

   const handleOptionsClick = (index: number) => {
      setShowOptions((prev) => {
         if (index == prev.index) {
            return {
               index: index,
               status: !prev.status,
            };
         } else {
            return {
               index: index,
               status: true,
            };
         }
      });
   };

   const handleDeletePostModal = (id: number) => {
      setCurPostId(id);
      dispatch(confirmationModalReducer({ status: true }));
   };

   const handleDelete = (id: number) => {
      dispatch(confirmationModalReducer({ status: false }));

      dispatch(deletePostAction(id)).then((response) => {
         if (response?.payload?.status === "ok") {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#4caf50", color: "white" },
            });
            if (pathname === "/profile") {
               dispatch(fetchUsersPost(userId));
            } else if (pathname === "/profile/likes") {
               dispatch(fetchUsersLikedPosts());
            } else {
               setItems((prev: any) => {
                  const newItems = prev.filter((item: any) => item._id != id);
                  console.log("length", newItems.length);

                  return newItems;
               });
            }
         } else {
            toast(response?.payload?.message, {
               style: { backgroundColor: "#ff6347", color: "#eeeeee" },
            });
         }
      });
      dispatch(fetchAllposts({ page }));
   };

   const handleLikePost = (id: number) => {
      dispatch(likePostAction(id)).then(() => {
         dispatch(fetchUsersLikedPosts());
      });
   };

   const setClass = (itemId: any) => {
      return likes?.some((ob: any) => ob.postId === itemId && ob.userId === userId);
   };

   const handleShowComments = (id: number) => {
      dispatch(fetchAllCommentsOfPost(id)).then((response) => {
         if (response.payload.status === "ok") {
            dispatch(handleCommentModal({ status: true, postId: id }));
         }
      });
   };

   // const viewOthersProfile = (id: number, email: string) => {
   //    navigate(`/others-profile?userId=${id}&email=${email}`);
   // };

   const handleSharePost = (post: any) => {
      dispatch(setSharePost({ data: post }));
      // openSharePostModal();
   };

   return (
      <div className="flex flex-col items-center overflow-hidden">
         <div className="flex  overflow-hidden">
            <div className="min w-full">
               {posts?.map((item: any, i: number) => {
                  return (
                     <div
                        key={item?._id + i}
                        className="bg-white border  w-full sm:w-[800px] p-6 sm:p-8 rounded-lg shadow-md mx-auto mt-2 hover:shadow-lg transition-shadow duration-300 "
                        onClick={() => setShowOptions({ index: i, status: false })}
                     >
                        <div className=" flex justify-end">
                           <div
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleOptionsClick(i);
                              }}
                              className="flex gap-1 items-center  justify-center w-14 h-6 rounded-full hover:bg-gray-200 cursor-pointer"
                           >
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                           </div>
                        </div>

                        <div className="flex items-center h-10 hover:cursor-pointer">
                           <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                              <img src={item?.userId?.profilePhoto} alt="User" className="w-full h-full object-cover" />
                           </div>
                           <div className="flex items-center">
                              {item?.userId?.premium && (
                                 <svg
                                    className="fill-current mr-2 text-indigo-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    width="16"
                                    height="16"
                                 >
                                    <circle cx="8" cy="8" r="8" fill="" />
                                    <path d="M5.17 8.5L2.14 5.5L3.5 4.17L8.83 9.5L13.17 5.5z" fill="white" />
                                 </svg>
                              )}
                              <div className="flex flex-col">
                                 <p className="font-bold text-gray-800">{item?.userId?.fullName}</p>
                                 <p className="text-sm text-gray-500">{format(item?.createdAt)}</p>
                              </div>
                           </div>
                           {showOptions?.status && showOptions?.index === i && (
                              <div
                                 className={` left-[190px] mt-1 w-28 bg-white border border-gray-400 shadow-lg rounded-md
                                        ${showOptions?.status && showOptions?.index === i ? "block" : "hidden"}
                                        left-[600px] static ml-auto w-auto border-none shadow-none rounded-none
                              `}
                              >
                                 <ul className="py-1 flex md:items-center">
                                    {userId === item?.userId?._id && (
                                       <>
                                          <li
                                             onClick={() =>
                                                dispatch(
                                                   handleEditPostModal({
                                                      status: true,
                                                      content: item?.content,
                                                      media: {
                                                         type: item?.media?.type,
                                                         url: item?.media?.path,
                                                      },
                                                      _id: item?._id,
                                                   })
                                                )
                                             }
                                             className="p-2 hover:bg-gray-100 cursor-pointer md:mr-2"
                                          >
                                             Edit
                                          </li>
                                          <li
                                             onClick={() => handleDeletePostModal(item?._id)}
                                             className="p-2 hover:bg-gray-100 cursor-pointer md:mr-2"
                                          >
                                             Delete
                                          </li>
                                       </>
                                    )}
                                 </ul>
                              </div>
                           )}
                        </div>

                        <p className="p-4 ">{item?.content}</p>

                        {item?.media?.type === "image" && <img src={`${item?.media?.path}`} alt="Posted" className="mb-4 rounded-lg w-full" />}
                        {item?.media?.type === "video" && <video controls src={`${item?.media?.path}`}></video>}

                        <div className="flex justify-between items-center">
                           <div className="flex">
                              <div>
                                 <FontAwesomeIcon
                                    key={item?.id}
                                    onClick={() => {
                                       handleLikePost(item?._id);
                                    }}
                                    icon={faHeart}
                                    className={`${
                                       setClass(item?._id) ? "text-red-600" : "text-gray-400"
                                    }  mr-4 size-7 cursor-pointer text-xl hover:text-red-600 transition duration-300`}
                                 />
                                 <p>{item?.likes}</p>
                              </div>
                              <div>
                                 <FontAwesomeIcon
                                    icon={faComment}
                                    className="mr-4 text-blue-500 size-7 cursor-pointer text-xl hover:text-blue-600 transition duration-300"
                                    onClick={() => {
                                       handleShowComments(item?._id);
                                    }}
                                 />
                                 <p>{item?.comments}</p>
                              </div>
                              <div onClick={() => handleSharePost(item)}>
                                 <FontAwesomeIcon
                                    icon={faShare}
                                    className="mr-4 text-yellow-300 size-7 cursor-pointer text-xl hover:text-green-600 transition duration-300"
                                 />
                                 <p>{item?.shares}</p>
                              </div>
                           </div>

                           <div>
                              <FontAwesomeIcon icon={faBookmark} className="text-gray-500 size-7 cursor-pointer" />
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
            <ConfirmationModal curId={curPostId} handleDelete={handleDelete} />
         </div>
      </div>
   );
};

export default UsersLikes;
