# React Native 3D Setup Guide

## Dependencies

To enable 3D rendering in this Expo project, install the following:

```bash
npx expo install expo-gl expo-gl-cpp
npm install three @react-three/fiber @react-three/drei
```

**Note**: `@react-three/fiber` v8+ is recommended. Ensure `three` version matches what `expo-gl` expects (usually latest is fine, but check for peer dependency warnings).

## Metro Config (Optional)

If you encounter issues loading `.glb` or `.gltf` files, add them to `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'glb',
  'gltf',
  'png',
  'jpg'
);

module.exports = config;
```

## Basic Canvas Setup

Create a container for your 3D scene:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Canvas } from '@react-three/fiber/native'; // Import from /native

export default function Scene() {
  return (
    <View style={{ flex: 1 }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </View>
  );
}
```
