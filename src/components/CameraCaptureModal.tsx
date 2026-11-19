import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, SwitchCamera, Upload, X } from 'lucide-react';
import { compressCanvasPortrait, compressPortraitImage } from '../lib/cardUtils';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (compressedDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCaptureRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [startingCamera, setStartingCamera] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      stopStream();
      setCameraError(null);
      setStartingCamera(true);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setStartingCamera(false);
        setCameraError(
          'Trình duyệt hiện tại không hỗ trợ mở camera trực tiếp. Bạn có thể bấm nút bên dưới để chụp từ máy ảnh thiết bị hoặc chọn ảnh.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 960 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('NotAllowed') || msg.includes('Permission')) {
          setCameraError(
            'Bạn chưa cấp quyền Camera cho trang web. Hãy cấp quyền hoặc dùng nút "Chụp / Chọn từ thiết bị" bên dưới.'
          );
        } else {
          setCameraError(
            'Không tìm thấy camera khả dụng trên thiết bị. Hãy dùng nút "Chụp / Chọn từ thiết bị" bên dưới.'
          );
        }
      } finally {
        setStartingCamera(false);
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedPreview(null);
      setCameraError(null);
      return;
    }

    if (!capturedPreview) {
      void startCamera(facingMode);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, capturedPreview, startCamera, stopStream]);

  if (!isOpen) return null;

  const handleSnapShot = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    // Crop video center into a crisp 3:4 portrait frame
    const targetAspect = 3 / 4;
    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    const srcAspect = srcW / srcH;

    let cropW = srcW;
    let cropH = srcH;
    let cropX = 0;
    let cropY = 0;

    if (srcAspect > targetAspect) {
      cropW = Math.round(srcH * targetAspect);
      cropX = Math.round((srcW - cropW) / 2);
    } else {
      cropH = Math.round(srcW / targetAspect);
      cropY = Math.round((srcH - cropH) / 2);
    }

    const outW = Math.min(720, cropW);
    const outH = Math.round(outW / targetAspect);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(outW, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    try {
      const compressed = compressCanvasPortrait(canvas);
      stopStream();
      setCapturedPreview(compressed);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Không thể chụp ảnh.');
    }
  };

  const handleNativeFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    setCameraError(null);
    try {
      const compressed = await compressPortraitImage(file);
      stopStream();
      setCapturedPreview(compressed);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Không thể xử lý ảnh.');
    } finally {
      setProcessing(false);
      if (nativeCaptureRef.current) {
        nativeCaptureRef.current.value = '';
      }
    }
  };

  const handleConfirmPhoto = () => {
    if (!capturedPreview) return;
    onCapture(capturedPreview);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2D2926]/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FAF7F0] border border-[#C59B57]/60 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C59B57]/30">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#7A8B74]" />
            <h3 className="font-serif font-semibold text-lg text-[#2D2926]">
              Chụp ảnh chân dung vào Thiệp
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng camera"
            className="p-1 text-[#2D2926]/60 hover:text-[#2D2926] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera / Preview Viewport */}
        <div className="p-5 space-y-4">
          <div className="relative mx-auto w-full max-w-[300px] aspect-[3/4] bg-[#2D2926] border border-[#C59B57]/50 overflow-hidden flex items-center justify-center">
            {capturedPreview ? (
              <img
                src={capturedPreview}
                alt="Ảnh vừa chụp"
                className="w-full h-full object-cover"
              />
            ) : cameraError ? (
              <div className="p-5 text-center text-xs text-[#FAF7F0]/85 leading-relaxed space-y-3">
                <Camera className="w-8 h-8 text-[#C59B57] mx-auto opacity-80" />
                <p>{cameraError}</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />
                {startingCamera && (
                  <div className="absolute inset-0 bg-[#2D2926]/70 flex flex-col items-center justify-center text-[#FAF7F0] text-xs gap-2">
                    <div className="w-6 h-6 border-2 border-[#C59B57] border-t-transparent rounded-full animate-spin" />
                    <span>Đang khởi động camera...</span>
                  </div>
                )}
                {/* Subtle 3:4 Portrait Guide */}
                <div
                  aria-hidden="true"
                  className="absolute inset-4 border border-[#FAF7F0]/35 pointer-events-none"
                />
              </>
            )}
          </div>

          <input
            ref={nativeCaptureRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleNativeFileCapture}
            className="hidden"
          />

          {/* Controls */}
          {capturedPreview ? (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCapturedPreview(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#C59B57]/55 bg-white hover:bg-[#EAE3D5]/50 text-[#2D2926] text-xs font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chụp lại</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#7A8B74] hover:bg-[#667760] text-[#FAF7F0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Dùng ảnh này</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {!cameraError && (
                <>
                  <button
                    type="button"
                    onClick={handleSnapShot}
                    disabled={startingCamera}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7A8B74] hover:bg-[#667760] text-[#FAF7F0] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Chụp ảnh ngay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFacingMode((m) => (m === 'user' ? 'environment' : 'user'))
                    }
                    title="Đổi camera trước/sau"
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-[#C59B57]/50 bg-white hover:bg-[#EAE3D5]/45 text-[#2D2926] text-xs font-medium cursor-pointer"
                  >
                    <SwitchCamera className="w-4 h-4 text-[#AA7C32]" />
                    <span>Đổi góc</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => nativeCaptureRef.current?.click()}
                disabled={processing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#C59B57]/50 bg-white hover:bg-[#EAE3D5]/45 text-[#2D2926] text-xs font-medium cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#7A8B74]" />
                <span>
                  {processing ? 'Đang xử lý...' : 'Chụp / Chọn từ thiết bị'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
