import { useState, useRef, useEffect, FC, forwardRef, useImperativeHandle } from "react";
import Peer from "peerjs";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";
import socketService from "../../service/socketService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchPeerId } from "../../service/api";
import toast from "react-hot-toast";

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

   useEffect(() => {
      const peer = new Peer();

      peer.on("open", (id) => {
         setPeerId(id);
         socket.emit("peer-connection", { id, userId });
      });

      peer.on("call", (call) => {
         setIncomingCall(call);
         setTimeout(() => {
            declineCall();
         }, 5000);
      });

      peerInstance.current = peer;
   }, []);

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
                     if (remotePeerId === undefined) {
                        throw new Error("Unable to connect");
                     }
                     setCalling(true);

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
         console.log("call endeddd");

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
   };

   const endCall = () => {
      peerInstance.current.destroy();
      window.location.reload();
      setCalling(false);
      console.log(peerInstance.current);

      socket.emit("end-call", peerInstance.current._lastServerId);
   };

   const declineOutGoingCall = () => {
      peerInstance.current.destroy();
      window.location.reload();
      setCalling(false);
   };

   return (
      <div className={`flex flex-col items-center w-[500px] h-[500px] absolute top-32 left-1/3 p-4 `}>
         {incomingCall && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
               <div className="bg-white  rounded shadow-lg">
                  <p className="text-xl font-bold mb-4 ml-32">Incoming Call</p>
                  <div className="flex justify-center space-x-4 min-w-96">
                     <button className="bg-green-500 text-white p-2 rounded-full" onClick={answerCall}>
                        <FaPhone size={24} />
                     </button>
                     <button className="bg-red-500 text-white p-2 rounded-full" onClick={declineCall}>
                        <FaPhoneSlash size={24} />
                     </button>
                  </div>
               </div>
            </div>
         )}

         <div className="relative mt-4">
            <video
               ref={currentUserVideoRef}
               muted
               autoPlay
               className={!callAccepted ? "absolute w-[500px] h-[500px] top-0 left-0" : `w-28 absolute top-20 right-2 border-2 border-white rounded`}
            />
            {!callAccepted && calling && (
               <button
                  className="absolute bottom-24 left-1/2 z-50 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-full"
                  onClick={declineOutGoingCall}
               >
                  <FaPhoneSlash size={24} />
               </button>
            )}

            <video ref={remoteVideoRef} autoPlay className="w-[500px] h-[500px] max-w-2xl rounded" />
            {callAccepted && (
               <button className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-full" onClick={endCall}>
                  <FaPhoneSlash size={24} />
               </button>
            )}
         </div>
      </div>
   );
});

export default VideoCall;
