import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Upload, Eraser, Check, FileImage } from 'lucide-react';
import { Modal } from './Modal';

export const SignaturePadModal = ({
  isOpen,
  onClose,
  onConfirmSignature,
  title = 'Provide Signature',
  description = 'Draw your signature or upload an image file.',
  defaultSignatureUrl = null,
}) => {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' | 'upload' | 'saved'
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const canvasRef = useRef(null);

  // Initialize canvas
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#2563eb';
    }
  }, [isOpen, activeTab]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG, JPG, etc.)');
        return;
      }
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'draw') {
      if (!hasDrawn) {
        alert('Please draw your signature before confirming.');
        return;
      }
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      onConfirmSignature({ type: 'base64', data: dataUrl });
      onClose();
    } else if (activeTab === 'upload') {
      if (!uploadedPreview) {
        alert('Please select a signature image to upload.');
        return;
      }
      onConfirmSignature({ type: 'file', file: uploadedFile, data: uploadedPreview });
      onClose();
    } else if (activeTab === 'saved') {
      if (!defaultSignatureUrl) {
        alert('No saved signature found.');
        return;
      }
      onConfirmSignature({ type: 'url', url: defaultSignatureUrl });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {description}
        </p>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'draw' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'draw' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <PenTool size={15} /> Draw Signature
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'upload' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'upload' ? '#ffffff' : 'var(--text-secondary)',
            }}
          >
            <Upload size={15} /> Upload Image
          </button>

          {defaultSignatureUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'saved' ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === 'saved' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <FileImage size={15} /> Saved Signature
            </button>
          )}
        </div>

        {/* DRAW TAB */}
        {activeTab === 'draw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div
              style={{
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                position: 'relative',
                touchAction: 'none',
                overflow: 'hidden',
              }}
            >
              <canvas
                ref={canvasRef}
                width={450}
                height={160}
                style={{ width: '100%', height: '160px', display: 'block', cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '8px',
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                  fontFamily: 'monospace',
                }}
              >
                Sign within the box
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearCanvas}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
              >
                <Eraser size={14} /> Clear Canvas
              </button>
            </div>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <Upload size={30} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to browse signature image</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, or SVG up to 5MB</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            {uploadedPreview && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxHeight: '120px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={uploadedPreview}
                  alt="Uploaded signature preview"
                  style={{ maxHeight: '100px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && defaultSignatureUrl && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Use your registered profile signature:
            </p>
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <img
                src={defaultSignatureUrl}
                alt="Registered Signature"
                style={{ maxHeight: '70px', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1rem',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            <Check size={16} /> Confirm Signature
          </button>
        </div>
      </div>
    </Modal>
  );
};
