import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

// Gently drifting vibrant red dust particles
function FloatingDust() {
  const pointsRef = useRef();
  const count = 120;
  
  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sp = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 12;     // X
      pos[i + 1] = (Math.random() - 0.5) * 12; // Y
      pos[i + 2] = (Math.random() - 0.5) * 8;  // Z
      
      sp[i] = (Math.random() - 0.5) * 0.003;   // speed X
      sp[i + 1] = (Math.random() - 0.5) * 0.003; // speed Y
      sp[i + 2] = (Math.random() - 0.5) * 0.003; // speed Z
    }
    return [pos, sp];
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const array = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count * 3; i += 3) {
      array[i] += speeds[i];
      array[i + 1] += speeds[i + 1];
      array[i + 2] += speeds[i + 2];

      // Boundary reset
      if (Math.abs(array[i]) > 6) array[i] = (Math.random() - 0.5) * 12;
      if (Math.abs(array[i + 1]) > 6) array[i + 1] = (Math.random() - 0.5) * 12;
      if (Math.abs(array[i + 2]) > 4) array[i + 2] = (Math.random() - 0.5) * 8;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FF2E2E"
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.3}
      />
    </points>
  );
}

// Undulating Particle Wave Grid in brand red
function ParticleWave({ clickTrigger }) {
  const meshRef = useRef();
  const speedRef = useRef(1.0);
  const count = 35; // Grid dimension

  useEffect(() => {
    if (clickTrigger > 0) {
      speedRef.current = 4.5; // Temporarily surge wave speed/height
    }
  }, [clickTrigger]);

  const [positions] = useMemo(() => {
    const points = new Float32Array(count * count * 3);
    let i = 0;
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        points[i] = (x - count / 2) * 0.45;     // X
        points[i + 1] = 0;                       // Y
        points[i + 2] = (z - count / 2) * 0.45; // Z
        i += 3;
      }
    }
    return [points];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, 1.0, 0.05);
    const time = state.clock.getElapsedTime();
    const array = meshRef.current.geometry.attributes.position.array;
    
    let i = 0;
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const posX = array[i];
        const posZ = array[i + 2];
        const distance = Math.sqrt(posX * posX + posZ * posZ);
        
        const waveHeight = 0.25 + (speedRef.current - 1.0) * 0.12;
        const waveSpeedVal = 1.0 + (speedRef.current - 1.0) * 0.8;
        
        array[i + 1] = Math.sin(distance * 0.3 - time * waveSpeedVal) * waveHeight + 
                       Math.cos(posX * 0.25 + time * 0.6) * 0.12;
        i += 3;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef} position={[0, -1.8, -2]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#FF2E2E"
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.2}
      />
    </points>
  );
}

