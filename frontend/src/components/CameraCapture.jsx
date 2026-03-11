import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user"
};

// ---------------------------------------------------------------
// CameraCapture
// Props:
//   onCapture(formData) — called with a FormData containing
//                         the captured image under the key "file"
//   buttonLabel         — label for the capture button (optional)
// ---------------------------------------------------------------
const CameraCapture = ({ onCapture, buttonLabel = "Capture" }) => {
  const webcamRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState(null);

  const capture = useCallback(() => {
    setError(null);
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      setError("Could not capture image. Please allow camera access.");
      return;
    }

    setPreview(imageSrc);

    // Convert base64 data URL → Blob → FormData with field name "file"
    // This matches upload.single("file") in verificationRoutes.js
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const formData = new FormData();
        formData.append("file", blob, "capture.jpg");
        onCapture(formData);
      })
      .catch(() => {
        setError("Failed to process image. Please try again.");
      });
  }, [webcamRef, onCapture]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        mirrored={true}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ borderRadius: "8px", width: "100%", maxWidth: "480px" }}
      />

      <button onClick={capture} style={{
        padding: "12px 28px",
        cursor: "pointer",
        background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 600,
        boxShadow: "0 4px 14px rgba(99,102,241,0.30)",
        transition: "all 0.2s ease",
      }}>
        {buttonLabel}
      </button>

      {preview && (
        <div>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#666" }}>Preview:</p>
          <img
            src={preview}
            alt="Captured face"
            style={{ width: "160px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      {error && (
        <p style={{ color: "red", fontSize: "13px" }}>{error}</p>
      )}
    </div>
  );
};

export default CameraCapture;