import { useState, useRef, useEffect, FC, forwardRef, useImperativeHandle } from "react";
import Peer from "peerjs";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import socketService from "../../service/socketService";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { fetchPeerId } from "../../service/api";
import toast from "react-hot-toast";
import { handleVideoCallModal } from "../../store/slices/messages/messagesSlice";
import Modal from "react-modal";

const socket = socketService.socket;

const VideoCall: FC<any> = forwardRef((__, ref) => {
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);
   const [_, setPeerId] = useState("");
   const [incomingCall, setIncomingCall] = useState<any>(null);
   const [callAccepted, setCallAccepted] = useState(false);
   const remoteVideoRef = useRef<HTMLVideoElement>(null);
   const currentUserVideoRef = useRef<HTMLVideoElement | null>(null);
   const peerInstance = useRef<any>(null);
   const [calling, setCalling] = useState(false);
   const [remotePeer, setRemotePeer] = useState<any>(null);

   const modalIsOpen = useSelector((state: RootState) => state.messages.videoCall);

   useEffect(() => {
      const peer = new Peer();

      peer.on("open", (id) => {
         setPeerId(id);
         socket.emit("peer-connection", { id, userId });
      });

      peer.on("call", (call) => {
         setIncomingCall(call);
         openModal();
         setTimeout(() => {
            declineCall();
         }, 25000);
      });

      peerInstance.current = peer;
   }, []);

   const dispatch = useDispatch<AppDispatch>();

   const answerCall = () => {
      navigator.mediaDevices
         .getUserMedia({ video: true, audio: true })
         .then((stream) => {
            if (currentUserVideoRef.current) {
               currentUserVideoRef.current.srcObject = stream;

               currentUserVideoRef.current.play().catch((error) => {
                  console.error("Error playing local stream:", error);
               });
               if (incomingCall) incomingCall.answer(stream);
               incomingCall.on("stream", (remoteStream: any) => {
                  if (remoteVideoRef.current) {
                     remoteVideoRef.current.srcObject = remoteStream;
                     remoteVideoRef.current.play().catch((error) => {
                        console.error("Error playing remote stream:", error);
                     });
                     console.log(incomingCall);
                     setRemotePeer(incomingCall?.peer);

                     setIncomingCall(null);
                     setCallAccepted(true);
                  }
               });
            }
         })
         .catch((err) => {
            console.error("Failed to get local stream", err);
         });
   };

   useImperativeHandle(
      ref,
      () => {
         return {
            async callPeer(remoteUser: any) {
               fetchPeerId(remoteUser)
                  .then((response) => {
                     const remotePeerId = response.data.data.peerId;
                     setRemotePeer(remotePeerId);
                     if (remotePeerId === undefined) {
                        throw new Error("Unable to connect");
                     }
                     setCalling(true);
                     openModal();

                     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
                        if (currentUserVideoRef.current) {
                           currentUserVideoRef.current.srcObject = stream;
                           currentUserVideoRef.current.play().catch((error) => {
                              console.error("Error playing local stream:", error);
                           });

                           const call = peerInstance.current.call(remotePeerId, stream);
                           call.on("stream", (remoteStream: any) => {
                              if (remoteVideoRef.current) {
                                 remoteVideoRef.current.srcObject = remoteStream;
                                 remoteVideoRef.current.play().catch((error) => {
                                    console.error("Error playing remote stream:", error);
                                 });
                                 setCallAccepted(true);
                              }
                           });
                        }
                     });
                  })
                  .catch((err) => {
                     console.error("Failed to get local stream", err);
                     toast.error("The person is not online");
                  });
            },
         };
      },
      []
   );

   useEffect(() => {
      socket.on("call-rejected", () => {
         if (currentUserVideoRef.current) {
            const mediaStream = currentUserVideoRef.current.srcObject as MediaStream;

            if (mediaStream && mediaStream.getTracks) {
               mediaStream.getTracks().forEach((track) => track.stop());
               setCalling(false);
               window.location.reload();
            }

            currentUserVideoRef.current.srcObject = null;
         }

         currentUserVideoRef.current = null;
      });
   }, [socket]);

   useEffect(() => {
      socket.on("call-ended", () => {
         if (currentUserVideoRef.current) {
            const mediaStream = currentUserVideoRef.current.srcObject as MediaStream;

            if (mediaStream && mediaStream.getTracks) {
               mediaStream.getTracks().forEach((track) => track.stop());
               setCalling(false);
               window.location.reload();
            }
            currentUserVideoRef.current.srcObject = null;
         }
         currentUserVideoRef.current = null;
      });
   }, [socket]);

   const declineCall = () => {
      incomingCall.close();
      setIncomingCall(null);
      setCallAccepted(false);
      setCalling(false);
      socket.emit("reject-call", incomingCall?.peer);
      closeModal();
   };

   const endCall = () => {
      peerInstance.current.destroy();
      window.location.reload();
      console.log(incomingCall);

      setCalling(false);
      closeModal();
      socket.emit("end-call", remotePeer);
   };

   const declineOutGoingCall = () => {
      console.log("declineedd");

      peerInstance.current.destroy();
      window.location.reload();
      setCalling(false);
      closeModal();
   };

   const openModal = () => {
      dispatch(handleVideoCallModal({ status: true }));
   };
   const closeModal = () => {
      dispatch(handleVideoCallModal({ status: false }));
   };

   return (
      <Modal
         appElement={document.getElementById("root") as HTMLElement}
         overlayClassName="modal-bg-overlay fixed inset-0 z-50 flex items-center justify-center"
         className="bg-none  max-w-2xl w-full mx-auto outline-none border-none relative"
         isOpen={modalIsOpen}
         onRequestClose={closeModal}
         shouldCloseOnOverlayClick={false}
      >
         <div className={`size-full `}>
            {incomingCall && (
               <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                     <p className="text-xl font-bold mb-4 text-center">Incoming Call from:</p>

                     <p className="text-lg text-center text-gray-700 mb-4">Unknown Caller</p>

                     <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                           <svg className="w-8 h-8 text-gray-400" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path
                                 fillRule="evenodd"
                                 d="M10 0a10 10 0 100 20 10 10 0 000-20zM10 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                                 clipRule="evenodd"
                              />
                              <path fillRule="evenodd" d="M10 5a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
                              <path
                                 fillRule="evenodd"
                                 d="M2.905 15.472a7.937 7.937 0 0114.19 0 .375.375 0 01-.655.33 7.187 7.187 0 00-12.88 0 .375.375 0 01-.655-.33z"
                                 clipRule="evenodd"
                              />
                           </svg>
                        </div>
                     </div>

                     <div className="flex justify-center space-x-4">
                        <button className="bg-green-500 text-white p-4 rounded-full shadow-md" onClick={answerCall}>
                           <FaPhone size={24} />
                        </button>
                        <button className="bg-red-500 text-white p-4 rounded-full shadow-md" onClick={declineCall}>
                           <FaPhoneSlash size={24} />
                        </button>
                     </div>
                  </div>
               </div>
            )}

            <div className="relative ">
               <video
                  ref={currentUserVideoRef}
                  muted
                  autoPlay
                  className={!callAccepted ? "absolute size-full top-0 left-0" : `w-28 absolute top-6 right-2 border-2 border-white rounded`}
               />
               {!callAccepted && calling && (
                  <button
                     className="absolute bottom-8 left-1/2 z-20 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-full"
                     onClick={declineOutGoingCall}
                  >
                     <FaPhoneSlash size={24} />
                  </button>
               )}

               <video ref={remoteVideoRef} autoPlay className="size-full max-w-2xl rounded" />
               {callAccepted && (
                  <button className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-full" onClick={endCall}>
                     <FaPhoneSlash size={24} />
                  </button>
               )}
            </div>
         </div>
      </Modal>
   );
});

export default VideoCall;
