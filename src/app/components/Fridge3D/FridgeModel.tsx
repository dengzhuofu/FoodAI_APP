import React, { useEffect, useMemo, useRef } from 'react';
import { BackSide, Color, Group, Mesh, MeshStandardMaterial, Object3D, PointLight, Quaternion, Vector3 } from 'three';
import { Edges, RoundedBox, useFrame, useGLTF } from './r3f';
import FoodVisual from './FoodVisual';

export type FridgeFoodNode = {
  id: string;
  name: string;
  nodeName?: string;
  category?: string;
  quantity?: string;
  expiry_date?: string;
};

export type FridgeModelProps = {
  modelUrl?: string;
  foods: FridgeFoodNode[];
  visibleFoodIds: Set<string>;
  selectedFoodId: string | null;
  doors: { fridge: boolean; freezer: boolean };
  drawers: { upper: boolean; lower: boolean };
  onDoorPress: (door: 'fridge' | 'freezer') => void;
  onDrawerPress: (drawer: 'upper' | 'lower') => void;
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

function AnimatedScaleGroup({
  position,
  targetScale,
  children,
}: {
  position: [number, number, number];
  targetScale: number;
  children: React.ReactNode;
}) {
  const ref = useRef<Group | null>(null);
  const scaleRef = useRef(1);

  useFrame((_state: any, delta: number) => {
    const g = ref.current;
    if (!g) return;
    const t = 1 - Math.exp(-18 * delta);
    scaleRef.current += (targetScale - scaleRef.current) * t;
    g.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={ref as any} position={position}>
      {children}
    </group>
  );
}

function FridgePrimitive({
  foods,
  visibleFoodIds,
  selectedFoodId,
  doors,
  drawers,
  onDoorPress,
  onDrawerPress,
  onFoodPress,
}: Omit<FridgeModelProps, 'modelUrl'>) {
  const fridgeDoorRef = useRef<Group | null>(null);
  const freezerDoorRef = useRef<Group | null>(null);
  const drawerUpperRef = useRef<Group | null>(null);
  const drawerLowerRef = useRef<Group | null>(null);
  const interiorLightRef = useRef<PointLight | null>(null);

  useFrame((_state: any, delta: number) => {
    const fridgeDoor = fridgeDoorRef.current;
    if (fridgeDoor) {
      const target = doors.fridge ? Math.PI / 2 : 0;
      fridgeDoor.rotation.y += (target - fridgeDoor.rotation.y) * Math.min(1, delta * 10);
    }

    const freezerDoor = freezerDoorRef.current;
    if (freezerDoor) {
      const target = doors.freezer ? Math.PI / 2 : 0;
      freezerDoor.rotation.y += (target - freezerDoor.rotation.y) * Math.min(1, delta * 10);
    }

    const upperDrawer = drawerUpperRef.current;
    if (upperDrawer) {
      const target = drawers.upper ? 0.42 : 0;
      upperDrawer.position.z += (target - upperDrawer.position.z) * Math.min(1, delta * 12);
    }

    const lowerDrawer = drawerLowerRef.current;
    if (lowerDrawer) {
      const target = drawers.lower ? 0.42 : 0;
      lowerDrawer.position.z += (target - lowerDrawer.position.z) * Math.min(1, delta * 12);
    }

    const light = interiorLightRef.current;
    if (light) {
      const target = doors.fridge ? 1.25 : 0;
      light.intensity += (target - light.intensity) * Math.min(1, delta * 10);
    }
  });

  const placements = useMemo(() => {
    const results: Array<{ id: string; position: [number, number, number] }> = [];
    let fridgeIndex = 0;
    let freezerIndex = 0;

    const isFrozen = (food: FridgeFoodNode) => {
      const text = `${food.category ?? ''} ${food.name ?? ''}`.toLowerCase();
      return /速冻|冷冻|冻|ice|frozen/.test(text);
    };

    foods.forEach((food) => {
      if (!visibleFoodIds.has(food.id)) return;

      if (isFrozen(food)) {
        const col = freezerIndex % 3;
        const row = Math.floor(freezerIndex / 3);
        const x = -0.36 + col * 0.36;
        const y = -0.72 - row * 0.18;
        const z = -0.1;
        results.push({ id: food.id, position: [x, y, z] });
        freezerIndex += 1;
        return;
      }

      const col = fridgeIndex % 3;
      const row = Math.floor(fridgeIndex / 3);
      const shelf = row % 3;
      const rowInShelf = Math.floor(row / 3);
      const x = -0.36 + col * 0.36;
      const y = 0.62 - shelf * 0.42 - rowInShelf * 0.18;
      const z = -0.05;
      results.push({ id: food.id, position: [x, y, z] });
      fridgeIndex += 1;
    });

    return results;
  }, [foods, visibleFoodIds]);

  return (
    <group>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, -0.53]}>
          <boxGeometry args={[1.25, 2.35, 0.06]} />
          <meshStandardMaterial color="#E9EAED" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[-0.595, 0, 0]}>
          <boxGeometry args={[0.06, 2.35, 1.12]} />
          <meshStandardMaterial color="#E9EAED" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[0.595, 0, 0]}>
          <boxGeometry args={[0.06, 2.35, 1.12]} />
          <meshStandardMaterial color="#E9EAED" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[0, 1.145, 0]}>
          <boxGeometry args={[1.25, 0.06, 1.12]} />
          <meshStandardMaterial color="#E9EAED" roughness={0.55} metalness={0.05} />
        </mesh>
        <mesh position={[0, -1.145, 0]}>
          <boxGeometry args={[1.25, 0.06, 1.12]} />
          <meshStandardMaterial color="#E9EAED" roughness={0.55} metalness={0.05} />
        </mesh>

        <mesh position={[0, 0.02, -0.02]}>
          <boxGeometry args={[1.12, 2.22, 0.98]} />
          <meshStandardMaterial color="#F6F6F8" roughness={0.85} side={BackSide} />
        </mesh>

        <mesh position={[0, -0.43, -0.05]}>
          <boxGeometry args={[1.06, 0.04, 0.92]} />
          <meshStandardMaterial color="#C9CDD6" roughness={0.85} />
        </mesh>

        <mesh position={[0, -0.33, -0.05]}>
          <boxGeometry args={[1.06, 0.03, 0.92]} />
          <meshStandardMaterial color="#D2D5DB" roughness={0.85} />
        </mesh>

        <mesh position={[0, 0.42, -0.05]}>
          <boxGeometry args={[1.06, 0.03, 0.92]} />
          <meshStandardMaterial color="#D2D5DB" roughness={0.85} />
        </mesh>

        <mesh position={[0, 0.02, -0.05]}>
          <boxGeometry args={[1.06, 0.03, 0.92]} />
          <meshStandardMaterial color="#D2D5DB" roughness={0.85} />
        </mesh>

        <pointLight
          ref={interiorLightRef as any}
          position={[0.35, 0.88, 0.12]}
          intensity={0}
          distance={1.8}
          color="#FFF2CC"
        />
      </group>

      <group ref={fridgeDoorRef} position={[0.63, 0.34, 0.56]}>
        <RoundedBox
          args={[1.25, 1.55, 0.08]}
          radius={0.06}
          smoothness={10}
          position={[-0.63, 0, 0]}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDoorPress('fridge');
          }}
        >
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} metalness={0.05} />
          <Edges threshold={10} color="#E1E4EA" />
        </RoundedBox>

        <RoundedBox args={[0.05, 0.55, 0.05]} radius={0.02} smoothness={6} position={[-1.12, 0.02, 0.12]}>
          <meshStandardMaterial color="#C7CBD3" roughness={0.25} metalness={0.55} />
        </RoundedBox>
      </group>

      <group ref={freezerDoorRef} position={[0.63, -0.89, 0.56]}>
        <RoundedBox
          args={[1.25, 0.75, 0.08]}
          radius={0.06}
          smoothness={10}
          position={[-0.63, 0, 0]}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDoorPress('freezer');
          }}
        >
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} metalness={0.05} />
          <Edges threshold={10} color="#E1E4EA" />
        </RoundedBox>

        <RoundedBox args={[0.05, 0.24, 0.05]} radius={0.02} smoothness={6} position={[-1.12, 0.02, 0.12]}>
          <meshStandardMaterial color="#C7CBD3" roughness={0.25} metalness={0.55} />
        </RoundedBox>
      </group>

      <group position={[0, -0.86, 0]} visible={doors.freezer}>
        <group ref={drawerUpperRef} position={[0, -0.06, 0]}>
          <mesh position={[0, 0.07, -0.22]}>
            <boxGeometry args={[1.02, 0.26, 0.72]} />
            <meshStandardMaterial color="#F0F1F4" roughness={0.85} />
          </mesh>
          <mesh
            position={[0, 0.07, 0.22]}
            onPointerDown={(e: any) => {
              e.stopPropagation?.();
              onDrawerPress('upper');
            }}
          >
            <boxGeometry args={[1.02, 0.26, 0.05]} />
            <meshStandardMaterial color="#E2E4EA" roughness={0.7} />
          </mesh>
        </group>

        <group ref={drawerLowerRef} position={[0, -0.28, 0]}>
          <mesh position={[0, 0.07, -0.22]}>
            <boxGeometry args={[1.02, 0.26, 0.72]} />
            <meshStandardMaterial color="#F0F1F4" roughness={0.85} />
          </mesh>
          <mesh
            position={[0, 0.07, 0.22]}
            onPointerDown={(e: any) => {
              e.stopPropagation?.();
              onDrawerPress('lower');
            }}
          >
            <boxGeometry args={[1.02, 0.26, 0.05]} />
            <meshStandardMaterial color="#E2E4EA" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {placements.map(({ id, position }) => {
        const food = foods.find((f) => f.id === id);
        if (!food) return null;
        const highlighted = selectedFoodId === food.id;

        return (
          <AnimatedScaleGroup key={food.id} position={position} targetScale={highlighted ? 1.08 : 1}>
            <FoodVisual
              name={food.name}
              category={food.category}
              highlighted={highlighted}
              onPress={(e: any) => {
                e.stopPropagation?.();
                onFoodPress(food.id);
              }}
            />
          </AnimatedScaleGroup>
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

function FridgeGltf({ modelUrl, foods, visibleFoodIds, selectedFoodId, doors, drawers, onDoorPress, onDrawerPress, onFoodPress }: FridgeModelProps) {
  const gltf = useGLTF(modelUrl) as any;
  const root = useMemo<Object3D>(() => gltf?.scene?.clone(true) ?? new Group(), [gltf]);

  const fridgeDoorRef = useRef<Object3D | null>(null);
  const freezerDoorRef = useRef<Object3D | null>(null);
  const drawerUpperRef = useRef<Object3D | null>(null);
  const drawerLowerRef = useRef<Object3D | null>(null);
  const lightRef = useRef<PointLight | null>(null);

  const fridgeDoorObject = useMemo(() => {
    const found = root.getObjectByName('Door') ?? root.getObjectByName('FridgeDoor');
    if (!found) return null;
    found.visible = false;
    return cloneInWorldSpace(found);
  }, [root]);

  const freezerDoorObject = useMemo(() => {
    const found = root.getObjectByName('FreezerDoor');
    if (!found) return null;
    found.visible = false;
    return cloneInWorldSpace(found);
  }, [root]);

  const drawerUpperObject = useMemo(() => {
    const found = root.getObjectByName('DrawerUpper');
    if (!found) return null;
    found.visible = false;
    return cloneInWorldSpace(found);
  }, [root]);

  const drawerLowerObject = useMemo(() => {
    const found = root.getObjectByName('DrawerLower');
    if (!found) return null;
    found.visible = false;
    return cloneInWorldSpace(found);
  }, [root]);

  const foodObjects = useMemo(() => {
    const map = new Map<string, Object3D>();
    foods.forEach((f) => {
      if (!f.nodeName) return;
      const found = root.getObjectByName(f.nodeName);
      if (!found) return;
      found.visible = false;
      map.set(f.id, cloneInWorldSpace(found));
    });
    return map;
  }, [foods, root]);

  const foodBaseScales = useRef<Map<string, Vector3>>(new Map());
  const foodScaleFactors = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    fridgeDoorRef.current = fridgeDoorObject ?? null;
    freezerDoorRef.current = freezerDoorObject ?? null;
    drawerUpperRef.current = drawerUpperObject ?? null;
    drawerLowerRef.current = drawerLowerObject ?? null;
  }, [drawerLowerObject, drawerUpperObject, freezerDoorObject, fridgeDoorObject]);

  useEffect(() => {
    foodObjects.forEach((obj, id) => {
      foodBaseScales.current.set(id, obj.scale.clone());
      if (!foodScaleFactors.current.has(id)) foodScaleFactors.current.set(id, 1);
    });
  }, [foodObjects]);

  useEffect(() => {
    foodObjects.forEach((obj, id) => {
      obj.visible = visibleFoodIds.has(id);
      applyHighlight(obj, selectedFoodId === id);
    });
  }, [foodObjects, selectedFoodId, visibleFoodIds]);

  useFrame((_state: any, delta: number) => {
    const fridgeDoor = fridgeDoorRef.current;
    if (fridgeDoor) {
      const target = doors.fridge ? Math.PI / 2 : 0;
      fridgeDoor.rotation.y += (target - fridgeDoor.rotation.y) * Math.min(1, delta * 10);
    }

    const freezerDoor = freezerDoorRef.current;
    if (freezerDoor) {
      const target = doors.freezer ? Math.PI / 2 : 0;
      freezerDoor.rotation.y += (target - freezerDoor.rotation.y) * Math.min(1, delta * 10);
    }

    const drawerUpper = drawerUpperRef.current;
    if (drawerUpper) {
      const target = drawers.upper ? 0.42 : 0;
      drawerUpper.position.z += (target - drawerUpper.position.z) * Math.min(1, delta * 12);
    }

    const drawerLower = drawerLowerRef.current;
    if (drawerLower) {
      const target = drawers.lower ? 0.42 : 0;
      drawerLower.position.z += (target - drawerLower.position.z) * Math.min(1, delta * 12);
    }

    const light = lightRef.current;
    if (light) {
      const target = doors.fridge ? 1.4 : 0;
      light.intensity += (target - light.intensity) * Math.min(1, delta * 8);
    }

    const t = 1 - Math.exp(-18 * delta);
    foodObjects.forEach((obj, id) => {
      const base = foodBaseScales.current.get(id);
      if (!base) return;
      const current = foodScaleFactors.current.get(id) ?? 1;
      const target = selectedFoodId === id ? 1.08 : 1;
      const next = current + (target - current) * t;
      foodScaleFactors.current.set(id, next);
      obj.scale.set(base.x * next, base.y * next, base.z * next);
    });
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

      {fridgeDoorObject ? (
        <primitive
          object={fridgeDoorObject}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDoorPress('fridge');
          }}
        />
      ) : null}

      {freezerDoorObject ? (
        <primitive
          object={freezerDoorObject}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDoorPress('freezer');
          }}
        />
      ) : null}

      {drawerUpperObject ? (
        <primitive
          object={drawerUpperObject}
          visible={doors.freezer}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDrawerPress('upper');
          }}
        />
      ) : null}

      {drawerLowerObject ? (
        <primitive
          object={drawerLowerObject}
          visible={doors.freezer}
          onPointerDown={(e: any) => {
            e.stopPropagation?.();
            onDrawerPress('lower');
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
