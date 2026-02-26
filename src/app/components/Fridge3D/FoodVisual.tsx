import React, { useEffect, useMemo } from 'react';
import { Box3, Color, Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { useGLTF } from './r3f';
import { FOOD_MODEL_REGISTRY, getFoodModelUrl, resolveFoodModelKey } from './foodModelRegistry';

type FoodVisualProps = {
  name?: string;
  category?: string;
  highlighted: boolean;
  onPress: (e: any) => void;
};

function isMesh(obj: Object3D): obj is Mesh {
  return (obj as any)?.isMesh === true;
}

function setEmissive(mesh: Mesh, emissive: Color, intensity: number) {
  const material = mesh.material as any;
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach((m) => {
      const ms = m as MeshStandardMaterial;
      if (ms?.emissive) {
        ms.emissive = emissive;
        ms.emissiveIntensity = intensity;
        ms.needsUpdate = true;
      }
    });
    return;
  }

  const ms = material as MeshStandardMaterial;
  if (ms?.emissive) {
    ms.emissive = emissive;
    ms.emissiveIntensity = intensity;
    ms.needsUpdate = true;
  }
}

function applyHighlight(target: Object3D, highlighted: boolean) {
  const emissive = highlighted ? new Color('#00C896') : new Color('#000000');
  const intensity = highlighted ? 0.65 : 0;

  target.traverse((obj) => {
    if (isMesh(obj)) {
      setEmissive(obj, emissive, intensity);
    }
  });
}

function ProceduralApple({ highlighted }: { highlighted: boolean }) {
  const red = highlighted ? '#00C896' : '#E64545';
  return (
    <group>
      <mesh position={[0, 0.085, 0]}>
        <sphereGeometry args={[0.11, 22, 22]} />
        <meshStandardMaterial color={red} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0.02, 0.2, 0]} rotation={[0.3, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.016, 0.06, 10]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#7A4A2A'} roughness={0.8} />
      </mesh>
      <mesh position={[-0.04, 0.19, 0]} rotation={[0.2, 0.2, -0.8]}>
        <sphereGeometry args={[0.05, 14, 14]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#3CCF6E'} roughness={0.8} />
      </mesh>
    </group>
  );
}

function ProceduralFish({ highlighted }: { highlighted: boolean }) {
  const bodyColor = highlighted ? '#00C896' : '#8BA3B8';
  const finColor = highlighted ? '#00C896' : '#7A8EA1';
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.11, 22, 18]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0.1, 0.08, 0]} scale={[1.25, 0.75, 0.75]}>
        <sphereGeometry args={[0.09, 22, 18]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[-0.14, 0.08, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.085, 0.14, 4]} />
        <meshStandardMaterial color={finColor} roughness={0.65} metalness={0.02} />
      </mesh>
      <mesh position={[0.02, 0.17, 0]} rotation={[0.2, 0, 0.2]}>
        <coneGeometry args={[0.05, 0.1, 4]} />
        <meshStandardMaterial color={finColor} roughness={0.7} metalness={0.02} />
      </mesh>
      <mesh position={[0.16, 0.1, 0.06]}>
        <sphereGeometry args={[0.012, 10, 10]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#0B0D10'} roughness={0.6} />
      </mesh>
    </group>
  );
}

function ProceduralMilk({ highlighted }: { highlighted: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.08]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#6DA8FF'} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.06, 0.06, 4]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#FFFFFF'} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ProceduralEgg({ highlighted }: { highlighted: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.16, 0.06, 0.1]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#FFE6B3'} roughness={0.8} />
      </mesh>
      <mesh position={[-0.04, 0.12, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#FFF6E8'} roughness={0.6} />
      </mesh>
      <mesh position={[0.04, 0.12, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#FFF6E8'} roughness={0.6} />
      </mesh>
    </group>
  );
}

function FoodGltf({
  url,
  highlighted,
  scale = 1,
  rotation = [0, 0, 0],
  offset = [0, 0, 0],
  onPress,
  targetSize = 0.22,
}: {
  url: string;
  highlighted: boolean;
  scale?: number;
  rotation?: [number, number, number];
  offset?: [number, number, number];
  onPress: (e: any) => void;
  targetSize?: number;
}) {
  const gltf = useGLTF(url) as any;
  const root = useMemo<Object3D>(() => gltf?.scene?.clone(true) ?? new Group(), [gltf]);

  useEffect(() => {
    applyHighlight(root, highlighted);
  }, [root, highlighted]);

  const normalizedScale = useMemo(() => {
    const box = new Box3().setFromObject(root);
    const size = new Vector3();
    box.getSize(size);
    const maxSize = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(maxSize) || maxSize <= 0) return scale;
    return scale * (targetSize / maxSize);
  }, [root, scale, targetSize]);

  return (
    <primitive
      object={root}
      position={offset as any}
      rotation={rotation as any}
      scale={normalizedScale}
      onPointerDown={onPress}
    />
  );
}

export default function FoodVisual({ name, category, highlighted, onPress }: FoodVisualProps) {
  const key = useMemo(() => resolveFoodModelKey({ name, category }), [name, category]);
  const config = key ? FOOD_MODEL_REGISTRY[key] : null;

  const url = key ? getFoodModelUrl(key) ?? config?.url : config?.url;

  if (url) {
    return (
      <FoodGltf
        url={url}
        highlighted={highlighted}
        scale={config.scale}
        rotation={config.rotation}
        offset={config.offset}
        onPress={onPress}
      />
    );
  }

  if (key === 'apple') return <group onPointerDown={onPress}><ProceduralApple highlighted={highlighted} /></group>;
  if (key === 'fish') return <group onPointerDown={onPress}><ProceduralFish highlighted={highlighted} /></group>;
  if (key === 'milk') return <group onPointerDown={onPress}><ProceduralMilk highlighted={highlighted} /></group>;
  if (key === 'egg') return <group onPointerDown={onPress}><ProceduralEgg highlighted={highlighted} /></group>;

  return (
    <group onPointerDown={onPress}>
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.14, 0.18, 0.1]} />
        <meshStandardMaterial color={highlighted ? '#00C896' : '#FF6B6B'} roughness={0.55} />
      </mesh>
    </group>
  );
}
