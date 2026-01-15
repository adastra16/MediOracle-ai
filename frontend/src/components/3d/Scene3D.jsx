import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, Float } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Camera controller with smooth movement
function CameraController({ targetPosition, targetRotation }) {
  const { camera } = useThree();
  const cameraRef = useRef(camera);

  useFrame(() => {
    if (targetPosition) {
      cameraRef.current.position.lerp(targetPosition, 0.05);
    }
    if (targetRotation) {
      cameraRef.current.rotation.x = THREE.MathUtils.lerp(cameraRef.current.rotation.x, targetRotation.x, 0.05);
      cameraRef.current.rotation.y = THREE.MathUtils.lerp(cameraRef.current.rotation.y, targetRotation.y, 0.05);
    }
  });

  return null;
}

// Ambient lighting with soft movement
function AmbientLights() {
  const light1 = useRef();
  const light2 = useRef();
  const light3 = useRef();

  useFrame((state) => {
    if (light1.current) {
      light1.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 3;
      light1.current.position.y = Math.cos(state.clock.elapsedTime * 0.2) * 2;
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(state.clock.elapsedTime * 0.25) * 4;
      light2.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 3;
    }
    if (light3.current) {
      light3.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <>
      <ambientLight ref={light3} intensity={0.4} color="#ffffff" />
      <pointLight ref={light1} position={[5, 5, 5]} intensity={0.6} color="#ff79c6" distance={10} decay={2} />
      <pointLight ref={light2} position={[-5, 3, -5]} intensity={0.5} color="#ff1493" distance={10} decay={2} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} color="#fff5f9" />
    </>
  );
}

// Floating particles background
function FloatingParticles({ count = 200 }) {
  const particles = useRef();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 30;
    positions[i + 1] = (Math.random() - 0.5) * 30;
    positions[i + 2] = (Math.random() - 0.5) * 30;
  }

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ff79c6" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// Main 3D Scene wrapper
export function Scene3D({ 
  children, 
  cameraPosition = [0, 0, 8],
  enableControls = true,
  targetCameraPosition,
  targetCameraRotation,
  style = {},
  ...props
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', ...style }} {...props}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
        camera={{ position: cameraPosition, fov: 50 }}
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />
        <CameraController targetPosition={targetCameraPosition} targetRotation={targetCameraRotation} />
        
        <AmbientLights />
        <FloatingParticles />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Environment preset="sunset" />
        
        {enableControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        )}

        {children}
      </Canvas>
    </div>
  );
}

export default Scene3D;
