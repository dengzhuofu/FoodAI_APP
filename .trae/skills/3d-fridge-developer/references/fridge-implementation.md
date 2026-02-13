# Fridge Implementation Guide

## Component Structure

A 3D Fridge component typically consists of:
1.  **Main Container**: Holds the fridge body.
2.  **Door Group**: A group containing the door mesh, pivoted at the hinge.
3.  **Shelves/Items**: Child nodes for food items.

## Code Example

```tsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import { Group } from 'three';
import { SpringValue, a } from '@react-spring/three'; // 可选：用于平滑动画

export function FridgeModel(props: any) {
  // 加载模型 (请替换为实际路径)
  // const { nodes, materials } = useGLTF(require('./assets/fridge.glb')); 
  
  // 或者使用基础几何体进行原型设计
  const [isOpen, setIsOpen] = useState(false);
  
  // 简单的门旋转逻辑
  const doorRef = useRef<Group>(null);
  
  useFrame((state, delta) => {
    if (doorRef.current) {
      const targetRotation = isOpen ? Math.PI / 2 : 0;
      // 这里可以添加平滑插值逻辑
      doorRef.current.rotation.y += (targetRotation - doorRef.current.rotation.y) * delta * 5;
    }
  });

  return (
    <group {...props} dispose={null}>
      {/* 冰箱主体 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      
      {/* 冰箱门 (以 x = 0.5 为轴心) */}
      <group position={[0.5, 0, 0.5]} ref={doorRef}>
        <mesh position={[-0.5, 0, 0]} onClick={() => setIsOpen(!isOpen)}>
           {/* 门网格，位置偏移以适配旋转轴 */}
          <boxGeometry args={[1, 2, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/*把手 */}
        <mesh position={[-0.8, 0, 0.1]}>
           <boxGeometry args={[0.05, 0.4, 0.05]} />
           <meshStandardMaterial color="silver" />
        </mesh>
      </group>
    </group>
  );
}
```

## Interaction Handling

*   **OnClick**: Use the `onClick` event on the mesh to toggle state.
*   **Gestures**: For more complex interaction (drag to open), wrap the Canvas in a Gesture Detector or use `@react-three/drei`'s `useGesture` if compatible, or handle pan gestures at the RN View level and pass values to the 3D scene.

## Loading Assets

Ensure your `.glb` file is in `assets/` and properly referenced. In Expo, you might need to use `useGLTF` with a URI or `require`.

```tsx
// 本地资源加载示例
import { Asset } from 'expo-asset';

// 可能需要预加载逻辑
const fridgeAsset = Asset.fromModule(require('../../assets/fridge.glb')).uri;
const { scene } = useGLTF(fridgeAsset);
```
