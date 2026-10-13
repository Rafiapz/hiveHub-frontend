// import React, { useEffect, useRef, useState } from "react";
// import ReactPlayer from "react-player";
// import io, { Socket } from "socket.io-client";

// const Video: React.FC = () => {
//    //    const socket: Socket = io("http://localhost:7700");

//    useEffect(() => {
//       socket.on("video-upload-success", (fileName: string) => {
//          const url = `http://localhost:7700/posts/${fileName}`;
//          setVideoUrl(url);
//       });

//       return () => {
//          socket.off("video-upload-success");
//       };
//    }, [socket]);

//    useEffect(() => {
//       if (videoUrl && playerRef.current) {
//          playerRef.current.seekTo(0);
//       }
//    }, [videoUrl]);

//    return (

//    );
// };

// export default Video;
