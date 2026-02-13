import React, { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Group, PerspectiveCamera } from 'three';
import FridgeModel, { FridgeFoodNode } from './FridgeModel';
import { Canvas, OrbitControls, useFrame, useThree } from './r3f';

type Fridge3DViewProps = {
  modelUrl?: string;
  foods?: FridgeFoodNode[];
  visibleFoodIds?: string[];
  onFoodSelected?: (foodId: string) => void;
  selectedFoodId: string | null;
  onSelectedFoodIdChange: (foodId: string | null) => void;
};

const DEFAULT_FOODS: FridgeFoodNode[] = [
  { id: 'apple', name: '苹果', nodeName: 'Food_apple' },
  { id: 'milk', name: '牛奶', nodeName: 'Food_milk' },
  { id: 'egg', name: '鸡蛋', nodeName: 'Food_egg' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function Scene({
  modelUrl,
  foods,
  visibleFoodIds,
  selectedFoodId,
  open,
  onDoorToggle,
  onFoodPress,
  targetRotationY,
  targetDistance,
}: {
  modelUrl?: string;
  foods: FridgeFoodNode[];
  visibleFoodIds: Set<string>;
  selectedFoodId: string | null;
  open: boolean;
  onDoorToggle: () => void;
  onFoodPress: (foodId: string) => void;
  targetRotationY: React.MutableRefObject<number>;
  targetDistance: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<Group | null>(null);

  useFrame((_state: any, delta: number) => {
    const group = groupRef.current;
    if (group) {
      group.rotation.y += (targetRotationY.current - group.rotation.y) * Math.min(1, delta * 10);
    }
  });

  return (
    <group ref={groupRef as any}>
      <CameraRig targetDistance={targetDistance} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 4]} intensity={1.0} />

      <FridgeModel
        modelUrl={modelUrl}
        foods={foods}
        visibleFoodIds={visibleFoodIds}
        selectedFoodId={selectedFoodId}
        open={open}
        onDoorPress={() => {
          onDoorToggle();
        }}
        onFoodPress={onFoodPress}
      />
    </group>
  );
}

function CameraRig({ targetDistance }: { targetDistance: React.MutableRefObject<number> }) {
  const { camera } = useThree() as { camera: PerspectiveCamera };
  const lookAtY = 0.2;

  useFrame((_state: any, delta: number) => {
    const desiredZ = targetDistance.current;
    camera.position.z += (desiredZ - camera.position.z) * Math.min(1, delta * 8);
    camera.position.y += (1.2 - camera.position.y) * Math.min(1, delta * 8);
    camera.lookAt(0, lookAtY, 0);
    camera.updateProjectionMatrix();
  });

  return null;
}

export default function Fridge3DView({
  modelUrl,
  foods = DEFAULT_FOODS,
  visibleFoodIds: visibleFoodIdList,
  onFoodSelected,
  selectedFoodId,
  onSelectedFoodIdChange,
}: Fridge3DViewProps) {
  const visibleFoodIds = useMemo(() => {
    if (!visibleFoodIdList) return new Set(foods.map((f) => f.id));
    return new Set(visibleFoodIdList);
  }, [foods, visibleFoodIdList]);
  const [open, setOpen] = useState(false);

  const targetRotationY = useRef(0);
  const targetDistance = useRef(3.4);
  const pinchStartDistance = useRef(3.4);

  const pan = useMemo(() => {
    return Gesture.Pan()
      .minDistance(4)
      .onUpdate((e) => {
        targetRotationY.current += e.changeX * 0.008;
      });
  }, []);

  const pinch = useMemo(() => {
    return Gesture.Pinch()
      .onBegin(() => {
        pinchStartDistance.current = targetDistance.current;
      })
      .onUpdate((e) => {
        targetDistance.current = clamp(pinchStartDistance.current / e.scale, 2.0, 7.0);
      });
  }, []);

  const gesture = useMemo(() => Gesture.Simultaneous(pan, pinch), [pan, pinch]);

  const canvas = (
    <View style={styles.canvasWrap}>
      <Canvas
        camera={{ position: [0, 1.2, targetDistance.current], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onSelectedFoodIdChange(null)}
      >
        {Platform.OS === 'web' ? (
          <OrbitControls enablePan={false} enableDamping dampingFactor={0.12} />
        ) : null}

        <Scene
          modelUrl={modelUrl}
          foods={foods}
          visibleFoodIds={visibleFoodIds}
          selectedFoodId={selectedFoodId}
          open={open}
          onDoorToggle={() => setOpen((v) => !v)}
          onFoodPress={(foodId) => {
            onSelectedFoodIdChange(foodId);
            onFoodSelected?.(foodId);
          }}
          targetRotationY={targetRotationY}
          targetDistance={targetDistance}
        />
      </Canvas>
    </View>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? canvas : <GestureDetector gesture={gesture}>{canvas}</GestureDetector>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D10',
  },
  canvasWrap: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0B0D10',
  },
});
