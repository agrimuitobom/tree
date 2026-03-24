"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  disabled?: boolean;
}

export default function CameraCapture({
  onCapture,
  disabled,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(
    async (facing: "user" | "environment") => {
      try {
        setError(null);
        stopCamera();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsActive(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError(
            "カメラへのアクセスが拒否されました。ブラウザの設定からカメラの権限を許可してください。"
          );
        } else {
          setError("カメラの起動に失敗しました。デバイスにカメラが接続されているか確認してください。");
        }
      }
    },
    [stopCamera]
  );

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];
    onCapture(base64);
    stopCamera();
  }, [onCapture, stopCamera]);

  const toggleFacing = useCallback(() => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (isActive) {
      startCamera(next);
    }
  }, [facingMode, isActive, startCamera]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => startCamera(facingMode)}
        >
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!isActive ? (
        <Button
          size="lg"
          onClick={() => startCamera(facingMode)}
          disabled={disabled}
          className="gap-2"
        >
          <Camera className="h-5 w-5" />
          カメラを起動
        </Button>
      ) : (
        <>
          <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-gray-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/40 text-white hover:bg-black/60"
                onClick={toggleFacing}
              >
                <SwitchCamera className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="bg-black/40 text-white hover:bg-black/60"
                onClick={stopCamera}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleCapture}
            disabled={disabled}
            className="w-full max-w-xs gap-2"
          >
            <Camera className="h-5 w-5" />
            撮影する
          </Button>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
