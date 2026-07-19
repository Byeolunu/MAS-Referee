import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Icosahedron, Line, Edges } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSphere() {
  const ref = useRef<THREE.Points>(null);

  // Generate random points in a sphere
  const sphere = useMemo(() => {
    const points = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      const r = 20 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      points[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      points[i * 3 + 2] = r * Math.cos(phi);
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#10b981"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function TechFootball() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.rotation.x += delta * 0.1;

      // Gentle floating animation
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={ref}>
      <Icosahedron args={[3, 1]}>
        <meshBasicMaterial color="#020617" />
        <Edges
          linewidth={2}
          threshold={15} // Render all edges
          color="#38bdf8"
        />
      </Icosahedron>

      {/* Inner glowing core */}
      <Icosahedron args={[2.5, 2]}>
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </Icosahedron>
    </mesh>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <fog attach="fog" args={['#020617', 5, 25]} />
        <ambientLight intensity={0.5} />
        <ParticleSphere />
      </Canvas>
    </div>
  );
}
