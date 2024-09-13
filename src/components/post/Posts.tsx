import { FC } from "react";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faShare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { deletePostAction, fetchAllCommentsOfPost, fetchAllposts, fetchUsersPost, likePostAction } from "../../store/actions/post/postActions";
import Loading from "../loading/Loading";
import toast from "react-hot-toast";
import ConfirmationModal from "../modal/ConfirmationModal";
import { confirmationModalReducer } from "../../store/slices/user/userSlice";
import { handleCommentModal, handleEditPostModal, handleReportPostId, setSharePost } from "../../store/slices/posts/postSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "timeago.js";
import InfiniteScroll from "react-infinite-scroll-component";
import EditPostModal from "../modal/EditPostModal";
import PostLikesModal from "../modal/PostLikesModal";
import socketService from "../../service/socketService";
import ConnectButton from "../connectButton/ConnectButton";

const socket = socketService.socket;

const Posts: FC<any> = ({ openModal, openSharePostModal }: any) => {
   const dispatch = useDispatch<AppDispatch>();
   const userId = useSelector((state: RootState) => state.user.user.userId);
   const [curPostId, setCurPostId] = useState<number | null>();
   const [hasMore] = useState<boolean>(true);
   const likes: any = useSelector((state: RootState) => state?.posts?.posts?.likes);
   const posts: any = useSelector((state: RootState) => state.posts.posts.data);
   const [page, setPage] = useState<number>(1);
   const [items, setItems] = useState<any>(posts);
   const [likesModal, setLikesModal] = useState<boolean>(false);
   const [curLikesCount, setCurLikesCount] = useState<number | null>(null);
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);
   const networks: any = useSelector((state: RootState) => state?.networks?.network?.data);

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

   const navigate = useNavigate();

   const isFollowing = (id: any) => {
      return networks?.some((ob: any) => {
         return id == ob?.targetUserId && ob?.sourceUserId === userId;
      });
   };

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
   };

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
      dispatch(likePostAction(id)).then((response) => {
         if (pathname === "/profile") {
            dispatch(fetchUsersPost(userId));
         } else {
            const post = response?.payload?.post;
            dispatch(fetchAllposts({ page })).then(() => {
               setItems((prev: any) => {
                  const newItems = prev.map((item: any) => {
                     if (item._id === id) {
                        return { ...item, likes: post.likes };
                     }
                     return item;
                  });
                  return newItems;
               });

               if (response?.payload?.message === "Succesfully liked post") {
                  socket.emit("sendNotification", {
                     senderId: userId,
                     receiverId: response?.payload?.post?.userId?._id,
                     notification: "Liked your post",
                     postId: id,
                     actionBy: userData?.fullName,
                  });
               }
            });
         }
      });
   };

   const setClass = (itemId: any) => {
      return likes.some((ob: any) => ob.postId === itemId && ob.userId === userId);
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
      openSharePostModal();
   };

   const fetchMore = () => {
      dispatch(fetchAllposts({ page: page + 1 }))
         .then((response: any) => {
            setPage(page + 1);
            if (response?.payload?.data?.posts?.length >= 1) {
               setItems((prev: any) => [...prev, ...response.payload?.data?.posts]);
            } else {
               setPage(1);
               dispatch(fetchAllposts({ page: 1 })).then((res) => {
                  setItems((prev: any) => [...prev, ...res.payload?.data?.posts]);
               });
            }
         })
         .catch(() => {
            toast.error("error");
         });
   };

   const closeLikesModal = () => {
      setLikesModal(false);
   };

   return (
      <>
         <div className="flex flex-col items-center overflow-hidden">
            <InfiniteScroll
               dataLength={items?.length}
               next={() => fetchMore()}
               hasMore={hasMore}
               loader={
                  <div
                     className=" g-white  w-full sm:w-[800px]  border border-gray-300  p-6 sm:p-8 rounded-lg shadow-md mx-auto mt-2 hover:shadow-lg transition-shadow duration-300"
                     key={46597}
                  >
                     <Loading />
                  </div>
               }
            >
               {items?.map((item: any, i: number) => {
                  return (
                     <div
                        key={item?._id + i}
                        className="bg-white  w-full sm:w-[800px]  border border-gray-300  p-6 sm:p-8 rounded-lg shadow-md mx-auto mt-2 hover:shadow-lg transition-shadow duration-300 "
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
                           <div className="ml-5">
                              {isFollowing(item?.userId?._id) ? (
                                 <button
                                    onClick={() => handleClick(item?.userId?._id, item?.userId?.email)}
                                    className="px-3 py-1 rounded-md text-black font-bold border border-black bg-white hover:bg-gray-200 focus:outline-none transition-colors duration-300"
                                 >
                                    View
                                 </button>
                              ) : (
                                 <>{userId !== item?.userId?._id && <ConnectButton id={item?.userId?._id} content="Follow" />}</>
                              )}
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
                                    {userId !== item?.userId?._id && (
                                       <li
                                          className="p-2 hover:bg-gray-100 cursor-pointer"
                                          onClick={() => {
                                             dispatch(handleReportPostId({ postId: item?._id }));
                                             openModal();
                                          }}
                                       >
                                          Report
                                       </li>
                                    )}
                                 </ul>
                              </div>
                           )}
                        </div>

                        <p className="py-4 text-gray-700">{item?.content}</p>

                        {item?.media?.type === "image" && (
                           <div className="w-full h-full">
                              <img src={`${item?.media?.path}`} alt="Posted" className="mb-4 h-full object-cover rounded-lg w-full" />
                           </div>
                        )}
                        {item?.media?.type === "video" && <video controls src={`${item?.media?.path}`}></video>}

                        <div className="flex justify-between items-center mt-4">
                           <div className="flex items-center">
                              <div className="flex items-center mr-8 cursor-pointer">
                                 <FontAwesomeIcon
                                    key={item?.id}
                                    onClick={() => {
                                       handleLikePost(item?._id);
                                    }}
                                    icon={faHeart}
                                    className={`${
                                       setClass(item?._id) ? "text-red-600" : "text-gray-400"
                                    } mr-2 text-xl hover:text-red-600 transition duration-300`}
                                 />
                                 <p
                                    onClick={() => {
                                       setCurLikesCount(item?.likes);
                                       setCurPostId(item?._id);
                                       setLikesModal(true);
                                    }}
                                 >
                                    {item?.likes}
                                 </p>
                              </div>
                              <div className="flex items-center mr-8 cursor-pointer">
                                 <FontAwesomeIcon
                                    icon={faComment}
                                    className="mr-2 text-blue-500 text-xl hover:text-blue-600 transition duration-300"
                                    onClick={() => {
                                       handleShowComments(item?._id);
                                    }}
                                 />
                                 <p>{item?.comments}</p>
                              </div>
                              <div className="flex items-center mr-8 cursor-pointer" onClick={() => handleSharePost(item)}>
                                 <FontAwesomeIcon
                                    icon={faShare}
                                    className="mr-2 text-yellow-300 text-xl hover:text-green-600 transition duration-300"
                                 />
                                 <p>{item?.shares}</p>
                              </div>
                           </div>

                           {/* <div className="cursor-pointer">
                              <FontAwesomeIcon icon={faBookmark} className="text-gray-500 text-xl hover:text-gray-700 transition duration-300" />
                           </div> */}
                        </div>
                     </div>
                  );
               })}
            </InfiniteScroll>
            <PostLikesModal closeLikesModal={closeLikesModal} likesModal={likesModal} postId={curPostId} likes={curLikesCount} />
         </div>

         <EditPostModal items={items} setItems={setItems} />
         <ConfirmationModal curId={curPostId} handleDelete={handleDelete} />
      </>
   );
};

export default Posts;
