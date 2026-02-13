---
name: 3d-fridge-developer
description: Specialized skill for developing interactive 3D refrigerator models in React Native using React Three Fiber. Use this skill when the user wants to implement, modify, or debug 3D fridge features, including model loading, door interactions, and food item visualization.
---

# 3D Fridge Developer Skill

This skill guides the development of a 3D refrigerator feature in a React Native (Expo) environment.

## Workflow

1.  **Environment Setup**: Ensure necessary 3D libraries are installed (`expo-gl`, `three`, `@react-three/fiber`). See [references/rn-3d-setup.md](references/rn-3d-setup.md).
2.  **Model Preparation**: Prepare or generate a GLTF/GLB model of a refrigerator. The model should have separate meshes/nodes for the door to allow rotation.
3.  **Component Implementation**: Create the `Fridge3D` component. See [references/fridge-implementation.md](references/fridge-implementation.md).
4.  **Integration**: Embed the 3D view into the React Native screen (e.g., `MealPlanFeature.tsx` or a new `FridgeScreen`).

## Key Considerations

*   **Performance**: Mobile 3D requires optimization. Use low-poly models and compressed textures.
*   **Gestures**: Use React Native gesture handlers for interactions (tapping to open, panning to rotate view).
*   **State Management**: Sync the open/close state of the fridge with the app's logical state (e.g., viewing contents).

## References

*   [Setup Guide](references/rn-3d-setup.md): Dependencies and configuration.
*   [Implementation Guide](references/fridge-implementation.md): Component structure and interaction logic.
