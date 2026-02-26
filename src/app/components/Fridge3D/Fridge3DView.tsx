import React, { useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { PerspectiveCamera } from 'three';
import FridgeModel, { FridgeFoodNode } from './FridgeModel';
import { Canvas, OrbitControls, useFrame, useThree } from './r3f';

type Fridge3DViewProps = {
  modelUrl?: string;
  foods?: FridgeFoodNode[];
  visibleFoodIds?: string[];
  onFoodSelected?: (foodId: string) => void;
  selectedFoodId: string | null;
  onSelectedFoodIdChange: (foodId: string | null) => void;
  fullBleed?: boolean;
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
  doors,
  drawers,
  onDoorToggle,
  onDrawerToggle,
  onFoodPress,
  targetRotationY,
  rotationVelocityY,
  isRotating,
  targetDistance,
}: {
  modelUrl?: string;
  foods: FridgeFoodNode[];
  visibleFoodIds: Set<string>;
  selectedFoodId: string | null;
  doors: { fridge: boolean; freezer: boolean };
  drawers: { upper: boolean; lower: boolean };
  onDoorToggle: (door: 'fridge' | 'freezer') => void;
  onDrawerToggle: (drawer: 'upper' | 'lower') => void;
  onFoodPress: (foodId: string) => void;
  targetRotationY: React.MutableRefObject<number>;
  rotationVelocityY: React.MutableRefObject<number>;
  isRotating: React.MutableRefObject<boolean>;
  targetDistance: React.MutableRefObject<number>;
}) {
  return (
    <>
      {Platform.OS === 'web' ? null : (
        <CameraRig targetDistance={targetDistance} targetRotationY={targetRotationY} rotationVelocityY={rotationVelocityY} isRotating={isRotating} />
      )}

      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 4]} intensity={1.0} />

      <FridgeModel
        modelUrl={modelUrl}
        foods={foods}
        visibleFoodIds={visibleFoodIds}
        selectedFoodId={selectedFoodId}
        doors={doors}
        drawers={drawers}
        onDoorPress={onDoorToggle}
        onDrawerPress={onDrawerToggle}
        onFoodPress={onFoodPress}
      />
    </>
  );
}

function CameraRig({
  targetDistance,
  targetRotationY,
  rotationVelocityY,
  isRotating,
}: {
  targetDistance: React.MutableRefObject<number>;
  targetRotationY: React.MutableRefObject<number>;
  rotationVelocityY: React.MutableRefObject<number>;
  isRotating: React.MutableRefObject<boolean>;
}) {
  const { camera } = useThree() as { camera: PerspectiveCamera };
  const lookAtY = 0.2;

  useFrame((_state: any, delta: number) => {
    if (!isRotating.current && rotationVelocityY.current !== 0) {
      targetRotationY.current += rotationVelocityY.current * delta;
      rotationVelocityY.current *= Math.exp(-4.8 * delta);
      if (Math.abs(rotationVelocityY.current) < 0.006) rotationVelocityY.current = 0;
    }

    const radius = targetDistance.current;
    const yaw = targetRotationY.current;
    const desiredX = Math.sin(yaw) * radius;
    const desiredZ = Math.cos(yaw) * radius;
    const desiredY = 0.95 + radius * 0.12;

    const t = 1 - Math.exp(-10 * delta);
    camera.position.x += (desiredX - camera.position.x) * t;
    camera.position.z += (desiredZ - camera.position.z) * t;
    camera.position.y += (desiredY - camera.position.y) * t;
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
  fullBleed = false,
}: Fridge3DViewProps) {
  const visibleFoodIds = useMemo(() => {
    if (!visibleFoodIdList) return new Set(foods.map((f) => f.id));
    return new Set(visibleFoodIdList);
  }, [foods, visibleFoodIdList]);
  const [doors, setDoors] = useState({ fridge: true, freezer: true });
  const [drawers, setDrawers] = useState({ upper: false, lower: false });

  const targetRotationY = useRef(0);
  const rotationVelocityY = useRef(0);
  const isRotating = useRef(false);
  const targetDistance = useRef(3.4);
  const pinchStartDistance = useRef(3.4);
  const panStartX = useRef(0);
  const panStartY = useRef(0);

  const pan = useMemo(() => {
    return Gesture.Pan()
      .maxPointers(1)
      .manualActivation(true)
      .onTouchesDown((e: any) => {
        const t = e?.allTouches?.[0];
        if (!t) return;
        panStartX.current = t.x ?? 0;
        panStartY.current = t.y ?? 0;
      })
      .onTouchesMove((e: any, state: any) => {
        const t = e?.allTouches?.[0];
        if (!t) return;
        const dx = (t.x ?? 0) - panStartX.current;
        const dy = (t.y ?? 0) - panStartY.current;
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          state?.activate?.();
        }
      })
      .onUpdate((e) => {
        const rotatePerPx = 0.006;
        targetRotationY.current += e.changeX * rotatePerPx;
        rotationVelocityY.current = clamp(e.velocityX * rotatePerPx, -3.6, 3.6);
      })
      .onBegin(() => {
        isRotating.current = true;
        rotationVelocityY.current = 0;
      })
      .onEnd((e) => {
        isRotating.current = false;
        const rotatePerPx = 0.006;
        rotationVelocityY.current = clamp(e.velocityX * rotatePerPx, -3.6, 3.6);
      })
      .onFinalize(() => {
        isRotating.current = false;
      });
  }, []);

  const pinch = useMemo(() => {
    return Gesture.Pinch()
      .onBegin(() => {
        pinchStartDistance.current = targetDistance.current;
      })
      .onUpdate((e) => {
        targetDistance.current = clamp(pinchStartDistance.current / e.scale, 2.2, 6.2);
      });
  }, []);

  const gesture = useMemo(() => Gesture.Simultaneous(pan, pinch), [pan, pinch]);

  const canvas = (
    <View style={[styles.canvasWrap, fullBleed ? styles.canvasWrapFullBleed : null]}>
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
          doors={doors}
          drawers={drawers}
          onDoorToggle={(door) => {
            setDoors((prev) => {
              const next = { ...prev, [door]: !prev[door] };
              if (door === 'freezer' && prev.freezer) {
                setDrawers({ upper: false, lower: false });
              }
              return next;
            });
          }}
          onDrawerToggle={(drawer) => {
            setDrawers((prev) => ({ ...prev, [drawer]: !prev[drawer] }));
          }}
          onFoodPress={(foodId) => {
            onSelectedFoodIdChange(foodId);
            onFoodSelected?.(foodId);
          }}
          targetRotationY={targetRotationY}
          rotationVelocityY={rotationVelocityY}
          isRotating={isRotating}
          targetDistance={targetDistance}
        />
      </Canvas>
    </View>
  );

  return (
    <View style={[styles.container, fullBleed ? styles.containerFullBleed : null]}>
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
  canvasWrapFullBleed: {
    borderRadius: 0,
  },
});
