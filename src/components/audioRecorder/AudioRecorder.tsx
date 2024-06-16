import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import io from "socket.io-client";

const socket = io("http://localhost:7700"); // Connect to your Socket.IO server

const AudioRecorderComponent = () => {
   const [isRecording, setIsRecording] = useState(false);
   const [audioBlob, setAudioBlob] = useState(null);

   const addAudioElement = (blobObject: any) => {
      setAudioBlob(blobObject.blob);
   };

   const sendAudioToServer = () => {
      if (audioBlob) {
         const reader = new FileReader();
         reader.readAsArrayBuffer(audioBlob);
         reader.onloadend = () => {
            const arrayBuffer = reader.result;
            socket.emit("audioData", arrayBuffer);
         };
      }
   };

   return (
      <div className="mt-5 ml-2 p-0">
         <AudioRecorder
            onRecordingComplete={addAudioElement}
            audioTrackConstraints={{
               noiseSuppression: true,
               echoCancellation: true,
            }}
            downloadOnSavePress={true}
            downloadFileExtension="webm"
         />
         <button onClick={() => setIsRecording(!isRecording)}>{isRecording ? "Stop Recording" : ""}</button>
         {!isRecording && audioBlob && <button onClick={sendAudioToServer}>Send Audio to Server</button>}
      </div>
   );
};

export default AudioRecorderComponent;
