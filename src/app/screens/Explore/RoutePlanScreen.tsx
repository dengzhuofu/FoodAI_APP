import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, Linking } from 'react-native';
import { MapView, Marker, Polyline } from 'react-native-amap3d';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { theme } from '../../styles/theme';
import { RootStackParamList } from '../../navigation/types';
import { wgs84ToGcj02 } from '../../../utils/coords';
import { searchRoute } from '../../../api/maps';

type RoutePlanScreenRouteProp = RouteProp<RootStackParamList, 'RoutePlan'>;

const RoutePlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RoutePlanScreenRouteProp>();
  const { destination } = route.params; 

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    type: 'driving' | 'walking' | 'transit' | 'riding';
  }>({ distance: '', duration: '', type: 'walking' });

  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [activeTab, setActiveTab] = useState<'driving' | 'transit' | 'walking' | 'riding'>('walking');
  const [destinationAddress, setDestinationAddress] = useState(destination.address || destination.name);

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
      
      const gcjLoc = wgs84ToGcj02(location.coords.longitude, location.coords.latitude);
      
      setCurrentLocation({
        latitude: gcjLoc.latitude,
        longitude: gcjLoc.longitude
      });
    })();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchRoute();
    }
  }, [currentLocation, activeTab]);

  const fetchRoute = async () => {
    if (!currentLocation) return;
    
    try {
       // Call backend API to calculate route
       const result = await searchRoute(
         activeTab, 
         `${currentLocation.longitude},${currentLocation.latitude}`,
         `${destination.longitude},${destination.latitude}`
       );
       
       if (result) {
         setRouteInfo({
           distance: result.distance,
           duration: result.duration,
           type: activeTab
         });
         setRouteCoordinates(result.path);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.webview}
          cameraPosition={{
             target: {
               latitude: destination.latitude,
               longitude: destination.longitude
             },
             zoom: 14
          }}
        >
          {currentLocation && (
            <Marker 
              position={currentLocation} 
              icon={require('../../../../assets/icon.png')} 
            />
          )}
          <Marker 
            position={{ latitude: destination.latitude, longitude: destination.longitude }} 
            color='red'
          />
          
          {routeCoordinates.length > 0 && (
             <Polyline 
               points={routeCoordinates} 
               color={theme.colors.primary} 
               width={6} 
             />
          )}
        </MapView>
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

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
            <Text style={styles.locationText} numberOfLines={2}>{destinationAddress}</Text>
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
