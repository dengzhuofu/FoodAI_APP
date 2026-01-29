import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, TextInput, FlatList, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { regeocodeLocation, searchLocation, LocationPOI } from '../../../api/maps';
import { CONFIG } from '../../../config';

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
  const webViewRef = useRef<WebView>(null);

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

  // Default to Beijing or initial location
  const initLat = initialLocation?.latitude || 39.9042;
  const initLng = initialLocation?.longitude || 116.4074;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html, #container { height: 100%; width: 100%; margin: 0; padding: 0; }
        .center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          margin-top: -32px;
          margin-left: -16px;
          z-index: 999;
          pointer-events: none;
        }
      </style>
      <script type="text/javascript">
        window._AMapSecurityConfig = {
          securityJsCode: '${CONFIG.AMAP_SECURITY_CODE}', 
        };
      </script>
      <script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=${CONFIG.AMAP_JS_KEY}"></script>
    </head>
    <body>
      <div id="container"></div>
      <img src="https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png" class="center-marker" />
      <script>
        var map = new AMap.Map('container', {
          zoom: 16,
          center: [${initLng}, ${initLat}],
          resizeEnable: true
        });

        // Send initial load message
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'init',
          lng: ${initLng},
          lat: ${initLat}
        }));

        map.on('moveend', function() {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'moveend',
            lng: center.getLng(),
            lat: center.getLat()
          }));
        });
        
        // Listen for messages from RN to set center
        document.addEventListener('message', function(e) {
          try {
            var data = JSON.parse(e.data);
            if (data.type === 'setCenter') {
              map.setCenter([data.lng, data.lat]);
            }
          } catch(err) {
            // ignore
          }
        });
        
        // Also support window.postMessage for some environments
        window.addEventListener('message', function(e) {
           try {
            var data = JSON.parse(e.data);
            if (data.type === 'setCenter') {
              map.setCenter([data.lng, data.lat]);
            }
          } catch(err) {
            // ignore
          }
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'moveend' || data.type === 'init') {
        const { lng, lat } = data;
        
        // Call backend to get address
        setIsLoading(true);
        const result = await regeocodeLocation(`${lng},${lat}`);
        setIsLoading(false);

        if (result && result.regeocode) {
          const address = result.regeocode.formatted_address;
          // Try to get a POI name if available, otherwise use street
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
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
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
    setSearchKeyword(''); // Optional: clear or keep keyword
    
    // Parse location string "lng,lat"
    const [lng, lat] = item.location.split(',').map(Number);
    
    // Move map
    const script = `
      map.setCenter([${lng}, ${lat}]);
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
    
    // Manually set current location (optional, map moveend will also trigger)
    // But setting it directly is faster for UI
    setCurrentLocation({
      latitude: lat,
      longitude: lng,
      name: item.name,
      address: item.address
    });
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
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webview}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

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
