// Frontend Configuration
// Note: Sensitive keys should ideally be loaded from environment variables in build time
// But for Expo/RN without native code modification, we manage them here.

export const CONFIG = {
  // Amap (Gaode) Keys
  // Web Service Key: Used by Backend (configured in .env)
  // Web JS API Key: Used by Frontend WebView (must be 'Web端' type in Amap Console)
  AMAP_JS_KEY: '0043cad9a80751b20711b85361abdf1f', 
  
  // Security Code for Amap JS API (if configured in console)
  AMAP_SECURITY_CODE: '', 

  AMAP_NATIVE_KEY_ANDROID: '5b354d5dbc31fc4188c46b3b924ba241',
  AMAP_NATIVE_KEY_IOS: '8d02f37620279316fdd3b62f3bec7ae0',
};
