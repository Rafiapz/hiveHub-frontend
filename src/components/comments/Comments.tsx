import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { handleCommentDeleteReducer, handleCommentModal, handleCommentsIsEditing } from "../../store/slices/posts/postSlice";
import {
   deleteComment,
   editComment,
   fetchAllCommentsOfPost,
   fetchAllReplies,
   fetchAllposts,
   postComment,
} from "../../store/actions/post/postActions";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { commentSchema, replyCommentSchema } from "../../schemas/CommentSchema";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { replyComment } from "../../service/api";
import Replies from "./Replies";
import HeartIcon from "./HeartIcon";
import socketService from "../../service/socketService";
const socket = socketService.socket;

const Comments: FC = () => {
   const isOpen = useSelector((state: RootState) => state.posts.comments.modalIsOpen);
   const dispatch = useDispatch<AppDispatch>();
   const postId: any = useSelector((state: RootState) => state.posts.comments.postId);
   const allComments: any = useSelector((state: RootState) => state.posts.comments.data);
   const userId: any = useSelector((state: RootState) => state.user.user.userId);
   const [replying, setReplying] = useState<boolean>(false);
   const [seeReplies, setSeeReplies] = useState<any>({ status: false, index: null });
   const [showOptions, setShowOptions] = useState<{
      status: boolean;
      index: number;
   }>({ status: false, index: 0 });
   const userData: any = useSelector((state: RootState) => state?.user?.user?.data);

   const initialValues: { comment: string } = {
      comment: "",
   };

   if (!isOpen) {
      document.body.style.overflow = "auto";
      return;
   } else {
      document.body.style.overflow = "hidden";
   }

   const handleCommentSubmit = (values: { comment: string }, { resetForm }: any) => {
      const { comment } = values;

      const formData = new FormData();
      formData.append("comment", comment);

      dispatch(postComment({ formData, postId })).then((response: any) => {
         if (response.payload.status === "ok") {
            dispatch(fetchAllCommentsOfPost(postId));
            dispatch(fetchAllposts({})).then(() => {
               document.body.style.overflow = "hidden";
            });
            socket.emit("sendNotification", {
               senderId: userId,
               receiverId: response?.payload?.data?.postId?.userId,
               notification: "Commented on your post",
               postId,
               actionBy: userData?.fullName,
            });
         }
      });
      resetForm({ values: initialValues });
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

   const handleIsEditing = (index: number) => {
      const updated = allComments.map((ob: any, i: number) => {
         return {
            ...ob,
            isEditing: i === index,
         };
      });

      dispatch(handleCommentsIsEditing(updated));
   };

   const handleEditCommentSubmit = (values: { comment: string }, _: any, commentId: number, postId: number, index: number) => {
      const { comment } = values;

      const formData = new FormData();

      formData.append("comment", comment);

      dispatch(editComment({ formData, commentId })).then((response) => {
         if (response.payload.status === "ok") {
            dispatch(fetchAllCommentsOfPost(postId));
            handleOptionsClick(index);
         }
      });
   };

   const handleCommentDelete = (id: number, index: number) => {
      handleOptionsClick(index);

      dispatch(deleteComment(id)).then((response) => {
         if (response.payload.status === "ok") {
            const updated = allComments.filter((_: any, i: number) => i !== index);
            dispatch(handleCommentDeleteReducer(updated));
            toast(response.payload.message, { style: { backgroundColor: "#4caf50", color: "white" } });
         } else {
            toast(response.payload.message, { style: { backgroundColor: "#ff6347", color: "#eeeeee" } });
         }
      });
   };

   const handleReplyCommentSubmit = async (values: { reply: string }, { resetForm }: any, commentId: any, index: any) => {
      const { reply } = values;

      const formData = new FormData();
      formData.append("content", reply);
      formData.append("userId", userId);
      formData.append("commentId", commentId);

      try {
         const response = await replyComment(formData);

         if (response.data.status === "ok") {
            toast.success("Success");
            setReplying(false);
            handleOptionsClick(index);
            dispatch(fetchAllReplies(commentId));
         }
      } catch (error: any) {
         toast.error(error?.response?.data?.message);
      }

      resetForm({ values: initialValues });
   };

   const handleSeeReplies = (commentId: any, index: number) => {
      setSeeReplies((prev: any) => {
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
      dispatch(fetchAllReplies(commentId));
   };

   const handleCloseSeeReplies = (index: number) => {
      setSeeReplies((prev: any) => {
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

   const handleCloseModal = () => {
      dispatch(handleCommentModal({ status: false }));
      setSeeReplies({});
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
         <div className="fixed inset-0 bg-gray-900 opacity-50"></div>
         <div className="bg-white p-8 rounded-lg z-50 w-full max-w-xl mx-auto relative">
            <button className="absolute top-0 right-0 m-1 text-gray-500 w-20 h-10 focus:outline-none" onClick={() => handleCloseModal()}>
               <i className="fa-regular fa-circle-xmark fa-2x"></i>
            </button>
            <div className="max-w-sm mx-auto mb-4">
               <Formik initialValues={initialValues} onSubmit={handleCommentSubmit} validationSchema={commentSchema}>
                  <Form>
                     <div className="flex">
                        <Field
                           name="comment"
                           type="text"
                           className="w-full px-4 py-2 border border-gray-300 rounded"
                           placeholder="Add a comment..."
                        />
                        <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                           <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                     </div>
                     <ErrorMessage className="text-red-700" name="comment" component="span" />
                  </Form>
               </Formik>
            </div>
            <ul className="list-none p-0 max-h-[300px] overflow-y-auto">
               {allComments?.map((item: any, i: number) => {
                  return (
                     <div key={item?._id + "comments"}>
                        {item?.isEditing ? (
                           <div className="relative mb-4 px-4 pt-2 border border-gray-300 rounded">
                              <div className="max-w-sm mx-auto mb-4">
                                 <div className="flex items-center">
                                    <img src={item?.userId?.profilePhoto} alt="" className="w-8 h-8 rounded-full mr-2" />
                                    <div>
                                       <p className="font-semibold">{item?.userId?.fullName}</p>
                                       <p className="text-sm text-gray-500">{item?.createAt}</p>
                                    </div>
                                 </div>
                                 <br />
                                 <Formik
                                    initialValues={{ comment: item?.comment }}
                                    onSubmit={(values, actions) => handleEditCommentSubmit(values, actions, item?._id, item?.postId, i)}
                                    validationSchema={commentSchema}
                                 >
                                    <Form>
                                       <div className="flex">
                                          <Field
                                             name="comment"
                                             type="text"
                                             className="w-full px-4 py-2 border border-gray-300 rounded"
                                             placeholder="Add a comment..."
                                          />
                                          <div className="flex ml-2 gap-1">
                                             <button
                                                type="button"
                                                className="ml-2 px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                                onClick={() => {
                                                   dispatch(fetchAllCommentsOfPost(item?.postId));
                                                   handleOptionsClick(i);
                                                }}
                                             >
                                                Cancel
                                             </button>
                                             <button type="submit" className="px-2 py-1  bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                                Submit
                                             </button>
                                          </div>
                                       </div>
                                       <ErrorMessage className="text-red-700" name="comment" component="span" />
                                    </Form>
                                 </Formik>
                              </div>
                           </div>
                        ) : (
                           <li key={item?._id} className="relative mb-4 px-4 py-2 rounded">
                              {
                                 <div className="absolute top-0 right-0 mt-2 mr-1">
                                    <div
                                       onClick={() => handleOptionsClick(i)}
                                       className="relative flex flex-col gap-1 hover:bg-gray-200 w-4 h-10 justify-center items-center"
                                    >
                                       <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                       <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                       <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    </div>
                                 </div>
                              }

                              <div className="flex items-center">
                                 <img src={item?.userId?.profilePhoto} alt="" className="w-8 h-8 rounded-full mr-2 object-cover" />
                                 <div>
                                    <p className="font-semibold">{item?.userId?.fullName}</p>
                                    <p className="text-sm text-gray-500">{item?.createAt}</p>
                                 </div>
                              </div>
                              <br />
                              <p className="ml-3 font-sans">{item?.comment}</p>
                              <div className="">
                                 <div className="flex items-center">
                                    <HeartIcon commentId={item?._id} />
                                    <p className="mt-2 ">{item?.likes}</p>
                                    {seeReplies?.status === true && seeReplies?.index === i ? (
                                       <p
                                          className="text-gray-700 px-4 rounded mt-3 hover:text-gray-900 hover:cursor-pointer text-sm"
                                          onClick={() => handleCloseSeeReplies(i)}
                                       >
                                          Hide replies
                                       </p>
                                    ) : (
                                       <p
                                          className="px-4 text-gray-700 mt-3 rounded hover:text-gray-900 hover:cursor-pointer text-sm"
                                          onClick={() => handleSeeReplies(item?._id, i)}
                                       >
                                          See replies
                                       </p>
                                    )}
                                 </div>
                              </div>

                              {showOptions.index === i && showOptions.status && (
                                 <div className="absolute top-1 right-5 w-28 h-22 bg-blue-300 mt-2 mr-4 border border-gray-300 shadow-lg rounded-md">
                                    <ul>
                                       {item?.userId?._id === userId ? (
                                          <>
                                             <li onClick={() => handleIsEditing(i)} className="p-1 hover:bg-blue-500">
                                                <button>Edit</button>
                                             </li>
                                             <li onClick={() => handleCommentDelete(item?._id, i)} className="p-1 hover:bg-blue-500">
                                                <button>Delete</button>
                                             </li>
                                          </>
                                       ) : (
                                          <>
                                             <li
                                                onClick={() => {
                                                   setReplying(true);
                                                }}
                                                className="p-1 hover:bg-blue-500"
                                             >
                                                <button>Reply</button>
                                             </li>
                                          </>
                                       )}
                                    </ul>
                                 </div>
                              )}
                              {replying && (
                                 <div className="max-w-sm mt-2 mx-auto mb-4">
                                    <Formik
                                       initialValues={{ reply: "" }}
                                       onSubmit={(values, actions) => handleReplyCommentSubmit(values, actions, item?._id, i)}
                                       validationSchema={replyCommentSchema}
                                    >
                                       <Form>
                                          <div className="flex">
                                             <Field
                                                name="reply"
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded"
                                                placeholder="Reply to this comment..."
                                             />
                                             <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                             </button>
                                          </div>
                                          <ErrorMessage className="text-red-700" name="reply" component="span" />
                                       </Form>
                                    </Formik>
                                 </div>
                              )}

                              {seeReplies?.status === true && seeReplies?.index === i && <Replies />}
                           </li>
                        )}
                     </div>
                  );
               })}
            </ul>
         </div>
      </div>
   );
};

export default Comments;
