/* Spotify Web Playback SDK type declarations */

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyWebPlaybackTrack {
  uri: string;
  id: string;
  type: 'track' | 'episode' | 'ad';
  name: string;
  duration_ms: number;
  media_type: 'audio' | 'video';
  artists: Array<{ uri: string; name: string }>;
  album: {
    uri: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
}

interface SpotifyWebPlaybackState {
  context: {
    uri: string | null;
    metadata: Record<string, string> | null;
  };
  disallows: {
    pausing?: boolean;
    peeking_next?: boolean;
    peeking_prev?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: 0 | 1 | 2;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyWebPlaybackTrack;
    previous_tracks: SpotifyWebPlaybackTrack[];
    next_tracks: SpotifyWebPlaybackTrack[];
  };
}

interface SpotifyDeviceReady {
  device_id: string;
}

declare namespace Spotify {
  class Player {
    constructor(options: SpotifyPlayerOptions);
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<SpotifyWebPlaybackState | null>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    activateElement(): Promise<void>;
    addListener(
      event: 'ready',
      callback: (data: SpotifyDeviceReady) => void,
    ): boolean;
    addListener(
      event: 'not_ready',
      callback: (data: SpotifyDeviceReady) => void,
    ): boolean;
    addListener(
      event: 'player_state_changed',
      callback: (state: SpotifyWebPlaybackState | null) => void,
    ): boolean;
    addListener(
      event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error',
      callback: (error: { message: string }) => void,
    ): boolean;
    removeListener(event: string): boolean;
  }
}

interface Window {
  Spotify: typeof Spotify;
  onSpotifyWebPlaybackSDKReady: () => void;
}
