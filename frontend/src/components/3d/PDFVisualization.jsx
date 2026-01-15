import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';

// PDF Document as 3D object
export function PDFDocument3D({ 
  position = [0, 0, 0],
  fileName = 'document.pdf',
  isHighlighted = false,
  onClick,
  ...props
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const springProps = useSpring({
    scale: hovered || isHighlighted ? 1.1 : 1,
    glowIntensity: isHighlighted ? 0.8 : hovered ? 0.5 : 0.2,
    config: { mass: 1, tension: 200, friction: 20 },
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <animated.group
        ref={meshRef}
        position={position}
        scale={springProps.scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        {...props}
      >
        {/* Main document plane */}
        <mesh>
          <boxGeometry args={[2, 2.8, 0.1]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.3}
            roughness={0.2}
            emissive={isHighlighted ? '#ff79c6' : '#ffffff'}
            emissiveIntensity={springProps.glowIntensity}
          />
        </mesh>

        {/* Glow effect when highlighted */}
        {isHighlighted && (
          <mesh>
            <boxGeometry args={[2.1, 2.9, 0.05]} />
            <meshStandardMaterial
              color="#ff79c6"
              emissive="#ff79c6"
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}

        {/* PDF icon/text on document */}
        <Text
          position={[0, 0.5, 0.06]}
          fontSize={0.2}
          color="#ff79c6"
          anchorX="center"
          anchorY="middle"
        >
          📄
        </Text>
        <Text
          position={[0, -0.5, 0.06]}
          fontSize={0.1}
          color="#2d1f3d"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.8}
        >
          {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
        </Text>

        {/* Corner fold effect */}
        <mesh position={[0.95, 1.35, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.2, 0.2, 0.05]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </animated.group>
    </Float>
  );
}

// Source snippet visualization
export function SourceSnippet3D({ 
  position = [0, 0, 0],
  source,
  excerpt,
  similarity,
  ...props
}) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} {...props}>
      {/* Source card */}
      <mesh>
        <boxGeometry args={[3, 1.5, 0.1]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.2}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Content */}
      <Text
        position={[-1.3, 0.4, 0.06]}
        fontSize={0.08}
        color="#ff79c6"
        anchorX="left"
        anchorY="top"
        maxWidth={2.5}
      >
        {source}
      </Text>
      <Text
        position={[-1.3, 0, 0.06]}
        fontSize={0.06}
        color="#2d1f3d"
        anchorX="left"
        anchorY="top"
        maxWidth={2.5}
      >
        {excerpt}
      </Text>
      {similarity && (
        <Text
          position={[1.3, -0.6, 0.06]}
          fontSize={0.07}
          color="#ff79c6"
          anchorX="right"
          anchorY="bottom"
        >
          {Math.round(parseFloat(similarity) * 100)}% match
        </Text>
      )}
    </group>
  );
}

export default PDFDocument3D;

