import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { routePlan, RouteResult, RouteType } from '../../../api/maps';
import { theme } from '../../styles/theme';

type RoutePlanRouteProp = RouteProp<RootStackParamList, 'RoutePlan'>;

const COLORS: Record<Exclude<RouteType, 'transit'>, string> = {
  walking: '#34C759',
  riding: '#FF9500',
  driving: '#007AFF',
};

export default function RoutePlanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RoutePlanRouteProp>();

  const destination = route.params.destination;
  const [origin, setOrigin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedType, setSelectedType] = useState<RouteType>('driving');
  const [routes, setRoutes] = useState<Partial<Record<RouteType, RouteResult | null>>>({});
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<any>(null);

  const hasAnyRoute = useMemo(() => {
    return Boolean(routes.walking || routes.riding || routes.driving || routes.transit);
  }, [routes]);

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

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!origin) return;
      setLoading(true);
      try {
        const originStr = `${origin.longitude},${origin.latitude}`;
        const destinationStr = `${destination.longitude},${destination.latitude}`;
        const [walking, riding, driving, transit] = await Promise.all([
          routePlan({ type: 'walking', origin: originStr, destination: destinationStr }),
          routePlan({ type: 'riding', origin: originStr, destination: destinationStr }),
          routePlan({ type: 'driving', origin: originStr, destination: destinationStr, strategy: 0 }),
          routePlan({ type: 'transit', origin: originStr, destination: destinationStr }),
        ]);
        setRoutes({ walking, riding, driving, transit });
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [origin, destination.latitude, destination.longitude]);

  useEffect(() => {
    if (!origin) return;
    if (Platform.OS === 'web') return;
    const mid = {
      latitude: (origin.latitude + destination.latitude) / 2,
      longitude: (origin.longitude + destination.longitude) / 2,
    };
    mapRef.current?.moveCamera?.(
      {
        target: mid,
        zoom: 13,
      },
      300
    );
  }, [origin, destination.latitude, destination.longitude]);

  const renderTabs = () => {
    const tab: Array<{ type: RouteType; label: string }> = [
      { type: 'walking', label: '步行' },
      { type: 'riding', label: '骑行' },
      { type: 'driving', label: '驾车' },
      { type: 'transit', label: '公交' },
    ];

    return (
      <View style={styles.tabs}>
        {tab.map((t) => {
          const active = t.type === selectedType;
          const summary = routes[t.type];
          const sub = summary ? `${summary.distance} · ${summary.duration}` : loading ? '计算中…' : '—';
          return (
            <TouchableOpacity
              key={t.type}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => setSelectedType(t.type)}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              <Text style={[styles.tabSub, active && styles.tabSubActive]} numberOfLines={1}>
                {sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDetails = () => {
    const selected = routes[selectedType];
    if (loading && !hasAnyRoute) {
      return (
        <View style={styles.panelLoading}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.panelLoadingText}>正在规划路线…</Text>
        </View>
      );
    }
    if (!selected) {
      return (
        <View style={styles.panelEmpty}>
          <Text style={styles.panelEmptyText}>暂无路线数据</Text>
        </View>
      );
    }

    const durationText =
      selectedType === 'driving' && selected.duration_in_traffic_seconds
        ? `${selected.duration}（含路况）`
        : selected.duration;

    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>路线详情</Text>
            <Text style={styles.panelMeta}>
              {selected.distance} · {durationText}
            </Text>
          </View>
        </View>
        <ScrollView style={styles.steps} contentContainerStyle={styles.stepsContent} showsVerticalScrollIndicator={false}>
          {selected.steps?.length ? (
            selected.steps.map((s, idx) => (
              <View key={`${idx}`} style={styles.stepRow}>
                <Text style={styles.stepIndex}>{idx + 1}</Text>
                <View style={styles.stepBody}>
                  <Text style={styles.stepInstruction}>{s.instruction || '—'}</Text>
                  <Text style={styles.stepSubLine} numberOfLines={1}>
                    {(s.road ? s.road : '—')} · {s.distance_meters}m
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.panelEmptyText}>暂无明细</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderMap = () => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.mapWeb}>
          <Text style={styles.mapWebText}>Web 端不支持原生地图</Text>
        </View>
      );
    }
    const { MapView, Marker, Polyline } = require('react-native-amap3d');

    const walking = routes.walking;
    const riding = routes.riding;
    const driving = routes.driving;

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        myLocationEnabled
        myLocationButtonEnabled
        zoomControlsEnabled={false}
        scaleControlsEnabled={false}
        compassEnabled={false}
        initialCameraPosition={{
          target: { latitude: destination.latitude, longitude: destination.longitude },
          zoom: 14,
        }}
        onLocation={({ nativeEvent }: any) => {
          if (!nativeEvent?.coords) return;
          const next = {
            latitude: nativeEvent.coords.latitude,
            longitude: nativeEvent.coords.longitude,
          };
          setOrigin((prev) => prev || next);
        }}
      >
        <Marker position={{ latitude: destination.latitude, longitude: destination.longitude }}>
          <View style={styles.destinationMarker} />
        </Marker>
        {origin && (
          <Marker position={{ latitude: origin.latitude, longitude: origin.longitude }}>
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {walking?.path?.length ? (
          <Polyline
            points={walking.path}
            width={selectedType === 'walking' ? 7 : 4}
            color={COLORS.walking}
          />
        ) : null}
        {riding?.path?.length ? (
          <Polyline
            points={riding.path}
            width={selectedType === 'riding' ? 7 : 4}
            color={COLORS.riding}
          />
        ) : null}
        {driving?.path?.length ? (
          <Polyline
            points={driving.path}
            width={selectedType === 'driving' ? 7 : 4}
            color={COLORS.driving}
          />
        ) : null}
      </MapView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>路线规划</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {destination.address || '目的地'}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.mapWrap}>{renderMap()}</View>
      {renderTabs()}
      {renderDetails()}
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
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    width: 40,
  },
  mapWrap: {
    height: 320,
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
  tabs: {
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  tabItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  tabItemActive: {
    borderColor: '#1A1A1A',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  tabLabelActive: {
    color: '#1A1A1A',
  },
  tabSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#666',
  },
  tabSubActive: {
    color: '#111',
  },
  panel: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  panelMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
  steps: {
    flex: 1,
  },
  stepsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    fontSize: 12,
  },
  stepBody: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 18,
  },
  stepSubLine: {
    marginTop: 2,
    fontSize: 11,
    color: '#666',
  },
  panelLoading: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  panelLoadingText: {
    color: '#666',
    fontSize: 12,
  },
  panelEmpty: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelEmptyText: {
    color: '#666',
    fontSize: 12,
  },
  destinationMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userMarkerOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,122,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
