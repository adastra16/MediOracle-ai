import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import { FloatingPanel, TextPanel, Button3D } from '../components/3d/FloatingPanel';
import * as THREE from 'three';

export function HeroScene3D({ onGetStarted }) {
  const titleRef = useRef();
  const subtitleRef = useRef();

  useFrame((state) => {
    // Subtle camera movement
    if (titleRef.current) {
      titleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <>
      {/* Main title panel */}
      <FloatingPanel
        position={[0, 2, 0]}
        width={6}
        height={2}
        glowColor="#ff79c6"
        delay={0}
      >
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.5}
          color="#ff79c6"
          anchorX="center"
          anchorY="middle"
        >
          MediOracle AI
        </Text>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.15}
          color="#6b5b7a"
          anchorX="center"
          anchorY="middle"
        >
          Intelligent Health Insights
        </Text>
      </FloatingPanel>

      {/* Subtitle panel */}
      <FloatingPanel
        position={[0, 0, 0]}
        width={5}
        height={1.5}
        glowColor="#ff1493"
        delay={0.5}
      >
        <Text
          position={[0, 0, 0]}
          fontSize={0.12}
          color="#2d1f3d"
          anchorX="center"
          anchorY="middle"
        >
          Powered by Document Intelligence
        </Text>
      </FloatingPanel>

      {/* CTA Button */}
      <Button3D
        position={[0, -1.5, 0]}
        label="Ask a Medical Question"
        color="#ff79c6"
        onClick={onGetStarted}
      />

      {/* Feature badges */}
      <group position={[-3, -2.5, 0]}>
        <FloatingPanel position={[0, 0, 0]} width={1.5} height={1} glowColor="#ff79c6" delay={1}>
          <Text position={[0, 0.2, 0]} fontSize={0.1} color="#2d1f3d" anchorX="center" anchorY="middle">
            🔒 Privacy First
          </Text>
        </FloatingPanel>
      </group>

      <group position={[0, -2.5, 0]}>
        <FloatingPanel position={[0, 0, 0]} width={1.5} height={1} glowColor="#ff79c6" delay={1.2}>
          <Text position={[0, 0.2, 0]} fontSize={0.1} color="#2d1f3d" anchorX="center" anchorY="middle">
            ⚡ Real-time AI
          </Text>
        </FloatingPanel>
      </group>

      <group position={[3, -2.5, 0]}>
        <FloatingPanel position={[0, 0, 0]} width={1.5} height={1} glowColor="#ff79c6" delay={1.4}>
          <Text position={[0, 0.2, 0]} fontSize={0.1} color="#2d1f3d" anchorX="center" anchorY="middle">
            📚 RAG Enhanced
          </Text>
        </FloatingPanel>
      </group>
    </>
  );
}

export default HeroScene3D;

