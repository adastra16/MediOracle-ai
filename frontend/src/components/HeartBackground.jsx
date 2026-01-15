import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function HeartBackground() {
  const mountRef = useRef(null);
  const animationFrameId = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);
  const touchRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    if (!mountRef.current) return;

    // Basic WebGL check
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, HeartBackground will not render.');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 0.95); // Dark space background
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Mouse and scroll tracking
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY * 0.001;
    };

    const handleTouchStart = (e) => {
      touchRef.current.active = true;
      if (e.touches[0]) {
        touchRef.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        touchRef.current.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        touchRef.current.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        touchRef.current.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleTouchEnd = () => {
      touchRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Create star shape geometry
    const createStarShape = () => {
      const shape = new THREE.Shape();
      const outerRadius = 0.5;
      const innerRadius = 0.25;
      const spikes = 5;
      
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      
      return new THREE.ShapeGeometry(shape);
    };

    const starGeometry = createStarShape();
    
    // Create sparkly star meshes (more stars)
    const starCount = 300;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      // Random colors: pink, white, cyan
      const colors = [
        0xff79c6, // Pink
        0xffffff, // White
        0x00ffff  // Cyan
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const starMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const star = new THREE.Mesh(starGeometry, starMaterial);
      
      // Random position
      star.position.x = (Math.random() - 0.5) * 20;
      star.position.y = (Math.random() - 0.5) * 20;
      star.position.z = (Math.random() - 0.5) * 10;
      
      // Random scale
      const scale = 0.05 + Math.random() * 0.1;
      star.scale.set(scale, scale, scale);
      
      // Random rotation
      star.rotation.z = Math.random() * Math.PI * 2;
      
      // Store animation properties
      star.userData = {
        twinkleSpeed: 0.5 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.2 + Math.random() * 0.3,
        baseOpacity: starMaterial.opacity,
        baseScale: scale
      };
      
      scene.add(star);
      stars.push(star);
    }

    // Create heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x, y + 0.25);
    heartShape.bezierCurveTo(x, y, x - 0.25, y, x - 0.25, y + 0.25);
    heartShape.bezierCurveTo(x - 0.25, y + 0.55, x, y + 0.55, x, y + 0.85);
    heartShape.bezierCurveTo(x, y + 0.55, x + 0.25, y + 0.55, x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y, x, y, x, y + 0.25);

    const extrudeSettings = {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 2,
      bevelSize: 0.03,
      bevelThickness: 0.03
    };

    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    
    // Sparkly pink material with glow
    const heartMaterial = new THREE.MeshStandardMaterial({
      color: 0xff79c6,
      emissive: 0xff79c6,
      emissiveIntensity: 0.8,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });

    // Create sparkly hearts (nodes in neural network)
    const hearts = [];
    const heartCount = 20;

    for (let i = 0; i < heartCount; i++) {
      const heart = new THREE.Mesh(heartGeometry, heartMaterial.clone());
      
      // Random position
      heart.position.x = (Math.random() - 0.5) * 15;
      heart.position.y = (Math.random() - 0.5) * 15;
      heart.position.z = (Math.random() - 0.5) * 10;
      
      // Random scale
      const scale = 0.25 + Math.random() * 0.35;
      heart.scale.set(scale, scale, scale);
      
      // Random rotation
      heart.rotation.x = Math.random() * Math.PI;
      heart.rotation.y = Math.random() * Math.PI;
      heart.rotation.z = Math.random() * Math.PI;
      
      // Store original position and animation properties
      heart.userData = {
        originalPosition: new THREE.Vector3(heart.position.x, heart.position.y, heart.position.z),
        speed: 0.3 + Math.random() * 0.4,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015
        },
        floatSpeed: 0.2 + Math.random() * 0.3,
        twinkleSpeed: 0.5 + Math.random() * 0.5,
        baseScale: scale
      };
      
      scene.add(heart);
      hearts.push(heart);
    }

    // Create neural network connections (sparkly lines between hearts)
    const connections = [];
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0xff79c6,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      linewidth: 2
    });

    // Connect nearby hearts
    for (let i = 0; i < hearts.length; i++) {
      for (let j = i + 1; j < hearts.length; j++) {
        const distance = hearts[i].position.distanceTo(hearts[j].position);
        if (distance < 8) { // Connection threshold
          const geometry = new THREE.BufferGeometry().setFromPoints([
            hearts[i].position,
            hearts[j].position
          ]);
          
          const line = new THREE.Line(geometry, connectionMaterial.clone());
          line.userData = {
            heart1: i,
            heart2: j,
            baseOpacity: 0.3
          };
          
          scene.add(line);
          connections.push(line);
        }
      }
    }

    // Add glitter particles along connections
    const glitterParticles = [];
    connections.forEach((connection, index) => {
      const heart1 = hearts[connection.userData.heart1];
      const heart2 = hearts[connection.userData.heart2];
      const midPoint = new THREE.Vector3()
        .addVectors(heart1.position, heart2.position)
        .multiplyScalar(0.5);
      
      // Create glitter along the connection
      const glitterCount = 5;
      for (let i = 0; i < glitterCount; i++) {
        const glitterGeometry = new THREE.RingGeometry(0.02, 0.05, 8);
        const glitterMaterial = new THREE.MeshBasicMaterial({
          color: 0xff79c6,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide
        });
        
        const glitter = new THREE.Mesh(glitterGeometry, glitterMaterial);
        
        // Position along the connection line
        const t = (i + 1) / (glitterCount + 1);
        glitter.position.lerpVectors(heart1.position, heart2.position, t);
        
        glitter.userData = {
          connectionIndex: index,
          t: t,
          pulseSpeed: 1 + Math.random() * 2
        };
        
        scene.add(glitter);
        glitterParticles.push(glitter);
      }
    });

    // Add small sparkly hearts around main hearts
    const sparkleHeartCount = 30;
    const smallHeartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });

    const sparkleHearts = [];

    for (let i = 0; i < sparkleHeartCount; i++) {
      const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff79c6,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
        blending: THREE.AdditiveBlending
      });

      const sparkleHeart = new THREE.Mesh(smallHeartGeometry, sparkleMaterial);
      
      // Random position
      sparkleHeart.position.x = (Math.random() - 0.5) * 15;
      sparkleHeart.position.y = (Math.random() - 0.5) * 15;
      sparkleHeart.position.z = (Math.random() - 0.5) * 8;
      
      // Small scale
      const scale = 0.08 + Math.random() * 0.12;
      sparkleHeart.scale.set(scale, scale, scale);
      
      // Random rotation
      sparkleHeart.rotation.x = Math.random() * Math.PI;
      sparkleHeart.rotation.y = Math.random() * Math.PI;
      sparkleHeart.rotation.z = Math.random() * Math.PI;
      
      // Store animation properties
      sparkleHeart.userData = {
        twinkleSpeed: 0.8 + Math.random() * 0.4,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: 0.3 + Math.random() * 0.3,
        baseOpacity: sparkleMaterial.opacity,
        baseScale: scale
      };
      
      scene.add(sparkleHeart);
      sparkleHearts.push(sparkleHeart);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add pink glow lights
    const pinkLight1 = new THREE.PointLight(0xff79c6, 1, 20);
    pinkLight1.position.set(5, 5, 5);
    scene.add(pinkLight1);

    const pinkLight2 = new THREE.PointLight(0xff79c6, 0.8, 20);
    pinkLight2.position.set(-5, -5, 5);
    scene.add(pinkLight2);

    // Animation loop
    let time = 0;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      time += 0.01;

      // Get interaction input (mouse or touch)
      const inputX = touchRef.current.active ? touchRef.current.x : mouseRef.current.x;
      const inputY = touchRef.current.active ? touchRef.current.y : mouseRef.current.y;

      // Animate stars twinkling with interaction
      stars.forEach((star, index) => {
        // Twinkling effect
        const twinkle = 0.5 + Math.sin(time * star.userData.twinkleSpeed * 3 + index) * 0.5;
        star.material.opacity = star.userData.baseOpacity * twinkle;
        
        // Rotation
        star.rotation.z += star.userData.rotationSpeed;
        
        // Gentle floating with interaction
        const floatY = Math.sin(time * star.userData.floatSpeed + index) * 0.005;
        const floatX = Math.cos(time * star.userData.floatSpeed + index) * 0.005;
        star.position.y += floatY + inputY * 0.3;
        star.position.x += floatX + inputX * 0.3;
        
        // Pulsing scale
        const pulse = 1 + Math.sin(time * star.userData.twinkleSpeed * 2 + index) * 0.2;
        star.scale.setScalar(star.userData.baseScale * pulse);
      });

      // Animate hearts with interaction
      hearts.forEach((heart, index) => {
        // More movement - base floating motion
        const baseY = Math.sin(time * heart.userData.floatSpeed + index) * 0.02;
        const baseX = Math.cos(time * heart.userData.floatSpeed + index) * 0.02;
        const baseZ = Math.sin(time * heart.userData.floatSpeed * 0.7 + index) * 0.015;
        
        // Stronger interaction offset (reacts to mouse/touch/scroll)
        const interactX = inputX * 0.8;
        const interactY = inputY * 0.8;
        const interactZ = scrollRef.current * 0.6;
        
        heart.position.x = heart.userData.originalPosition.x + baseX + interactX;
        heart.position.y = heart.userData.originalPosition.y + baseY + interactY;
        heart.position.z = heart.userData.originalPosition.z + baseZ + interactZ;
        
        // Rotation with interaction influence
        heart.rotation.x += heart.userData.rotationSpeed.x + inputY * 0.01;
        heart.rotation.y += heart.userData.rotationSpeed.y + inputX * 0.01;
        heart.rotation.z += heart.userData.rotationSpeed.z;
        
        // Enhanced twinkling sparkle effect (glitter)
        const twinkle = 0.7 + Math.sin(time * heart.userData.twinkleSpeed * 3 + index) * 0.3;
        heart.material.emissiveIntensity = 0.6 + twinkle * 0.6;
        heart.material.opacity = 0.8 + twinkle * 0.2;
        
        // Gentle pulsing
        const pulse = 1 + Math.sin(time * 2 + index) * 0.15;
        heart.scale.setScalar(heart.userData.baseScale * pulse);
      });

      // Update neural network connections (sparkly lines)
      connections.forEach((connection, index) => {
        const heart1 = hearts[connection.userData.heart1];
        const heart2 = hearts[connection.userData.heart2];
        
        // Update line geometry to follow hearts
        connection.geometry.setFromPoints([
          heart1.position,
          heart2.position
        ]);
        
        // Sparkly pulsing effect
        const pulse = Math.sin(time * 2 + index) * 0.5 + 0.5;
        connection.material.opacity = connection.userData.baseOpacity + pulse * 0.3;
      });

      // Animate glitter particles along connections
      glitterParticles.forEach((glitter, index) => {
        const connection = connections[glitter.userData.connectionIndex];
        const heart1 = hearts[connection.userData.heart1];
        const heart2 = hearts[connection.userData.heart2];
        
        // Position along connection line
        glitter.position.lerpVectors(heart1.position, heart2.position, glitter.userData.t);
        
        // Rotate and pulse
        glitter.rotation.z += 0.05;
        const pulse = Math.sin(time * glitter.userData.pulseSpeed + index) * 0.5 + 0.5;
        glitter.material.opacity = 0.6 + pulse * 0.4;
        glitter.scale.setScalar(0.8 + pulse * 0.4);
      });

      // Animate sparkle hearts
      sparkleHearts.forEach((sparkleHeart, index) => {
        // More movement with interaction
        const floatY = Math.sin(time * sparkleHeart.userData.floatSpeed + index) * 0.012;
        const floatX = Math.cos(time * sparkleHeart.userData.floatSpeed + index) * 0.012;
        const floatZ = Math.sin(time * sparkleHeart.userData.floatSpeed * 0.8 + index) * 0.008;
        
        sparkleHeart.position.y += floatY + inputY * 0.4;
        sparkleHeart.position.x += floatX + inputX * 0.4;
        sparkleHeart.position.z += floatZ + scrollRef.current * 0.4;
        
        // Rotation
        sparkleHeart.rotation.x += sparkleHeart.userData.rotationSpeed.x;
        sparkleHeart.rotation.y += sparkleHeart.userData.rotationSpeed.y;
        sparkleHeart.rotation.z += sparkleHeart.userData.rotationSpeed.z;
        
        // Twinkling sparkle effect
        const twinkle = 0.6 + Math.sin(time * sparkleHeart.userData.twinkleSpeed * 3 + index) * 0.4;
        sparkleHeart.material.opacity = sparkleHeart.userData.baseOpacity * twinkle;
        
        // Gentle pulsing
        const pulse = 1 + Math.sin(time * sparkleHeart.userData.twinkleSpeed * 2 + index) * 0.25;
        sparkleHeart.scale.setScalar(sparkleHeart.userData.baseScale * pulse);
      });

      // Move lights for dynamic glow
      pinkLight1.position.x = Math.sin(time * 0.3) * 8 + inputX * 2;
      pinkLight1.position.y = Math.cos(time * 0.3) * 8 + inputY * 2;
      pinkLight2.position.x = Math.cos(time * 0.4) * 8 - inputX * 2;
      pinkLight2.position.y = Math.sin(time * 0.4) * 8 - inputY * 2;

      // Camera movement with interaction
      const cameraOffsetX = inputX * 0.5 + Math.sin(time * 0.05) * 1.5;
      const cameraOffsetY = inputY * 0.5 + Math.cos(time * 0.05) * 1.5;
      camera.position.x = cameraOffsetX;
      camera.position.y = cameraOffsetY;
      camera.position.z = 5 + scrollRef.current * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      heartGeometry.dispose();
      heartMaterial.dispose();
      starGeometry.dispose();
      smallHeartGeometry.dispose();
      connectionMaterial.dispose();
      hearts.forEach(heart => {
        heart.geometry.dispose();
        heart.material.dispose();
      });
      stars.forEach(star => {
        star.geometry.dispose();
        star.material.dispose();
      });
      sparkleHearts.forEach(sparkleHeart => {
        sparkleHeart.geometry.dispose();
        sparkleHeart.material.dispose();
      });
      connections.forEach(connection => {
        connection.geometry.dispose();
        connection.material.dispose();
      });
      glitterParticles.forEach(glitter => {
        glitter.geometry.dispose();
        glitter.material.dispose();
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default HeartBackground;

