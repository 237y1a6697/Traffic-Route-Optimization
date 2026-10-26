import { useState, useEffect, useRef, useCallback } from 'react';

export type GpsTrackingStatus = 
  | 'idle' 
  | 'acquiring' 
  | 'active' 
  | 'denied' 
  | 'unavailable' 
  | 'timeout' 
  | 'unsupported'
  | 'error';

export interface GpsPosition {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  heading: number | null; // in degrees (0 - 360)
  speed: number | null; // in m/s
  altitude: number | null;
  timestamp: number;
}

export interface UseGpsTrackerReturn {
  isTracking: boolean;
  status: GpsTrackingStatus;
  position: GpsPosition | null;
  errorMsg: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  toggleTracking: () => void;
}

export function useGpsTracker(): UseGpsTrackerReturn {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [status, setStatus] = useState<GpsTrackingStatus>('idle');
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setStatus('idle');
    setErrorMsg(null);
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported');
      setErrorMsg('Geolocation is not supported by your browser environment.');
      return;
    }

    // Clear any existing watcher first
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(true);
    setStatus('acquiring');
    setErrorMsg(null);

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed, altitude } = pos.coords;
      
      setPosition({
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        heading: typeof heading === 'number' && !isNaN(heading) ? heading : null,
        speed: typeof speed === 'number' && !isNaN(speed) ? Math.max(0, Math.round(speed * 3.6)) : null, // convert m/s to km/h
        altitude: typeof altitude === 'number' && !isNaN(altitude) ? Math.round(altitude) : null,
        timestamp: pos.timestamp
      });

      setStatus('active');
      setErrorMsg(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      let friendlyMsg = 'An unknown GPS error occurred.';
      let newStatus: GpsTrackingStatus = 'error';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          friendlyMsg = 'GPS location permission was denied. Please grant location access in your browser site settings.';
          newStatus = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          friendlyMsg = 'Location information is currently unavailable. Please check that device GPS / location services are enabled.';
          newStatus = 'unavailable';
          break;
        case error.TIMEOUT:
          friendlyMsg = 'GPS satellite fix timed out. Retrying high-accuracy signal acquisition...';
          newStatus = 'timeout';
          break;
      }

      setErrorMsg(friendlyMsg);
      setStatus(newStatus);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
  }, []);

  const toggleTracking = useCallback(() => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [isTracking, startTracking, stopTracking]);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    isTracking,
    status,
    position,
    errorMsg,
    startTracking,
    stopTracking,
    toggleTracking
  };
}
