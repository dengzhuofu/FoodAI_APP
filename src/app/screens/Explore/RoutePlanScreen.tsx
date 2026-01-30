import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { theme } from '../../styles/theme';
import { CONFIG } from '../../../config';
import { RootStackParamList } from '../../navigation/types';
import { wgs84ToGcj02 } from '../../../utils/coords';

type RoutePlanScreenRouteProp = RouteProp<RootStackParamList, 'RoutePlan'>;

const RoutePlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RoutePlanScreenRouteProp>();
  const { destination } = route.params; // { latitude, longitude, name, address }
  const webViewRef = useRef<WebView>(null);

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    type: 'driving' | 'walking' | 'transit' | 'riding';
  }>({ distance: '', duration: '', type: 'walking' });

  const [activeTab, setActiveTab] = useState<'driving' | 'transit' | 'walking' | 'riding'>('walking');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限不足', '需要获取您的位置信息来规划路线');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      // Convert WGS-84 (GPS) to GCJ-02 (Amap)
      const gcjLoc = wgs84ToGcj02(location.coords.longitude, location.coords.latitude);
      
      setCurrentLocation({
        latitude: gcjLoc.latitude,
        longitude: gcjLoc.longitude
      });
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && webViewRef.current) {
      updateRoute(activeTab);
    }
  }, [currentLocation, activeTab]);

  const updateRoute = (type: string) => {
    if (!currentLocation) return;
    
    // Native WebView Logic
    const script = `
      planRoute('${type}', 
        [${currentLocation.longitude}, ${currentLocation.latitude}], 
        [${destination.longitude}, ${destination.latitude}]
      );
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const htmlContent = `
    <!DOCTYPE html> 
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html, #container { height: 100%; width: 100%; margin: 0; padding: 0; }
        .amap-logo, .amap-copyright { display: none !important; }
      </style>
      <script type="text/javascript">
        window._AMapSecurityConfig = {
          securityJsCode: '${CONFIG.AMAP_SECURITY_CODE}', 
        };
        // Add error handler for script loading
        window.onerror = function(msg, url, line) {
           console.log("Error in iframe: " + msg);
           // Try to notify parent
           window.parent.postMessage(JSON.stringify({type: 'error', message: msg}), '*');
        };
      </script>
      <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=${CONFIG.AMAP_JS_KEY}&plugin=AMap.Driving,AMap.Walking,AMap.Transfer,AMap.Riding"></script>
    </head>
    <body>
      <div id="container"></div>
      <script>
        console.log("Map initialized in iframe");
        try {
          var map = new AMap.Map('container', {
            zoom: 14,
            resizeEnable: true
          });
          console.log("Map instance created");
        } catch (e) {
          console.error("Map init failed", e);
        }

        var currentRoute = null;
        
        // Listen for messages from Web Parent
        window.addEventListener('message', function(e) {
          try {
            var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            if (data.type === 'planRoute') {
              planRoute(data.mode, data.start, data.end);
            }
          } catch(err) {
            console.error(err);
          }
        });

        function planRoute(type, start, end) {
          // ... (same as before)
          if (currentRoute) {
            currentRoute.clear();
          }
          map.clearMap();

          // Add Start/End Markers
          new AMap.Marker({
            position: new AMap.LngLat(start[0], start[1]),
            content: '<div style="background-color:#1890FF;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
            offset: new AMap.Pixel(-7, -7),
            map: map
          });

          new AMap.Marker({
            position: new AMap.LngLat(end[0], end[1]),
            content: '<div style="background-color:#FF3F34;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
            offset: new AMap.Pixel(-6, -6),
            map: map
          });

          // Set map center and zoom to include both points
          var bounds = new AMap.Bounds(
            new AMap.LngLat(Math.min(start[0], end[0]), Math.min(start[1], end[1])),
            new AMap.LngLat(Math.max(start[0], end[0]), Math.max(start[1], end[1]))
          );
          map.setBounds(bounds, null, [50, 50, 50, 50]);

          var callback = function(status, result) {
            if (status === 'complete') {
              var route;
              if (result.routes && result.routes.length > 0) {
                route = result.routes[0];
              } else if (result.plans && result.plans.length > 0) {
                // For Transfer (Transit)
                route = result.plans[0];
              }
              
              if (!route) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: '未找到路线'
                }));
                return;
              }

              var distance = route.distance || 0;
              var time = route.time || 0;
              
              if (distance > 1000) {
                distance = (distance / 1000).toFixed(1) + '公里';
              } else {
                distance = distance + '米';
              }

              var duration = '';
              if (time > 3600) {
                duration = Math.floor(time / 3600) + '小时' + Math.floor((time % 3600) / 60) + '分';
              } else {
                duration = Math.ceil(time / 60) + '分钟';
              }

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'routeInfo',
                distance: distance,
                duration: duration
              }));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: '规划失败: ' + result
              }));
            }
          };

          if (type === 'driving') {
            currentRoute = new AMap.Driving({ map: map, hideMarkers: true });
            currentRoute.search(start, end, callback);
          } else if (type === 'walking') {
            currentRoute = new AMap.Walking({ map: map, hideMarkers: true });
            currentRoute.search(start, end, callback);
          } else if (type === 'transit') {
            currentRoute = new AMap.Transfer({ 
              map: map, 
              city: '深圳市', // Should be dynamic
              policy: AMap.TransferPolicy.LEAST_TIME,
              hideMarkers: true
            });
            currentRoute.search(start, end, callback);
          } else if (type === 'riding') {
            currentRoute = new AMap.Riding({ map: map, hideMarkers: true });
            currentRoute.search(start, end, callback);
          }
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      // Handle both native and web message formats
      const data = typeof event.nativeEvent.data === 'string' 
        ? JSON.parse(event.nativeEvent.data) 
        : event.nativeEvent.data;

      if (data.type === 'routeInfo') {
        setRouteInfo({
          distance: data.distance,
          duration: data.duration,
          type: activeTab
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openExternalMap = () => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios' 
      ? `${scheme}?q=${destination.name}&ll=${destination.latitude},${destination.longitude}`
      : `${scheme}${destination.latitude},${destination.longitude}?q=${destination.name}`;
    Linking.openURL(url);
  };

  const tabs = [
    { key: 'driving', label: '驾车', icon: 'car-sport-outline' },
    { key: 'transit', label: '公交', icon: 'bus-outline' },
    { key: 'riding', label: '骑行', icon: 'bicycle-outline' },
    { key: 'walking', label: '步行', icon: 'walk-outline' },
  ];

  useEffect(() => {
    // Web specific message listener removed, as we now handle updates directly
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        
        {/* Back Button Overlay */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        {/* Location Info */}
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
            <Text style={styles.locationText}>我的位置</Text>
          </View>
          <View style={styles.dashedLine} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
            <Text style={styles.locationText} numberOfLines={1}>{destination.name}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.key} 
              style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && (
                <Text style={styles.tabDuration}>{routeInfo.duration || '--'}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Route Summary */}
        <View style={styles.routeSummary}>
          <View>
            <Text style={styles.summaryTime}>
              {routeInfo.duration || '计算中...'}
            </Text>
            <Text style={styles.summaryDistance}>
              {routeInfo.distance ? `${routeInfo.distance}` : ''}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.navButton} onPress={openExternalMap}>
            <Text style={styles.navButtonText}>开始导航</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  locationInfo: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  dashedLine: {
    height: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginLeft: 3.5, // Center with dot (8/2 - 1/2)
    marginVertical: 2,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabItem: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  tabDuration: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryDistance: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  navButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoutePlanScreen;
