import { FC, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faComment,
  faFileImage,
  faVideo,
  faPaperPlane,
  faSmile,
  faSearch,
  faComments,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import Chat from "./Chat";
import {
  createMessage,
  fetchChats,
} from "../../store/actions/message/messageActions";
import {
  fetchConversations,
  fetchOnlineUsers,
  isUserBlocked,
  unblockOtherUser,
} from "../../service/api";
import NewMessage from "../newMessage/NewMessage";
import EmojiPicker from "emoji-picker-react";
import ReactPlayer from "react-player";
import LoadingButton from "../loading/LoadingButton";
import toast from "react-hot-toast";
import socketService from "../../service/socketService";
import Conversations from "./Conversations";
import { BASE_URL } from "../../utils/endPoint";
import VideoCall from "../videoCall/VideoCall";

const socket = socketService.socket;

const MessageBox: FC = () => {
  const userId: any = useSelector(
    (state: RootState) => state?.user?.user?.userId,
  );
  const [curChat, setCurChat] = useState<any>(null);
  const [conversations, setConversations] = useState<any>([]);
  const [messages, setMessages] = useState<any>([]);
  const scrollRef = useRef<any>();
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState<string>("");
  const [arrivalMessage, setArrivalMessage] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<any>([]);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [emojiOn, setEmojiOn] = useState(false);
  const [image, setImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [_, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [blocked, setBlocked] = useState<any>({ status: false });
  const [direct, setDirect] = useState(false);
  const [remoteUser, setRemoteUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const childRef = useRef<any>();

  const handleClickVideoCall = () => {
    if (childRef.current) {
      childRef.current.callPeer(remoteUser);
    }
  };

  const handleVideoChange = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  useEffect(() => {
    const handleImageEvent = (data: any) => {
      setArrivalMessage({
        createdAt: Date.now(),
        senderId: data?.senderId,
        image: data?.data,
      });
    };
    socket.on("image", handleImageEvent);
    return () => {
      socket.off("image", handleImageEvent);
    };
  }, [socket]);

  const onEmojiClick = (event: any) => {
    let sym = event.unified.split("-");
    let codesArray: any = [];
    sym.forEach((el: any) => codesArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codesArray);
    setMessage((prev) => prev + emoji);
  };

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const clearVideo = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    const recieveMessageEvent = (data: any) => {
      setArrivalMessage({
        message: data?.message,
        createdAt: Date.now(),
        senderId: data?.senderId,
      });
    };
    socket.on("recieveMessage", recieveMessageEvent);
    return () => {
      socket.off("recieveMessage", recieveMessageEvent);
    };
  }, [socket]);

  useEffect(() => {
    if (
      curChat?.members[0]?._id === arrivalMessage?.senderId ||
      curChat?.members[1]?._id === arrivalMessage?.senderId
    ) {
      setMessages((prev: any) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    handleFetchConversations();
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    handlefetchOnline();
  }, []);

  const handlefetchOnline = async () => {
    try {
      const response = await fetchOnlineUsers();
      setOnlineUsers(response?.data?.data || []);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleSelectConversation = (chat: any) => {
    setCurChat(chat);
    const id =
      chat?.members[0]?._id !== userId
        ? chat?.members[0]?._id
        : chat?.members[1]?._id;

    setRemoteUser(id);

    dispatch(fetchChats(chat?._id))
      .then((response) => {
        setMessages(response?.payload?.data || []);
      })
      .then(() => {
        const target = chat?.members?.filter((ob: any) => ob?._id != userId);
        isUserBlocked(userId, target[0]?._id).then((result: any) => {
          if (result?.data?.data === "blockedByMe") {
            setBlocked({ status: true, byHim: false });
          } else if (result?.data?.data === "blockedByHim") {
            setBlocked({ status: true, byHim: true });
          } else {
            setBlocked({ status: false });
          }
        });
      });
  };

  const handleSubmit = (event?: any) => {
    if (event) event.preventDefault();
    if (!message.trim() && !image && !selectedFile) {
      toast.error("Message cannot be empty");
      return;
    }
    setLoading(true);
    let receiverId: any;
    const form = new FormData();
    let type = "message";

    if (curChat?.members[0]._id === userId) {
      receiverId = curChat.members[1]._id;
    } else {
      receiverId = curChat.members[0]._id;
    }

    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = () => {
        const fileData = reader.result;
        socket.emit("image", { data: fileData, senderId: userId, receiverId });
      };
      form.append("image", image);
      type = "image";
      clearImage();
    }

    if (selectedFile) {
      const chunkSize = 64 * 1024;
      const fileReader = new FileReader();
      let offset = 0;

      fileReader.addEventListener("error", (event) => {
        console.error("Error reading file:", event);
      });

      fileReader.addEventListener("load", (event) => {
        if (event.target?.readyState === FileReader.DONE) {
          const chunk = event.target.result as ArrayBuffer;
          socket.emit("video-chunk", { chunk, offset });
          offset += chunk.byteLength;
          setProgress((offset / selectedFile.size) * 100);
          sendNextChunk();
        }
      });

      const sendNextChunk = () => {
        if (offset < selectedFile.size) {
          const chunk = selectedFile.slice(offset, offset + chunkSize);
          fileReader.readAsArrayBuffer(chunk);
        } else {
          socket.emit("video-transfer-complete", {
            senderId: userId,
            receiverId,
            conversationId: curChat?._id,
          });
          setProgress(100);
          setSelectedFile(null);
        }
      };

      sendNextChunk();
      return;
    }

    if (message) {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId,
        message,
      });

      setMessage("");
    }

    form.append("message", message);
    form.append("senderId", userId || "");
    form.append("conversationId", curChat?._id);

    if (!form.get("message") && !form.get("image")) {
      setLoading(false);
      return;
    }
    dispatch(createMessage({ form, type })).then((response) => {
      if (response?.payload?.status === "ok") {
        fetchConversations(userId || "").then((res: any) => {
          setConversations(res?.data?.conversations);
        });
        dispatch(fetchChats(curChat?._id))
          .then((res: any) => {
            setMessages(res?.payload?.data);
          })
          .catch(() => {
            toast.error("Failed to send");
          });
      }
    });
    setLoading(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleFetchConversations = () => {
    fetchConversations(userId || "").then((response: any) => {
      setConversations(response?.data?.conversations || []);
    });
  };

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const videoUploadSuccessEvent = (data: any) => {
      const url = `${BASE_URL}/posts/${data?.fileName}`;
      setVideoUrl(url);
      setArrivalMessage({
        createdAt: Date.now(),
        senderId: data?.senderId,
        video: url,
      });
    };
    socket.on("video-upload-success", videoUploadSuccessEvent);

    return () => {
      socket.off("video-upload-success", videoUploadSuccessEvent);
    };
  }, [socket]);

  useEffect(() => {
    const uploadCompleteEvent = (data: any) => {
      fetchConversations(userId || "").then((response: any) => {
        setConversations(response?.data?.conversations);
      });
      dispatch(fetchChats(data?.conversationId)).then((response: any) => {
        setMessages(response?.payload?.data);
        setLoading(false);
      });
    };
    socket.on("upload-comepleted", uploadCompleteEvent);
    setLoading(false);

    return () => {
      socket.off("upload-comepleted", uploadCompleteEvent);
    };
  }, [socket]);

  useEffect(() => {
    const failedEvent = () => {
      toast("Failed to upload video");
    };
    socket.on("failed to upload", failedEvent);
    setLoading(false);
    return () => {
      socket.off("failed to upload", failedEvent);
    };
  }, [socket]);

  useEffect(() => {
    if (videoUrl && playerRef.current) {
      playerRef.current.seekTo(0);
    }
  }, [videoUrl]);

  const handleTyping = () => {
    let receiverId: any;
    if (curChat?.members[0]._id === userId) {
      receiverId = curChat.members[1]._id;
    } else {
      receiverId = curChat.members[0]._id;
    }
    socket.emit("typing", {
      senderId: userId,
      receiverId,
      message,
    });
  };

  useEffect(() => {
    const typingEvent = () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    };
    socket.on("typing", typingEvent);
    return () => {
      socket.off("typing", typingEvent);
    };
  }, [socket]);

  const handleUnblockUser = async () => {
    try {
      const form = new FormData();
      form.append("userId", userId);
      const target = curChat?.members?.filter((ob: any) => ob?._id != userId);
      form.append("targetUserId", target[0]?._id);

      const response = await unblockOtherUser(form);
      dispatch(fetchChats(curChat?._id))
        .then((res) => {
          setMessages(res?.payload?.data);
        })
        .then(() => {
          const targetMember = curChat?.members?.filter(
            (ob: any) => ob?._id != userId,
          );
          isUserBlocked(userId, targetMember[0]?._id).then((result) => {
            if (result?.data?.data === "blocked") {
              setBlocked({ status: true, byHim: false });
            } else {
              setBlocked({ status: false });
            }
          });
        });
      toast.success(response?.data?.message || "User unblocked");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const partner = curChat
    ? curChat.members[1]?._id !== userId
      ? curChat.members[1]
      : curChat.members[0]
    : null;

  const isPartnerOnline = partner && onlineUsers.includes(partner?._id);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-100 p-2 sm:p-4">
      <div className="w-full h-full flex overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        {/* LEFT PANE: Conversation list & search */}
        <div
          className={`${
            direct ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 flex-col h-full border-r border-slate-200/80 bg-white`}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Messages
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                {conversations?.length || 0}
              </span>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all"
            >
              <FontAwesomeIcon icon={faComment} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Search conversation bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex items-center">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 text-slate-400 text-xs"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto">
            <Conversations
              conversations={conversations}
              handleSelectConversation={handleSelectConversation}
              setDirect={setDirect}
              curChatId={curChat?._id}
              userId={userId}
              onlineUsers={onlineUsers}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* RIGHT PANE: Chat window or empty placeholder */}
        <div
          className={`${
            !direct ? "hidden md:flex" : "flex"
          } flex-1 flex-col h-full bg-slate-50/50 overflow-hidden relative`}
        >
          {curChat ? (
            <div className="flex flex-col h-full w-full">
              {/* Chat Header */}
              <div className="h-16 px-4 md:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-xs z-10 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setDirect(false)}
                    className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all mr-1"
                    aria-label="Back to conversations"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>

                  <div className="relative flex-shrink-0">
                    <img
                      src={partner?.profilePhoto || "/placeholder-avatar.png"}
                      alt={partner?.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                      onError={(e: any) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          partner?.fullName || "User",
                        )}&background=F97316&color=fff`;
                      }}
                    />
                    {isPartnerOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                      {partner?.fullName || "HiveHub User"}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      {typing ? (
                        <span className="text-orange-500 font-medium flex items-center gap-1">
                          Typing
                          <span className="inline-flex gap-0.5">
                            <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-orange-500 rounded-full animate-bounce" />
                          </span>
                        </span>
                      ) : isPartnerOnline ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active now
                        </span>
                      ) : (
                        <span className="text-slate-400">Offline</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions (Video call) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClickVideoCall}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium text-xs border border-orange-200/80 transition-all shadow-xs"
                    title="Start Video Call"
                  >
                    <FontAwesomeIcon icon={faVideo} className="text-xs" />
                    <span className="hidden sm:inline">Video Call</span>
                  </button>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3 bg-slate-50/50">
                {messages && messages.length > 0 ? (
                  messages.map((ob: any, i: number) => (
                    <div key={i + "message"} ref={scrollRef}>
                      <Chat
                        message={ob}
                        own={ob?.senderId === userId}
                        playerRef={playerRef}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center mb-3">
                      <FontAwesomeIcon icon={faComment} className="text-xl" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      No messages here yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Send a greeting to start the conversation!
                    </p>
                  </div>
                )}
              </div>

              {/* Media Attachment Previews */}
              {(imagePreview || selectedFile) && (
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-3">
                  {imagePreview && (
                    <div className="relative group inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] shadow hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="relative flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700">
                      <FontAwesomeIcon
                        icon={faVideo}
                        className="text-orange-500"
                      />
                      <span className="max-w-[150px] truncate">
                        {selectedFile.name}
                      </span>
                      <button
                        onClick={clearVideo}
                        className="ml-1 text-slate-400 hover:text-red-500 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Blocked Alert Banner or Message Composer */}
              {blocked?.status === true ? (
                <div className="p-4 bg-red-50/80 border-t border-red-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-sm" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-900">
                        {blocked?.byHim === false
                          ? "You blocked this user"
                          : "Conversation unavailable"}
                      </h4>
                      <p className="text-xs text-red-600">
                        {blocked?.byHim === false
                          ? "You cannot send messages until you unblock this user."
                          : "This user has blocked you. You cannot send messages."}
                      </p>
                    </div>
                  </div>
                  {blocked?.byHim === false && (
                    <button
                      onClick={handleUnblockUser}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex-shrink-0"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
                  {/* Emoji Picker Popup */}
                  {emojiOn && (
                    <div className="absolute bottom-16 left-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}

                  {/* Emoji Toggle */}
                  <button
                    type="button"
                    onClick={() => setEmojiOn(!emojiOn)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors ${
                      emojiOn
                        ? "bg-orange-100 text-orange-600"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title="Insert emoji"
                  >
                    <FontAwesomeIcon icon={faSmile} />
                  </button>

                  {/* Image Upload Button */}
                  <label
                    htmlFor="image-upload"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                    title="Attach photo"
                  >
                    <FontAwesomeIcon icon={faFileImage} className="text-sm" />
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {/* Video Upload Button */}
                  <label
                    htmlFor="video-upload"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                    title="Attach video"
                  >
                    <FontAwesomeIcon icon={faVideo} className="text-sm" />
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />

                  {/* Message Input Field */}
                  <input
                    type="text"
                    className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />

                  {/* Send Button */}
                  {loading ? (
                    <LoadingButton />
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() && !image && !selectedFile}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center gap-1.5 transition-all flex-shrink-0"
                    >
                      <span>Send</span>
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        className="text-[11px]"
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Empty state on desktop when no conversation selected */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/30">
              <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5 shadow-sm">
                <FontAwesomeIcon icon={faComments} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Messages
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-2 mb-6">
                Send private messages, share photos & videos, or start real-time
                video calls with your hive.
              </p>
              <button
                onClick={openModal}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faComment} />
                <span>Start New Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Message User Search Modal */}
      <NewMessage
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        handleFetchConversations={handleFetchConversations}
        handleSelectConversation={(c: any) => {
          handleSelectConversation(c);
          setDirect(true);
        }}
        conversations={conversations}
        onlineUsers={onlineUsers}
      />

      {/* Video Calling Peer Reference */}
      <VideoCall ref={childRef} remoteUser={remoteUser} />
    </div>
  );
};

export default MessageBox;