// Sophisticated Ruby Chrome Sphere with orbital silver chrome rings for Home
function LiquidChromeSphere({ clickTrigger }) {
  const ref = useRef();
  const pulseRef = useRef(1.0);
  const spinRef = useRef(1.0);

  useEffect(() => {
    if (clickTrigger > 0) {
      pulseRef.current = 1.25;
      spinRef.current = 6.0;
    }
  }, [clickTrigger]);
  
  useFrame((state) => {
    if (ref.current) {
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 1.0, 0.08);
      spinRef.current = THREE.MathUtils.lerp(spinRef.current, 1.0, 0.06);

      ref.current.rotation.y += 0.005 * spinRef.current;
      ref.current.rotation.x += 0.002 * spinRef.current;
      ref.current.scale.setScalar(pulseRef.current);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.6}>
      <group>
        {/* Core vibrant red physical sphere */}
        <mesh ref={ref}>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshPhysicalMaterial
            color="#FF2E2E"
            roughness={0.1}
            metalness={0.8}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            reflectivity={1.0}
          />
        </mesh>
        
        {/* Orbiting thin silver chrome ring */}
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[1.65, 0.015, 16, 100]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

// Red Glass Octahedron with dark wireframe for About
function GlassStructure({ clickTrigger }) {
  const ref = useRef();
  const pulseRef = useRef(1.0);
  const spinRef = useRef(1.0);

  useEffect(() => {
    if (clickTrigger > 0) {
      pulseRef.current = 1.3;
      spinRef.current = 5.0;
    }
  }, [clickTrigger]);
  
  useFrame((state) => {
    if (ref.current) {
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 1.0, 0.08);
      spinRef.current = THREE.MathUtils.lerp(spinRef.current, 1.0, 0.06);

      ref.current.rotation.y += 0.008 * spinRef.current;
      ref.current.rotation.z += 0.004 * spinRef.current;
      ref.current.scale.setScalar(pulseRef.current);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <group>
        {/* Solid vibrant red glass core */}
        <mesh ref={ref}>
          <octahedronGeometry args={[1.1]} />
          <meshPhysicalMaterial
            color="#FF2E2E"
            transparent
            opacity={0.5}
            roughness={0.05}
            metalness={0.2}
            transmission={0.9}
            thickness={2.0}
            ior={1.6}
          />
        </mesh>

        {/* Outer deep black wireframe shield */}
        <mesh ref={ref}>
          <octahedronGeometry args={[1.14]} />
          <meshBasicMaterial color="#0A0A0A" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// Asymmetrical drifting plates (Red, White, Deep Black) for Projects
function DriftingPlates({ clickTrigger }) {
  const groupRef = useRef();
  const pulseRef = useRef(1.0);

  useEffect(() => {
    if (clickTrigger > 0) {
      pulseRef.current = 1.15;
    }
  }, [clickTrigger]);

  useFrame((state) => {
    if (groupRef.current) {
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 1.0, 0.08);
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.scale.setScalar(pulseRef.current);
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* Vibrant Red plate */}
        <mesh position={[1.8, 0.8, -1]} rotation={[0.4, 0.2, 0.1]}>
          <boxGeometry args={[1.2, 0.7, 0.04]} />
          <meshPhysicalMaterial color="#FF2E2E" roughness={0.1} metalness={0.7} />
        </mesh>
        
        {/* Clean White plate (Chrome style) */}
        <mesh position={[-1.8, -0.8, -1.5]} rotation={[-0.2, -0.4, 0.3]}>
          <boxGeometry args={[0.9, 0.5, 0.04]} />
          <meshPhysicalMaterial color="#FFFFFF" roughness={0.08} metalness={0.9} />
        </mesh>
        
        {/* Deep Black plate */}
        <mesh position={[0.8, -1.4, -2]} rotation={[0.1, -0.2, -0.4]}>
          <boxGeometry args={[1.0, 0.6, 0.04]} />
          <meshPhysicalMaterial color="#0A0A0A" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// Red, Black, and Chrome Gyroscope for Contact
function Gyroscope({ clickTrigger }) {
  const innerRef = useRef();
  const midRef = useRef();
  const outerRef = useRef();
  const spinRef = useRef(1.0);

  useEffect(() => {
    if (clickTrigger > 0) {
      spinRef.current = 8.0;
    }
  }, [clickTrigger]);

  useFrame((state) => {
    spinRef.current = THREE.MathUtils.lerp(spinRef.current, 1.0, 0.05);
    const time = state.clock.getElapsedTime();
    if (innerRef.current) innerRef.current.rotation.x = time * 0.35 * spinRef.current;
    if (midRef.current) midRef.current.rotation.y = time * 0.25 * spinRef.current;
    if (outerRef.current) outerRef.current.rotation.z = time * 0.15 * spinRef.current;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <group>
        {/* Outer Ring: Deep Black */}
        <mesh ref={outerRef}>
          <torusGeometry args={[2.0, 0.025, 16, 100]} />
          <meshStandardMaterial color="#0A0A0A" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Middle Ring: Vibrant Red */}
        <mesh ref={midRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[1.65, 0.02, 16, 100]} />
          <meshStandardMaterial color="#FF2E2E" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Inner Ring: Chrome Silver */}
        <mesh ref={innerRef} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <torusGeometry args={[1.3, 0.015, 16, 100]} />
          <meshStandardMaterial color="#FFFFFF" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

// Scene switcher logic
function SceneElements({ activeSection, clickTrigger }) {
  switch (activeSection) {
    case 'home':
      return <LiquidChromeSphere clickTrigger={clickTrigger} />;
    case 'about':
      return <GlassStructure clickTrigger={clickTrigger} />;
    case 'projects':
      return <DriftingPlates clickTrigger={clickTrigger} />;
    case 'contact':
      return <Gyroscope clickTrigger={clickTrigger} />;
    default:
      return null;
  }
}

export default function Background3D({ activeSection, clickTrigger }) {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }}>
        {/* Removed solid color backdrop to make the Canvas transparent */}
        
        {/* High-contrast cool white and brand red lighting */}
        <ambientLight intensity={0.8} color="#FFFFFF" />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#FFFFFF" />
        <spotLight position={[5, 15, 5]} angle={0.25} penumbra={1} intensity={1.2} color="#FFFFFF" />
        {/* Brand red light from bottom left */}
        <pointLight position={[-10, -10, -10]} intensity={0.9} color="#FF2E2E" />
        
        {/* Delicate floating particles */}
        <FloatingDust />
        
        {/* Ambient Wave Grid */}
        <ParticleWave clickTrigger={clickTrigger} />
        
        {/* Focus element based on current section */}
        <SceneElements activeSection={activeSection} clickTrigger={clickTrigger} />
        
        {/* Orbit Controls */}
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.25} 
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
