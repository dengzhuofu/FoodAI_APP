import React, { useEffect, useMemo, useRef } from 'react';
import { Color, Group, Mesh, MeshStandardMaterial, Object3D, PointLight, Quaternion, Vector3 } from 'three';
import { useFrame, useGLTF } from './r3f';

export type FridgeFoodNode = {
  id: string;
  name: string;
  nodeName: string;
};

export type FridgeModelProps = {
  modelUrl?: string;
  foods: FridgeFoodNode[];
  visibleFoodIds: Set<string>;
  selectedFoodId: string | null;
  open: boolean;
  onDoorPress: () => void;
  onFoodPress: (foodId: string) => void;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

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
  const intensity = highlighted ? 0.6 : 0;

  target.traverse((obj) => {
    if (isMesh(obj)) {
      setEmissive(obj, emissive, intensity);
    }
  });
}

function cloneInWorldSpace(source: Object3D) {
  source.updateWorldMatrix(true, true);

  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();

  source.getWorldPosition(position);
  source.getWorldQuaternion(quaternion);
  source.getWorldScale(scale);

  const cloned = source.clone(true);
  cloned.position.copy(position);
  cloned.quaternion.copy(quaternion);
  cloned.scale.copy(scale);
  cloned.updateWorldMatrix(true, true);

  return cloned;
}

function FridgePrimitive({
  foods,
  visibleFoodIds,
  selectedFoodId,
  open,
  onDoorPress,
  onFoodPress,
}: Omit<FridgeModelProps, 'modelUrl'>) {
  const doorRef = useRef<Group | null>(null);

  useFrame((_state: any, delta: number) => {
    const door = doorRef.current;
    if (!door) return;
    const target = open ? Math.PI / 2 : 0;
    door.rotation.y += (target - door.rotation.y) * Math.min(1, delta * 10);
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 2.2, 1.1]} />
        <meshStandardMaterial color="#E6E6E6" />
      </mesh>

      <group ref={doorRef} position={[0.65, 0, 0.55]}>
        <mesh position={[-0.65, 0, 0]} onPointerDown={onDoorPress}>
          <boxGeometry args={[1.2, 2.2, 0.08]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-1.05, 0, 0.1]}>
          <boxGeometry args={[0.05, 0.45, 0.05]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>

      <mesh position={[0, 0.4, -0.15]}>
        <boxGeometry args={[1.05, 0.04, 0.9]} />
        <meshStandardMaterial color="#CFCFCF" />
      </mesh>
      <mesh position={[0, -0.1, -0.15]}>
        <boxGeometry args={[1.05, 0.04, 0.9]} />
        <meshStandardMaterial color="#CFCFCF" />
      </mesh>
      <mesh position={[0, -0.6, -0.15]}>
        <boxGeometry args={[1.05, 0.04, 0.9]} />
        <meshStandardMaterial color="#CFCFCF" />
      </mesh>

      {foods.map((food, index) => {
        const visible = visibleFoodIds.has(food.id);
        if (!visible) return null;
        const highlighted = selectedFoodId === food.id;
        const x = -0.35 + (index % 3) * 0.35;
        const y = 0.55 - Math.floor(index / 3) * 0.4;
        const z = 0.05;
        return (
          <mesh
            key={food.id}
            position={[x, y, z]}
            onPointerDown={() => onFoodPress(food.id)}
          >
            <sphereGeometry args={[0.09, 18, 18]} />
            <meshStandardMaterial color={highlighted ? '#00C896' : '#FF6B6B'} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function FridgeModel(props: FridgeModelProps) {
  if (!props.modelUrl) {
    return <FridgePrimitive {...props} />;
  }
  return <FridgeGltf {...props} />;
}

function FridgeGltf({ modelUrl, foods, visibleFoodIds, selectedFoodId, open, onDoorPress, onFoodPress }: FridgeModelProps) {
  const gltf = useGLTF(modelUrl) as any;
  const root = useMemo<Object3D>(() => gltf?.scene?.clone(true) ?? new Group(), [gltf]);

  const doorRef = useRef<Object3D | null>(null);
  const lightRef = useRef<PointLight | null>(null);

  const doorObject = useMemo(() => {
    const found = root.getObjectByName('Door');
    if (!found) return null;
    found.visible = false;
    return cloneInWorldSpace(found);
  }, [root]);

  const foodObjects = useMemo(() => {
    const map = new Map<string, Object3D>();
    foods.forEach((f) => {
      const found = root.getObjectByName(f.nodeName);
      if (!found) return;
      found.visible = false;
      map.set(f.id, cloneInWorldSpace(found));
    });
    return map;
  }, [foods, root]);

  useEffect(() => {
    doorRef.current = doorObject ?? null;
  }, [doorObject]);

  useEffect(() => {
    foodObjects.forEach((obj, id) => {
      obj.visible = visibleFoodIds.has(id);
      applyHighlight(obj, selectedFoodId === id);
    });
  }, [foodObjects, selectedFoodId, visibleFoodIds]);

  useFrame((_state: any, delta: number) => {
    const door = doorRef.current;
    if (door) {
      const target = open ? Math.PI / 2 : 0;
      door.rotation.y += (target - door.rotation.y) * Math.min(1, delta * 10);
    }

    const light = lightRef.current;
    if (light) {
      const target = open ? 1.4 : 0;
      light.intensity += (target - light.intensity) * Math.min(1, delta * 8);
    }
  });

  return (
    <group>
      <primitive object={root} />

      <pointLight
        ref={lightRef as any}
        position={[0, 0.6, 0.2]}
        intensity={0}
        distance={2.2}
        color="#FFF6CC"
      />

      {doorObject ? (
        <primitive
          object={doorObject}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDoorPress();
          }}
        />
      ) : null}

      {foods.map((food) => {
        const obj = foodObjects.get(food.id);
        if (!obj) return null;
        return (
          <primitive
            key={food.id}
            object={obj}
            visible={visibleFoodIds.has(food.id)}
            onPointerDown={(e: any) => {
              e.stopPropagation?.();
              onFoodPress(food.id);
            }}
          />
        );
      })}

    </group>
  );
}
