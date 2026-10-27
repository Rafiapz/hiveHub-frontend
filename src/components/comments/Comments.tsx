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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => handleCloseModal()}
         />
         <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Comments</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                     {allComments?.length || 0}
                  </span>
               </div>
               <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  onClick={() => handleCloseModal()}
               >
                  ✕
               </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
               {allComments && allComments.length > 0 ? (
                  allComments?.map((item: any, i: number) => {
                     return (
                        <div key={item?._id + "comments"} className="relative">
                           {item?.isEditing ? (
                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                                 <div className="flex items-center gap-2 mb-2">
                                    <img
                                       src={item?.userId?.profilePhoto || "https://avatar.iran.liara.run/public"}
                                       alt=""
                                       className="w-7 h-7 rounded-full object-cover"
                                    />
                                    <p className="font-bold text-xs text-slate-800">{item?.userId?.fullName}</p>
                                 </div>
                                 <Formik
                                    initialValues={{ comment: item?.comment }}
                                    onSubmit={(values, actions) => handleEditCommentSubmit(values, actions, item?._id, item?.postId, i)}
                                    validationSchema={commentSchema}
                                 >
                                    <Form className="space-y-2">
                                       <Field
                                          name="comment"
                                          type="text"
                                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                          placeholder="Edit comment..."
                                       />
                                       <div className="flex justify-end gap-2">
                                          <button
                                             type="button"
                                             className="px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                                             onClick={() => {
                                                dispatch(fetchAllCommentsOfPost(item?.postId));
                                                handleOptionsClick(i);
                                             }}
                                          >
                                             Cancel
                                          </button>
                                          <button
                                             type="submit"
                                             className="px-3 py-1 text-xs font-semibold text-white rounded-lg transition-all shadow-xs"
                                             style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                                          >
                                             Save
                                          </button>
                                       </div>
                                       <ErrorMessage className="text-rose-600 text-xs block" name="comment" component="span" />
                                    </Form>
                                 </Formik>
                              </div>
                           ) : (
                              <div className="group relative p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors">
                                 {/* 3-dots options */}
                                 <div className="absolute top-2.5 right-2.5">
                                    <button
                                       onClick={() => handleOptionsClick(i)}
                                       className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                                    >
                                       •••
                                    </button>
                                    {showOptions.index === i && showOptions.status && (
                                       <div className="absolute right-0 top-8 w-28 bg-white border border-slate-100 shadow-xl rounded-xl z-20 py-1 overflow-hidden animate-fade-in text-xs font-medium">
                                          {item?.userId?._id === userId ? (
                                             <>
                                                <button
                                                   onClick={() => handleIsEditing(i)}
                                                   className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                                                >
                                                   ✏️ Edit
                                                </button>
                                                <button
                                                   onClick={() => handleCommentDelete(item?._id, i)}
                                                   className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 transition-colors"
                                                >
                                                   🗑️ Delete
                                                </button>
                                             </>
                                          ) : (
                                             <button
                                                onClick={() => setReplying(true)}
                                                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
                                             >
                                                ↩️ Reply
                                             </button>
                                          )}
                                       </div>
                                    )}
                                 </div>

                                 <div className="flex items-center gap-2.5 mb-1.5">
                                    <img
                                       src={item?.userId?.profilePhoto || "https://avatar.iran.liara.run/public"}
                                       alt=""
                                       className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                                    />
                                    <div>
                                       <p className="font-bold text-xs text-slate-900">{item?.userId?.fullName}</p>
                                       <p className="text-[10px] text-slate-400">{item?.createAt}</p>
                                    </div>
                                 </div>

                                 <p className="text-slate-800 text-sm ml-9 leading-relaxed break-words">{item?.comment}</p>

                                 <div className="flex items-center gap-4 ml-9 mt-2">
                                    <div className="flex items-center gap-1.5">
                                       <HeartIcon commentId={item?._id} />
                                       <span className="text-xs font-semibold text-slate-500">{item?.likes || 0}</span>
                                    </div>

                                    <span className="w-px h-3 bg-slate-200" />

                                    {seeReplies?.status === true && seeReplies?.index === i ? (
                                       <button
                                          className="text-xs text-orange-600 font-semibold hover:underline"
                                          onClick={() => handleCloseSeeReplies(i)}
                                       >
                                          Hide replies
                                       </button>
                                    ) : (
                                       <button
                                          className="text-xs text-slate-500 font-semibold hover:text-slate-800"
                                          onClick={() => handleSeeReplies(item?._id, i)}
                                       >
                                          Replies
                                       </button>
                                    )}
                                 </div>

                                 {replying && (
                                    <div className="mt-3 ml-9">
                                       <Formik
                                          initialValues={{ reply: "" }}
                                          onSubmit={(values, actions) => handleReplyCommentSubmit(values, actions, item?._id, i)}
                                          validationSchema={replyCommentSchema}
                                       >
                                          <Form>
                                             <div className="flex gap-2">
                                                <Field
                                                   name="reply"
                                                   type="text"
                                                   className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
                                                   placeholder="Write a reply..."
                                                />
                                                <button
                                                   type="submit"
                                                   className="px-3 py-1.5 text-xs font-semibold text-white rounded-xl shadow-xs"
                                                   style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                                                >
                                                   <FontAwesomeIcon icon={faPaperPlane} />
                                                </button>
                                             </div>
                                             <ErrorMessage className="text-rose-600 text-xs block mt-1" name="reply" component="span" />
                                          </Form>
                                       </Formik>
                                    </div>
                                 )}

                                 {seeReplies?.status === true && seeReplies?.index === i && (
                                    <div className="mt-2 ml-9">
                                       <Replies />
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     );
                  })
               ) : (
                  <div className="py-8 text-center text-slate-400 text-sm">
                     <p>No comments yet.</p>
                     <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
                  </div>
               )}
            </div>

            {/* Bottom Add Comment Bar */}
            <div className="p-4 border-t border-slate-100 bg-white">
               <Formik initialValues={initialValues} onSubmit={handleCommentSubmit} validationSchema={commentSchema}>
                  <Form>
                     <div className="flex items-center gap-2">
                        <Field
                           name="comment"
                           type="text"
                           className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                           placeholder="Write a comment..."
                        />
                        <button
                           type="submit"
                           className="w-10 h-10 rounded-2xl text-white flex items-center justify-center transition-all hover:opacity-95 shadow-xs flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                           title="Post comment"
                        >
                           <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                        </button>
                     </div>
                     <ErrorMessage className="text-rose-600 text-xs block mt-1.5 px-1" name="comment" component="span" />
                  </Form>
               </Formik>
            </div>
         </div>
      </div>
   );
};

export default Comments;
