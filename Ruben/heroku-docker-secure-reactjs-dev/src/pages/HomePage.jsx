import * as React from "react";
import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import { Storage } from "@aws-amplify/storage";
import RecordRTC, { invokeSaveAsDialog } from "recordrtc";

import Fab from "@mui/material/Fab";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EditIcon from "@mui/icons-material/Edit";

export default function Home() {
  const [stream, setStream] = useState(null);
  const [blob, setBlob] = useState(null);
  const refVideo = useRef(null);
  const recorderRef = useRef(null);

  const handleRecording = async () => {
    // const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    setStream(mediaStream);

    recorderRef.current = new RecordRTC(mediaStream, {
      type: "video",
    });
    recorderRef.current.startRecording();
  };

  const handleStop = () => {
    recorderRef.current.stopRecording(() => {
      setBlob(recorderRef.current.getBlob());
    });
  };

  const handleSave = async function () {
    // var obj = "{hello: 'world'};";
    // var blob = new Blob([obj], { type: "application/json" });
    // var toString = Object.prototype.toString;
    // toString.call(blob);
    // var file = new File([blob], "name");
    var today = new Date(),
      date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate() +
        "-" +
        today.getMilliseconds();

    Storage.put(date + ".webm", recorderRef.current.getBlob(), {
      level: "public",
      contentType: "application/octet-stream",
      progressCallback: (progress) => {
        console.log(progress);
      },
    });

    const file = await Storage.get(date + ".webm", {
      level: "public",
    });

    let blobs = await fetch(file).then((r) => r.blob());

    setBlob(blobs);
    invokeSaveAsDialog(blobs);
  };

  useEffect(() => {
    if (!refVideo.current) {
      return;
    }

    refVideo.current.srcObject = stream;
  }, [stream, refVideo]);

  return (
    <div className="App">
      <header className="App-header">
        {blob && (
          <video
            src={URL.createObjectURL(blob)}
            controls
            autoPlay
            ref={refVideo}
            style={{ width: "700px", margin: "1em" }}
          />
        )}
        <br></br>
        <button onClick={handleRecording}>start</button>
        <button onClick={handleStop}>stop</button>
        <button onClick={handleSave}>save</button>
      </header>
      <footer>
        <Box sx={{ "& > :not(style)": { m: 1 } }} style={fabStyle.btn1}>
          <Fab color="primary" aria-label="add">
            <FiberManualRecordIcon onClick={handleRecording} />
          </Fab>
          <Fab color="secondary" aria-label="edit" style={fabStyle}>
            <EditIcon onClick={handleStop} />
          </Fab>
          <Fab variant="extended" style={fabStyle}>
            <EditIcon sx={{ mr: 1 }} onClick={handleSave} F />
            Descargar
          </Fab>
        </Box>
      </footer>
    </div>
  );
}

const fabStyle = {
  btn1: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
};
