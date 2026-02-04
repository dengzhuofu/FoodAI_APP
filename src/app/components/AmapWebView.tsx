import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { CONFIG } from '../../config';

export type AmapPoint = { latitude: number; longitude: number };

type AmapMode = 'picker' | 'route' | 'preview';

type AmapWebViewMessage =
  | { type: 'center'; latitude: number; longitude: number }
  | { type: 'location'; latitude: number; longitude: number }
  | { type: 'error'; message: string };

export interface AmapWebViewProps {
  mode: AmapMode;
  initialCenter?: AmapPoint;
  center?: AmapPoint;
  destination?: AmapPoint;
  origin?: AmapPoint;
  polylines?: Array<{ points: AmapPoint[]; color?: string; width?: number }>;
  onCenterChange?: (point: AmapPoint) => void;
  onLocation?: (point: AmapPoint) => void;
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function AmapWebView(props: AmapWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const { mode, initialCenter, center, destination, origin, polylines, onCenterChange, onLocation } = props;
  const [loaded, setLoaded] = useState(false);

  const html = useMemo(() => {
    const key = CONFIG.AMAP_JS_KEY || '';
    const security = CONFIG.AMAP_SECURITY_CODE || '';
    const init = initialCenter || { latitude: 39.909187, longitude: 116.397451 };
    const centerLng = Number(init.longitude) || 116.397451;
    const centerLat = Number(init.latitude) || 39.909187;
    const isRoute = mode === 'route';
    const isPicker = mode === 'picker';
    const isPreview = mode === 'preview';

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; }
      #map { height: 100%; width: 100%; }
      .pin {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 14px;
        height: 14px;
        transform: translate(-50%, -100%);
        background: #ff4d4f;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 6px 16px rgba(0,0,0,0.18);
        z-index: 9;
      }
      .pin-stem {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 2px;
        height: 18px;
        transform: translate(-50%, -6px);
        background: rgba(0,0,0,0.25);
        z-index: 8;
      }
    </style>
    <script>
      (function() {
        if (${JSON.stringify(Boolean(security))}) {
          window._AMapSecurityConfig = { securityJsCode: ${JSON.stringify(security)} };
        }
      })();
    </script>
    <script src="https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geolocation"></script>
  </head>
  <body>
    <div id="root">
      <div id="map"></div>
      ${isPicker ? '<div class="pin"></div><div class="pin-stem"></div>' : ''}
    </div>
    <script>
      (function() {
        function post(payload) {
          try {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          } catch (e) {}
        }
        function toPoint(lng, lat) {
          return { longitude: Number(lng), latitude: Number(lat) };
        }

        if (!window.AMap) {
          post({ type: 'error', message: 'AMap JS API 加载失败' });
          return;
        }

        var map = new AMap.Map('map', {
          zoom: ${isPreview ? 15 : isRoute ? 14 : 16},
          center: [${centerLng}, ${centerLat}],
          dragEnable: ${isPreview ? 'false' : 'true'},
          zoomEnable: ${isPreview ? 'false' : 'true'},
          rotateEnable: false,
          pitchEnable: false,
          jogEnable: false
        });

        function emitCenter() {
          var c = map.getCenter();
          if (!c) return;
          post({ type: 'center', longitude: c.lng, latitude: c.lat });
        }

        if (${isPicker ? 'true' : 'false'}) {
          map.on('moveend', emitCenter);
          map.on('zoomend', emitCenter);
          map.on('click', function(e) {
            if (!e || !e.lnglat) return;
            map.setCenter(e.lnglat);
            post({ type: 'center', longitude: e.lnglat.lng, latitude: e.lnglat.lat });
          });
          emitCenter();
        }

        function addMarker(lnglat, color) {
          if (!lnglat) return null;
          var marker = new AMap.Marker({
            position: lnglat,
            offset: new AMap.Pixel(-7, -7),
            content: '<div style="width:14px;height:14px;border-radius:7px;background:'+color+';border:2px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,0.18)"></div>'
          });
          marker.setMap(map);
          return marker;
        }

        var originMarker = null;
        var destMarker = null;
        var polylineList = [];

        function clearPolylines() {
          for (var i = 0; i < polylineList.length; i++) {
            polylineList[i].setMap(null);
          }
          polylineList = [];
        }

        function setRouteData(next) {
          try {
            if (next.originLngLat) {
              if (!originMarker) originMarker = addMarker(next.originLngLat, '#1677FF');
              else originMarker.setPosition(next.originLngLat);
            }
            if (next.destLngLat) {
              if (!destMarker) destMarker = addMarker(next.destLngLat, '#ff4d4f');
              else destMarker.setPosition(next.destLngLat);
            }
            clearPolylines();
            if (next.polylines && next.polylines.length) {
              next.polylines.forEach(function(l) {
                var pl = new AMap.Polyline({
                  path: l.points || [],
                  strokeColor: l.color || '#1677FF',
                  strokeWeight: l.width || 5,
                  strokeOpacity: 0.95,
                  showDir: false
                });
                pl.setMap(map);
                polylineList.push(pl);
              });
            }
            if (next.fitBounds) {
              var bounds = new AMap.Bounds();
              if (next.originLngLat) bounds.extend(next.originLngLat);
              if (next.destLngLat) bounds.extend(next.destLngLat);
              map.setBounds(bounds, false, [40, 40, 40, 40]);
            }
          } catch (e) {}
        }

        window.__setRouteData = setRouteData;
        window.__setCenter = function(lng, lat, zoom) {
          try {
            var next = new AMap.LngLat(Number(lng), Number(lat));
            if (Number(zoom)) map.setZoom(Number(zoom));
            map.setCenter(next);
          } catch (e) {}
        };

        AMap.plugin(['AMap.Geolocation'], function() {
          try {
            var geolocation = new AMap.Geolocation({
              enableHighAccuracy: true,
              timeout: 10000,
              convert: true,
              showButton: false,
              showMarker: false,
              showCircle: false
            });
            geolocation.getCurrentPosition(function(status, result) {
              if (status === 'complete' && result && result.position) {
                var p = result.position;
                post({ type: 'location', longitude: p.lng, latitude: p.lat });
                if (${isPicker ? 'true' : 'false'}) {
                  map.setCenter(p);
                  emitCenter();
                }
              }
            });
          } catch (e) {}
        });
      })();
    </script>
  </body>
</html>`;
  }, [initialCenter, mode]);

  const injectedCenterJs = useMemo(() => {
    if (!center) return null;
    const lng = Number(center.longitude);
    const lat = Number(center.latitude);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    const zoom = mode === 'picker' ? 16 : mode === 'route' ? 14 : 15;
    return `try { if (window.__setCenter) window.__setCenter(${lng}, ${lat}, ${zoom}); } catch (e) {} true;`;
  }, [center, mode]);

  const injectedRouteJs = useMemo(() => {
    if (mode !== 'route' && mode !== 'preview') return null;
    const safePolylines = (polylines || []).map((l) => ({
      points: (l.points || []).map((p) => [p.longitude, p.latitude]),
      color: l.color || '#1677FF',
      width: l.width || 5,
    }));
    const originLngLat = origin ? [origin.longitude, origin.latitude] : null;
    const destLngLat = destination ? [destination.longitude, destination.latitude] : null;
    const fitBounds = mode === 'route' ? 'true' : 'false';
    return `try { if (window.__setRouteData) window.__setRouteData({ originLngLat: ${JSON.stringify(
      originLngLat
    )}, destLngLat: ${JSON.stringify(destLngLat)}, polylines: ${JSON.stringify(safePolylines)}, fitBounds: ${fitBounds} }); } catch (e) {} true;`;
  }, [mode, origin, destination, polylines]);

  useEffect(() => {
    if (!loaded) return;
    if (injectedRouteJs) {
      webViewRef.current?.injectJavaScript(injectedRouteJs);
    }
  }, [loaded, injectedRouteJs]);

  useEffect(() => {
    if (!loaded) return;
    if (injectedCenterJs) {
      webViewRef.current?.injectJavaScript(injectedCenterJs);
    }
  }, [loaded, injectedCenterJs]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>Web 端不支持地图</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      originWhitelist={['*']}
      onMessage={(event: WebViewMessageEvent) => {
        const data = safeJsonParse<AmapWebViewMessage>(event.nativeEvent.data);
        if (!data) return;
        if (data.type === 'center') {
          onCenterChange?.({ latitude: data.latitude, longitude: data.longitude });
          return;
        }
        if (data.type === 'location') {
          onLocation?.({ latitude: data.latitude, longitude: data.longitude });
          return;
        }
      }}
      onLoadStart={() => setLoaded(false)}
      onLoadEnd={() => setLoaded(true)}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      setSupportMultipleWindows={false}
      scrollEnabled={false}
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  webFallbackText: {
    color: '#666',
  },
});
