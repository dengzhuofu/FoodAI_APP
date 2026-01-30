import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, TextInput, FlatList, Keyboard } from 'react-native';
import { MapView, MapType, CameraPosition } from 'react-native-amap3d';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { regeocodeLocation, searchLocation, LocationPOI } from '../../../api/maps';

type ParamList = {
  MapSelector: {
    initialLocation?: {
      latitude: number;
      longitude: number;
    };
    onSelect: (location: LocationPOI) => void;
  };
};

const MapSelectorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'MapSelector'>>();
  const { initialLocation, onSelect } = route.params;
  
  // Default to Beijing or initial location
  const initLat = initialLocation?.latitude || 39.9042;
  const initLng = initialLocation?.longitude || 116.4074;

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
    target: {
      latitude: initLat,
      longitude: initLng,
    },
    zoom: 16,
  });

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    name: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Search State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<LocationPOI[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Initial load
  useEffect(() => {
    fetchAddress(initLat, initLng);
  }, []);

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const result = await regeocodeLocation(`${lng},${lat}`);
      if (result && result.regeocode) {
        const address = result.regeocode.formatted_address;
        let name = address;
        if (result.regeocode.pois && result.regeocode.pois.length > 0) {
          name = result.regeocode.pois[0].name;
        } else if (result.regeocode.addressComponent.streetNumber.street) {
           name = result.regeocode.addressComponent.streetNumber.street + result.regeocode.addressComponent.streetNumber.number;
        }

        setCurrentLocation({
          latitude: lat,
          longitude: lng,
          address,
          name
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraIdle = (event: any) => {
    // When camera stops moving, fetch address for center
    const { target } = event.nativeEvent;
    fetchAddress(target.latitude, target.longitude);
  };

  const handleConfirm = () => {
    if (currentLocation) {
      onSelect({
        id: `loc_${Date.now()}`,
        name: currentLocation.name,
        address: currentLocation.address,
        type: 'point',
        location: `${currentLocation.longitude},${currentLocation.latitude}`,
        pname: '',
        cityname: '',
        adname: ''
      });
      navigation.goBack();
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    setIsSearching(true);
    Keyboard.dismiss();
    try {
      const results = await searchLocation(searchKeyword);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: LocationPOI) => {
    setShowSearchResults(false);
    setSearchKeyword(''); 
    
    // Parse location string "lng,lat"
    const [lng, lat] = item.location.split(',').map(Number);
    
    setCameraPosition({
      target: {
        latitude: lat,
        longitude: lng,
      },
      zoom: 16,
    });
    
    // Also fetch address immediately
    fetchAddress(lat, lng);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={theme.colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索地点"
            value={searchKeyword}
            onChangeText={(text) => {
              setSearchKeyword(text);
              if (text.length === 0) setShowSearchResults(false);
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={handleSearch}>
              <Text style={styles.searchBtnText}>搜索</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <MapView
          style={styles.webview} // reusing style name for simplicity
          mapType={MapType.Standard}
          cameraPosition={cameraPosition}
          onCameraIdle={handleCameraIdle}
        />
        
        {/* Center Marker Overlay */}
        <View style={styles.centerMarkerContainer} pointerEvents="none">
          <Ionicons name="location" size={36} color={theme.colors.primary} />
        </View>

        {showSearchResults && (
          <View style={styles.searchResultsOverlay}>
            {isSearching ? (
              <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.resultItem} 
                    onPress={() => selectSearchResult(item)}
                  >
                    <Ionicons name="location" size={20} color={theme.colors.textSecondary} />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultAddress}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.resultsList}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.addressContainer}>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Text style={styles.locationName} numberOfLines={1}>
                {currentLocation?.name || '正在获取位置...'}
              </Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {currentLocation?.address || ''}
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.confirmButton, !currentLocation && styles.disabledButton]} 
          onPress={handleConfirm}
          disabled={!currentLocation}
        >
          <Text style={styles.confirmButtonText}>确定</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    zIndex: 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  searchBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    marginTop: -18, // Adjust for icon center (half of icon size 36)
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 10,
  },
  resultsList: {
    padding: theme.spacing.md,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  footer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
    zIndex: 2,
  },
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  disabledButton: {
    backgroundColor: theme.colors.textTertiary,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MapSelectorScreen;
