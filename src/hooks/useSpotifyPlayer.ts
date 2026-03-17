import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpotifyTrack } from './useSpotify';

const API_BASE = (import.meta.env.VITE_API_PROXY_URL as string) ?? 'http://localhost:3001';
const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

interface PlayerState {
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  deviceId: string | null;
}

interface UseSpotifyPlayerOptions {
  getToken: () => Promise<string | null>;
  enabled: boolean;
}

export function useSpotifyPlayer({ getToken, enabled }: UseSpotifyPlayerOptions) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    position: 0,
    duration: 0,
    deviceId: null,
  });
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);

  const playerRef = useRef<Spotify.Player | null>(null);
  const positionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackMapRef = useRef<Map<string, SpotifyTrack>>(new Map());

  // Load SDK script once
  useEffect(() => {
    if (!enabled) return;

    // Check if already loaded
    if (window.Spotify) {
      setSdkReady(true);
      return;
    }

    // Check if script already exists
    if (document.querySelector(`script[src="${SDK_URL}"]`)) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      setSdkReady(true);
    };

    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    document.head.appendChild(script);
  }, [enabled]);

  // Initialize player when SDK ready
  useEffect(() => {
    if (!sdkReady || !enabled) return;

    const player = new Spotify.Player({
      name: 'WorkIn Player',
      getOAuthToken: (cb) => {
        getToken().then((token) => {
          if (token) cb(token);
        });
      },
      volume: 0.8,
    });

    player.addListener('ready', ({ device_id }: SpotifyDeviceReady) => {
      console.log('[SpotifyPlayer] Ready with device:', device_id);
      setPlayerState((prev) => ({ ...prev, deviceId: device_id }));
      setError(null);
    });

    player.addListener('not_ready', ({ device_id }: SpotifyDeviceReady) => {
      console.log('[SpotifyPlayer] Device not ready:', device_id);
      setPlayerState((prev) => ({ ...prev, deviceId: null }));
    });

    player.addListener('player_state_changed', (state: SpotifyWebPlaybackState | null) => {
      if (!state) {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          currentTrack: null,
          position: 0,
          duration: 0,
        }));
        return;
      }

      const sdkTrack = state.track_window.current_track;
      // Try to match against our track map for full metadata, fall back to SDK data
      const mapped = trackMapRef.current.get(sdkTrack.id);
      const currentTrack: SpotifyTrack = mapped ?? {
        id: sdkTrack.id,
        uri: sdkTrack.uri,
        name: sdkTrack.name,
        artist: sdkTrack.artists.map((a) => a.name).join(', '),
        album: sdkTrack.album.name,
        albumArt: sdkTrack.album.images[0]?.url ?? '',
        spotifyUrl: `https://open.spotify.com/track/${sdkTrack.id}`,
        previewUrl: null,
        durationMs: sdkTrack.duration_ms,
      };

      setPlayerState((prev) => ({
        ...prev,
        isPlaying: !state.paused,
        currentTrack,
        position: state.position,
        duration: state.duration,
      }));
    });

    player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] init error:', message);
      setError('Failed to initialize player');
    });

    player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] auth error:', message);
      setError('Spotify authentication failed — try reconnecting in Settings');
    });

    player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] account error:', message);
      setPremiumRequired(true);
      setError('Spotify Premium is required for in-app playback');
    });

    player.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('[SpotifyPlayer] playback error:', message);
      setError('Playback error — try again');
    });

    player.connect();
    playerRef.current = player;

    return () => {
      player.disconnect();
      playerRef.current = null;
      if (positionInterval.current) clearInterval(positionInterval.current);
    };
  }, [sdkReady, enabled, getToken]);

  // Position tracking when playing
  useEffect(() => {
    if (positionInterval.current) {
      clearInterval(positionInterval.current);
      positionInterval.current = null;
    }

    if (playerState.isPlaying) {
      positionInterval.current = setInterval(() => {
        setPlayerState((prev) => ({
          ...prev,
          position: Math.min(prev.position + 500, prev.duration),
        }));
      }, 500);
    }

    return () => {
      if (positionInterval.current) clearInterval(positionInterval.current);
    };
  }, [playerState.isPlaying]);

  // Play a list of tracks starting at a specific index
  const play = useCallback(async (tracks: SpotifyTrack[], startIndex = 0) => {
    const token = await getToken();
    if (!token || !playerState.deviceId) return;

    // Cache tracks for metadata lookup
    const map = new Map<string, SpotifyTrack>();
    for (const t of tracks) map.set(t.id, t);
    trackMapRef.current = map;

    const uris = tracks.map((t) => t.uri);

    try {
      const res = await fetch(`${API_BASE}/api/spotify/play`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          device_id: playerState.deviceId,
          uris,
          offset: { position: startIndex },
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; needsRefresh?: boolean };
        if (res.status === 403) {
          setPremiumRequired(true);
          setError('Spotify Premium is required for in-app playback');
        } else {
          setError(data.error ?? 'Failed to start playback');
        }
      }
    } catch {
      setError('Failed to start playback');
    }
  }, [getToken, playerState.deviceId]);

  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.togglePlay();
  }, []);

  const nextTrack = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.nextTrack();
  }, []);

  const previousTrack = useCallback(async () => {
    if (!playerRef.current) return;
    await playerRef.current.previousTrack();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    if (!playerRef.current) return;
    await playerRef.current.seek(positionMs);
    setPlayerState((prev) => ({ ...prev, position: positionMs }));
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    if (!playerRef.current) return;
    await playerRef.current.setVolume(volume);
  }, []);

  return {
    ...playerState,
    sdkReady,
    error,
    premiumRequired,
    play,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };
}
