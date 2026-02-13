import { Platform } from 'react-native';

type AnyModule = any;

const fiber: AnyModule =
  Platform.OS === 'web' ? require('@react-three/fiber') : require('@react-three/fiber/native');

const drei: AnyModule =
  Platform.OS === 'web' ? require('@react-three/drei') : require('@react-three/drei/native');

export const Canvas = fiber.Canvas as AnyModule;
export const useFrame = fiber.useFrame as AnyModule;
export const useThree = fiber.useThree as AnyModule;
export const OrbitControls = drei.OrbitControls as AnyModule;
export const useGLTF = drei.useGLTF as AnyModule;
