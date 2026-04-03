import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

type LocationData = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
};

type GeoAddress = {
  city: string | null;
  region: string | null;
  country: string | null;
  street: string | null;
  postalCode: string | null;
};

function formatCoord(val: number, pos: string, neg: string): string {
  const dir = val >= 0 ? pos : neg;
  const abs = Math.abs(val);
  const deg = Math.floor(abs);
  const minRaw = (abs - deg) * 60;
  const min = Math.floor(minRaw);
  const sec = ((minRaw - min) * 60).toFixed(1);
  return `${deg}\u00B0${min}'${sec}"${dir}`;
}

function ScanlineBar() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: true }),
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 60] });
  return (
    <Animated.View
      style={[styles.scanline, { transform: [{ translateY }] }]}
    />
  );
}

function PulsingDot({ active }: { active: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      anim.stopAnimation();
      anim.setValue(1);
    }
  }, [active]);
  return (
    <Animated.View
      style={[
        styles.statusDot,
        { backgroundColor: active ? Colors.accent : Colors.textMuted, opacity: anim },
      ]}
    />
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, mono && styles.monoValue]}>{value}</Text>
    </View>
  );
}

export default function TravelAssistantScreen() {
  const insets = useSafeAreaInsets();
  const webTopPad = Platform.OS === 'web' ? 67 : 0;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<GeoAddress | null>(null);
  const [permStatus, setPermStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [tracking, setTracking] = useState(false);
  const [travelNotes, setTravelNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermStatus('denied');
        setErrorMsg('Location permission denied. Enable in Settings.');
        return;
      }
      setPermStatus('granted');
      setErrorMsg(null);

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const locData: LocationData = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        altitude: pos.coords.altitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      };
      setLocation(locData);

      try {
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (geo) {
          setAddress({
            city: geo.city,
            region: geo.region,
            country: geo.country,
            street: geo.street,
            postalCode: geo.postalCode,
          });
        }
      } catch {
        setAddress(null);
      }
    } catch (err) {
      setErrorMsg('Failed to get location. Try again.');
    }
  }, []);

  const toggleTracking = useCallback(async () => {
    if (tracking && watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
      setTracking(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (permStatus !== 'granted') {
      await requestLocation();
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTracking(true);

    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        });
      },
    );
    watchRef.current = sub;
  }, [tracking, permStatus, requestLocation]);

  useEffect(() => {
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const handleShareLocation = async () => {
    if (!location) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const lat = formatCoord(location.latitude, 'N', 'S');
    const lng = formatCoord(location.longitude, 'E', 'W');
    const addr = address
      ? [address.street, address.city, address.region, address.country].filter(Boolean).join(', ')
      : 'Unknown';
    const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

    let message = `FIELDPRESS LOCATION DISPATCH\n\n`;
    message += `Coordinates: ${lat} ${lng}\n`;
    message += `Address: ${addr}\n`;
    message += `Altitude: ${location.altitude ? `${location.altitude.toFixed(0)}m` : 'N/A'}\n`;
    message += `Accuracy: ${location.accuracy ? `\u00B1${location.accuracy.toFixed(0)}m` : 'N/A'}\n`;
    message += `Time: ${new Date(location.timestamp).toISOString()}\n`;
    message += `Map: ${mapsUrl}\n`;
    if (travelNotes.trim()) {
      message += `\nNotes: ${travelNotes.trim()}\n`;
    }

    try {
      await Share.share({ message, title: 'FieldPress Location' });
    } catch {
      // user cancelled
    }
  };

  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcOffset = -now.getTimezoneOffset();
  const offsetH = Math.floor(Math.abs(utcOffset) / 60);
  const offsetM = Math.abs(utcOffset) % 60;
  const offsetStr = `UTC${utcOffset >= 0 ? '+' : '-'}${String(offsetH).padStart(2, '0')}:${String(offsetM).padStart(2, '0')}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopPad }]}>
      <LinearGradient
        colors={['#003300', Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
        >
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </Pressable>
        <Feather name="navigation" size={18} color={Colors.accent} />
        <Text style={styles.headerTitle}>TRAVEL ASSISTANT</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + webBottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="locate" size={16} color={Colors.accent} />
            <Text style={styles.sectionTitle}>GPS POSITION</Text>
            <PulsingDot active={tracking} />
          </View>

          {errorMsg && (
            <View style={styles.errorCard}>
              <Feather name="alert-triangle" size={14} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {location ? (
            <View style={styles.card}>
              <ScanlineBar />
              <InfoRow
                label="LAT"
                value={formatCoord(location.latitude, 'N', 'S')}
                mono
              />
              <InfoRow
                label="LNG"
                value={formatCoord(location.longitude, 'E', 'W')}
                mono
              />
              <InfoRow
                label="ALT"
                value={location.altitude ? `${location.altitude.toFixed(1)}m` : 'N/A'}
                mono
              />
              <InfoRow
                label="ACC"
                value={location.accuracy ? `\u00B1${location.accuracy.toFixed(0)}m` : 'N/A'}
                mono
              />
              {location.speed !== null && location.speed >= 0 && (
                <InfoRow
                  label="SPD"
                  value={`${(location.speed * 3.6).toFixed(1)} km/h`}
                  mono
                />
              )}
              {location.heading !== null && location.heading >= 0 && (
                <InfoRow
                  label="HDG"
                  value={`${location.heading.toFixed(0)}\u00B0`}
                  mono
                />
              )}
              <View style={styles.divider} />
              <InfoRow
                label="FIX"
                value={new Date(location.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                mono
              />
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Feather name="crosshair" size={24} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                Tap GET FIX to acquire GPS coordinates
              </Text>
            </View>
          )}

          <View style={styles.btnRow}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); requestLocation(); }}
              style={({ pressed }) => [styles.actionBtn, styles.fixBtn, pressed && { opacity: 0.7 }]}
            >
              <Feather name="crosshair" size={16} color={Colors.background} />
              <Text style={styles.actionBtnText}>GET FIX</Text>
            </Pressable>
            <Pressable
              onPress={toggleTracking}
              style={({ pressed }) => [
                styles.actionBtn,
                tracking ? styles.stopBtn : styles.trackBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name={tracking ? 'pause' : 'activity'} size={16} color={Colors.background} />
              <Text style={styles.actionBtnText}>{tracking ? 'STOP' : 'TRACK'}</Text>
            </Pressable>
          </View>
        </View>

        {address && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="map-pin" size={16} color={Colors.amber} />
              <Text style={styles.sectionTitle}>REVERSE GEOCODE</Text>
            </View>
            <View style={styles.card}>
              {address.street && <InfoRow label="STREET" value={address.street} />}
              {address.city && <InfoRow label="CITY" value={address.city} />}
              {address.region && <InfoRow label="REGION" value={address.region} />}
              {address.country && <InfoRow label="COUNTRY" value={address.country} />}
              {address.postalCode && <InfoRow label="ZIP" value={address.postalCode} />}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="clock" size={16} color={Colors.cyan} />
            <Text style={styles.sectionTitle}>LOCAL TIME</Text>
          </View>
          <View style={styles.card}>
            <InfoRow
              label="TIME"
              value={now.toLocaleTimeString('en-US', { hour12: false })}
              mono
            />
            <InfoRow label="DATE" value={now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} />
            <InfoRow label="TZ" value={tz} />
            <InfoRow label="OFFSET" value={offsetStr} mono />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={16} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>FIELD DISPATCH NOTES</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="> travel notes, contacts, logistics..."
            placeholderTextColor={Colors.textMuted}
            value={travelNotes}
            onChangeText={setTravelNotes}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
        </View>

        {location && (
          <Pressable
            onPress={handleShareLocation}
            style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
          >
            <Feather name="share-2" size={16} color={Colors.background} />
            <Text style={styles.shareBtnText}>SHARE LOCATION DISPATCH</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'VT323_400Regular',
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 3,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textSecondary,
    letterSpacing: 2,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 2,
    padding: 12,
    gap: 6,
    overflow: 'hidden',
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(57, 255, 20, 0.08)',
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 2,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 49, 49, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 49, 49, 0.3)',
    borderRadius: 2,
    padding: 10,
  },
  errorText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.danger,
    flex: 1,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  infoLabel: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.textMuted,
    letterSpacing: 2,
    width: 80,
  },
  infoValue: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  monoValue: {
    letterSpacing: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 2,
  },
  fixBtn: {
    backgroundColor: Colors.accent,
  },
  trackBtn: {
    backgroundColor: Colors.text,
  },
  stopBtn: {
    backgroundColor: Colors.danger,
  },
  actionBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.background,
    letterSpacing: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: Colors.text,
    minHeight: 100,
    maxHeight: 200,
    letterSpacing: 0.5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    borderRadius: 2,
  },
  shareBtnText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: Colors.background,
    letterSpacing: 2,
  },
});
