import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';

// Glass material - create function to avoid issues
function createGlassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    opacity: 0.3,
    transparent: true,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    ior: 1.5,
    thickness: 0.5,
  });
}

// Floating glass panel component
export function FloatingPanel({ 
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 4,
  height = 3,
  depth = 0.1,
  children,
  hover = false,
  glowColor = '#ff79c6',
  delay = 0,
  ...props
}) {
  const meshRef = useRef();
  const glowRef = useRef();

  // Floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + delay) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    }
  });

  const springProps = useSpring({
    scale: hover ? 1.05 : 1,
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <animated.group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={springProps.scale}
      {...props}
    >
      {/* Glow effect */}
      <pointLight
        ref={glowRef}
        position={[0, 0, 1]}
        color={glowColor}
        intensity={0.3}
        distance={5}
        decay={2}
      />
      
      {/* Glass panel */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0.1}
          transmission={0.9}
          opacity={0.3}
          transparent={true}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          ior={1.5}
          thickness={0.5}
        />
      </mesh>
      
      {/* Border glow */}
      <mesh>
        <boxGeometry args={[width + 0.05, height + 0.05, depth + 0.01]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Content */}
      <group position={[0, 0, depth / 2 + 0.01]}>
        {children}
      </group>
    </animated.group>
  );
}

// Text panel with HTML content
export function TextPanel({ 
  position = [0, 0, 0],
  htmlContent,
  text,
  fontSize = 0.3,
  color = '#2d1f3d',
  ...props
}) {
  if (htmlContent) {
    return (
      <Html
        position={position}
        transform
        occlude
        style={{
          width: '400px',
          pointerEvents: 'auto',
        }}
        {...props}
      >
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: color,
        }}>
          {htmlContent}
        </div>
      </Html>
    );
  }

  return (
    <Text
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      font="/fonts/inter-bold.woff"
      {...props}
    >
      {text}
    </Text>
  );
}

// 3D Button
export function Button3D({ 
  position = [0, 0, 0],
  onClick,
  label,
  color = '#ff79c6',
  ...props
}) {
  const buttonRef = useRef();

  useFrame((state) => {
    if (buttonRef.current) {
      buttonRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={buttonRef} position={position} {...props}>
      <mesh onClick={onClick} onPointerOver={(e) => {
        e.object.scale.set(1.1, 1.1, 1.1);
      }} onPointerOut={(e) => {
        e.object.scale.set(1, 1, 1);
      }}>
        <boxGeometry args={[2, 0.5, 0.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default FloatingPanel;

