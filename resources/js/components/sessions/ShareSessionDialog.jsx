import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/shared/Modal';
import { Download, Share2, Copy } from 'lucide-react';

const formatDateTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

const ShareSessionDialog = ({ isOpen, onClose, session, photoUrl }) => {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [shareFile, setShareFile] = useState(null);
    const [copied, setCopied] = useState(false);

    const menteeNames = useMemo(() => {
        const names = (session?.participants || []).map(p => p?.mentee?.name).filter(Boolean);
        return names.length ? names.join(', ') : 'Mentee';
    }, [session]);

    const shareText = useMemo(() => {
        const mentorName = session?.mentor?.name || 'Mentor';
        const dt = formatDateTime(session?.started_at);
        return `Mentoring Session\nMentor: ${mentorName}\nMentee: ${menteeNames}\nDate & Time: ${dt}`;
    }, [session, menteeNames]);

    useEffect(() => {
        if (!isOpen) return;
        setBusy(false);
        setError('');
        setCopied(false);
        setShareFile(null);
        if (shareUrl) URL.revokeObjectURL(shareUrl);
        setShareUrl('');
        return () => {
            if (shareUrl) URL.revokeObjectURL(shareUrl);
        };
    }, [isOpen]);

    const generateShareCard = async () => {
        if (!photoUrl) {
            setError('No session photo available to share.');
            return;
        }

        setBusy(true);
        setError('');

        try {
            const res = await fetch(photoUrl, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to load session photo.');
            const blob = await res.blob();
            const dataUrl = await blobToDataUrl(blob);
            const img = await loadImage(dataUrl);

            const width = 1080;
            const height = 1350;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const scale = Math.max(width / img.width, height / img.height);
            const sw = width / scale;
            const sh = height / scale;
            const sx = (img.width - sw) / 2;
            const sy = (img.height - sh) / 2;

            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);

            const grad = ctx.createLinearGradient(0, height * 0.55, 0, height);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.72)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            const pad = 60;
            ctx.fillStyle = 'rgba(255,255,255,0.98)';
            ctx.font = 'bold 54px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
            ctx.fillText('Mentoring Session', pad, height - 260);

            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.font = '36px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

            const mentorName = session?.mentor?.name || 'Mentor';
            const dt = formatDateTime(session?.started_at);

            const lines = [
                `Mentor: ${mentorName}`,
                `Mentee: ${menteeNames}`,
                `Date & Time: ${dt}`,
            ];

            let y = height - 190;
            for (const line of lines) {
                ctx.fillText(line, pad, y);
                y += 52;
            }

            const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
            if (!outBlob) throw new Error('Failed to generate share card.');

            const file = new File([outBlob], `mentoring-session-${session?.ulid || 'share'}.jpg`, { type: 'image/jpeg' });
            const url = URL.createObjectURL(outBlob);

            setShareFile(file);
            setShareUrl(url);
        } catch (e) {
            setError(e?.message || 'Failed to generate share card.');
        } finally {
            setBusy(false);
        }
    };

    const handleShare = async () => {
        if (!shareFile) {
            await generateShareCard();
        }

        if (!shareFile) return;

        try {
            const canShareFiles = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [shareFile] });
            if (canShareFiles && navigator.share) {
                await navigator.share({
                    title: 'Mentoring Session',
                    text: shareText,
                    files: [shareFile],
                });
            } else {
                setError('Sharing is not supported on this device/browser. You can download the image instead.');
            }
        } catch (e) {
            if (e?.name === 'AbortError') return;
            setError('Failed to share. You can download the image instead.');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setError('Failed to copy to clipboard.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Session" maxWidthClass="max-w-xl">
            <div className="space-y-3">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                    {shareUrl ? (
                        <img src={shareUrl} alt="Share card" className="w-full object-cover" />
                    ) : (
                        <div className="p-4 text-sm text-gray-600">
                            Generate a share card image that includes only mentor, mentee, date/time, and the session photo.
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        type="button"
                        onClick={generateShareCard}
                        disabled={busy}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 min-h-[44px]"
                    >
                        {busy ? 'Generating...' : 'Generate Share Card'}
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        disabled={busy}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 min-h-[44px]"
                    >
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 min-h-[44px]"
                    >
                        <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy Text'}
                    </button>
                    <a
                        href={shareUrl || '#'}
                        download
                        onClick={(e) => {
                            if (!shareUrl) e.preventDefault();
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 min-h-[44px]"
                    >
                        <Download className="w-4 h-4" /> Download Image
                    </a>
                </div>

                <div className="text-xs text-gray-500 whitespace-pre-line bg-gray-50 border border-gray-200 rounded-lg p-3">{shareText}</div>
            </div>
        </Modal>
    );
};

export default ShareSessionDialog;
