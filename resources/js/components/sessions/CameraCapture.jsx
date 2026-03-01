import React, { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Camera, RotateCcw, Upload, X } from 'lucide-react';

const CameraCapture = ({ isOpen, onClose, onCapture }) => {
    const { videoRef, canvasRef, isActive, error, capturedImage, startCamera, stopCamera, capturePhoto, resetCapture } = useCamera();

    useEffect(() => {
        if (isOpen && !isActive && !capturedImage) {
            startCamera();
        }
        return () => {
            if (!isOpen) stopCamera();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCapture = async () => {
        const file = await capturePhoto();
        if (file) {
            onCapture(file);
        }
    };

    const handleRetake = () => {
        resetCapture();
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
                <h3 className="text-white font-medium">Capture Session Photo</h3>
                <button onClick={() => { stopCamera(); resetCapture(); onClose(); }} className="text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
                {error && (
                    <div className="text-center px-4">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={startCamera} className="px-4 py-2.5 bg-white text-gray-900 rounded-lg font-medium min-h-[44px]">
                            Retry
                        </button>
                    </div>
                )}

                {!error && !capturedImage && (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}

                {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="bg-black/80 px-4 py-6 flex items-center justify-center gap-6">
                {!capturedImage ? (
                    <button onClick={handleCapture} disabled={!isActive} className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 transition-colors">
                        <Camera className="w-7 h-7 text-gray-900" />
                    </button>
                ) : (
                    <>
                        <button onClick={handleRetake} className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white rounded-lg font-medium min-h-[44px]">
                            <RotateCcw className="w-4 h-4" /> Retake
                        </button>
                        <button onClick={() => onClose()} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium min-h-[44px]">
                            <Upload className="w-4 h-4" /> Use Photo
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
