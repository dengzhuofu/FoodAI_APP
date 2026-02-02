import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, PermissionsAndroid, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { aroundSearch, LocationPOI, reverseGeocode, searchPOI } from '../../../api/maps';

type MapSelectorRouteProp = RouteProp<RootStackParamList, 'MapSelector'>;

export default function MapSelectorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<MapSelectorRouteProp>();

  const mapRef = useRef<any>(null);
  const [target, setTarget] = useState<{ latitude: number; longitude: number } | null>(
    route.params.initialLocation || null
  );
  const [address, setAddress] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [pois, setPois] = useState<LocationPOI[]>([]);
  const [selectedPOI, setSelectedPOI] = useState<LocationPOI | null>(null);

  const centerText = useMemo(() => {
    if (!target) return '—';
    return `${target.latitude.toFixed(6)}, ${target.longitude.toFixed(6)}`;
  }, [target]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS !== 'android') return;
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (e) {
        // ignore
      }
    };
    requestLocationPermission();
  }, []);

  const syncAddress = useCallback(async (next: { latitude: number; longitude: number }) => {
    try {
      const formatted = await reverseGeocode({ location: `${next.longitude},${next.latitude}` });
      setAddress(formatted || '');
    } catch (e) {
      setAddress('');
    }
  }, []);

  const refreshAround = useCallback(
    async (next: { latitude: number; longitude: number }) => {
      setLoading(true);
      try {
        const list = await aroundSearch({
          location: `${next.longitude},${next.latitude}`,
          keywords: keyword || undefined,
          radius: 1000,
          page: 1,
          page_size: 20,
        });
        setPois(list);
      } finally {
        setLoading(false);
      }
    },
    [keyword]
  );

  const onCameraIdle = useCallback(
    async ({ nativeEvent }: any) => {
      const next = nativeEvent?.cameraPosition?.target;
      if (!next?.latitude || !next?.longitude) return;
      const newTarget = { latitude: next.latitude, longitude: next.longitude };
      setTarget(newTarget);
      setSelectedPOI(null);
      await syncAddress(newTarget);
      await refreshAround(newTarget);
    },
    [refreshAround, syncAddress]
  );

  useEffect(() => {
    const run = async () => {
      if (!target) return;
      await syncAddress(target);
      await refreshAround(target);
    };
    run();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const list = await searchPOI({ keywords: keyword.trim(), page: 1, page_size: 20 });
      setPois(list);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const handlePickPOI = useCallback(
    (poi: LocationPOI) => {
      const loc = poi.location || '';
      if (!loc.includes(',')) return;
      const [lngStr, latStr] = loc.split(',', 2);
      const lng = Number(lngStr);
      const lat = Number(latStr);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

      const next = { latitude: lat, longitude: lng };
      setSelectedPOI(poi);
      setTarget(next);
      setAddress(poi.address || '');
      mapRef.current?.moveCamera?.({ target: next, zoom: 16 }, 300);
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (!target) return;
    const location = `${target.longitude},${target.latitude}`;
    const payload: LocationPOI = {
      name: selectedPOI?.name || '选定位置',
      address: address || selectedPOI?.address || '',
      location,
      latitude: target.latitude,
      longitude: target.longitude,
      id: selectedPOI?.id,
      tel: selectedPOI?.tel,
      distance: selectedPOI?.distance,
    };
    route.params.onSelect(payload);
    navigation.goBack();
  }, [address, navigation, route.params, selectedPOI, target]);

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.mapWeb}>
          <Text style={styles.mapWebText}>Web 端不支持原生地图选址</Text>
        </View>
      );
    }
    const { MapView } = require('react-native-amap3d');
    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        myLocationEnabled
        myLocationButtonEnabled
        scaleControlsEnabled={false}
        compassEnabled={false}
        initialCameraPosition={{
          target: target || { latitude: 39.909187, longitude: 116.397451 },
          zoom: target ? 16 : 12,
        }}
        onCameraIdle={onCameraIdle}
        onLocation={({ nativeEvent }: any) => {
          if (target) return;
          if (!nativeEvent?.coords) return;
          const next = {
            latitude: nativeEvent.coords.latitude,
            longitude: nativeEvent.coords.longitude,
          };
          setTarget(next);
          mapRef.current?.moveCamera?.({ target: next, zoom: 16 }, 0);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>选择位置</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmButtonText}>确定</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索周边（如：咖啡/餐厅/地铁）"
            placeholderTextColor="#999"
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.85}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrap}>
        {renderMap()}
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <View style={styles.centerPin} />
          <View style={styles.centerPinStem} />
        </View>
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle} numberOfLines={1}>
            {address || (selectedPOI?.address ?? '') || '正在解析地址…'}
          </Text>
          <Text style={styles.locationSub} numberOfLines={1}>
            {selectedPOI?.name ? selectedPOI.name : centerText}
          </Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>候选地点</Text>
        {loading ? <ActivityIndicator size="small" color="#1A1A1A" /> : null}
      </View>

      <FlatList
        data={pois}
        keyExtractor={(item, idx) => `${item.id || 'poi'}-${idx}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const active = selectedPOI?.id && item.id === selectedPOI.id;
          return (
            <TouchableOpacity style={[styles.poiItem, active && styles.poiItemActive]} onPress={() => handlePickPOI(item)} activeOpacity={0.85}>
              <View style={styles.poiTextWrap}>
                <Text style={styles.poiName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.poiAddr} numberOfLines={1}>
                  {item.address || '—'}
                </Text>
              </View>
              {item.distance ? <Text style={styles.poiDistance}>{String(item.distance)}m</Text> : null}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  confirmButton: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    width: 74,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  mapWrap: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  map: {
    flex: 1,
  },
  mapWeb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapWebText: {
    color: '#666',
  },
  centerPinWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -7,
    marginTop: -22,
    alignItems: 'center',
  },
  centerPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  centerPinStem: {
    width: 2,
    height: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 1,
    marginTop: 2,
  },
  locationCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  locationSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#666',
  },
  listHeader: {
    marginTop: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeaderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 8,
    gap: 10,
  },
  poiItemActive: {
    borderColor: '#1A1A1A',
  },
  poiTextWrap: {
    flex: 1,
  },
  poiName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  poiAddr: {
    marginTop: 2,
    fontSize: 11,
    color: '#666',
  },
  poiDistance: {
    fontSize: 11,
    color: '#666',
    fontWeight: '700',
  },
});
