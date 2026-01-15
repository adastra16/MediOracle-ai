import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { FloatingPanel } from '../components/3d/FloatingPanel';
import { PDFDocument3D, SourceSnippet3D } from '../components/3d/PDFVisualization';
import { gsap } from 'gsap';

export function QueryScene3D({ 
  onQuerySubmit, 
  onFileUpload,
  uploadedFile,
  queryResult,
  loading 
}) {
  const [query, setQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const queryPanelRef = useRef();
  const pdfRef = useRef();
  const resultRef = useRef();

  // Animate panels in
  useFrame(() => {
    if (queryPanelRef.current && !uploadedFile) {
      queryPanelRef.current.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    if (pdfRef.current && uploadedFile) {
      pdfRef.current.position.x = -3 + Math.sin(Date.now() * 0.0008) * 0.2;
    }
    if (resultRef.current && queryResult) {
      resultRef.current.position.y = -1.5 + Math.sin(Date.now() * 0.0006) * 0.1;
    }
  });

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
      // Animate PDF in
      if (pdfRef.current) {
        gsap.fromTo(pdfRef.current.scale, 
          { x: 0, y: 0, z: 0 },
          { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );
      }
    }
  };

  const handleSubmit = () => {
    if (query.trim() && uploadedFile) {
      onQuerySubmit(query);
      // Animate result in
      if (resultRef.current) {
        gsap.fromTo(resultRef.current.scale,
          { x: 0, y: 0, z: 0 },
          { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power2.out' }
        );
      }
    }
  };

  return (
    <>
      {/* PDF Upload Panel */}
      {!uploadedFile && (
        <group ref={queryPanelRef}>
          <FloatingPanel
            position={[0, 1, 0]}
            width={5}
            height={4}
            glowColor="#ff79c6"
          >
            <Html
              position={[0, 0.5, 0]}
              transform
              style={{ width: '500px', pointerEvents: 'auto' }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  handleFileUpload(file);
                }}
                style={{
                  width: '100%',
                  height: '300px',
                  border: `2px dashed ${dragActive ? '#ff79c6' : '#ffb3d9'}`,
                  borderRadius: '12px',
                  background: dragActive ? 'rgba(255, 121, 198, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf';
                  input.onchange = (e) => handleFileUpload(e.target.files[0]);
                  input.click();
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                <div style={{ color: '#2d1f3d', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Drag & Drop PDF Here
                </div>
                <div style={{ color: '#6b5b7a', fontSize: '14px' }}>or click to browse</div>
              </div>
            </Html>
          </FloatingPanel>
        </group>
      )}

      {/* Uploaded PDF Visualization */}
      {uploadedFile && (
        <group ref={pdfRef}>
          <PDFDocument3D
            position={[-3, 1, 0]}
            fileName={uploadedFile.name}
            isHighlighted={true}
          />
        </group>
      )}

      {/* Query Input Panel */}
      {uploadedFile && (
        <FloatingPanel
          position={[2, 1, 0]}
          width={4}
          height={3}
          glowColor="#ff1493"
        >
          <Html
            position={[0, 0.3, 0]}
            transform
            style={{ width: '400px', pointerEvents: 'auto' }}
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the document..."
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid rgba(255, 121, 198, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: '#2d1f3d',
                fontSize: '14px',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || loading}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: query.trim() && !loading ? 'linear-gradient(135deg, #ff79c6, #ff1493)' : '#ccc',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
              }}
            >
              {loading ? '🔍 Searching...' : '🔍 Ask Question'}
            </button>
          </Html>
        </FloatingPanel>
      )}

      {/* Loading indicator */}
      {loading && (
        <group position={[0, -1, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.2}
            color="#ff79c6"
            anchorX="center"
            anchorY="middle"
          >
            Searching knowledge...
          </Text>
        </group>
      )}

      {/* Results */}
      {queryResult && !queryResult.error && (
        <group ref={resultRef} position={[0, -1.5, 0]}>
          <FloatingPanel
            position={[0, 0, 0]}
            width={6}
            height={4}
            glowColor="#ff79c6"
          >
            <Html
              position={[0, 0.5, 0]}
              transform
              style={{ width: '600px', maxHeight: '400px', overflow: 'auto', pointerEvents: 'auto' }}
            >
              <div style={{ color: '#2d1f3d', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
                {queryResult.response}
              </div>
            </Html>
          </FloatingPanel>

          {/* Source snippets */}
          {queryResult.sourcesUsed && queryResult.sourcesUsed.length > 0 && (
            <group position={[0, -2.5, 0]}>
              {queryResult.sourcesUsed.map((src, i) => (
                <SourceSnippet3D
                  key={i}
                  position={[i * 3.5 - (queryResult.sourcesUsed.length - 1) * 1.75, 0, 0]}
                  source={src.source}
                  excerpt={src.excerpt || ''}
                  similarity={src.similarity}
                />
              ))}
            </group>
          )}
        </group>
      )}
    </>
  );
}

export default QueryScene3D;

