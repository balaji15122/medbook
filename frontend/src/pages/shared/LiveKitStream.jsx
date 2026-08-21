import React from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

export const LiveKitStream = ({ token, serverUrl, onEndCall }) => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={onEndCall}
        data-lk-theme="default"
        style={{ flex: 1 }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitStream;
