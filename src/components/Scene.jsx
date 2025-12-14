import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import TrackShape from './TrackShape'

const Scene = ({ tracks, activeTrack }) => {
  // Calculate positions for tracks (spread from left to right)
  const getTrackPosition = (index, total) => {
    const spacing = 2.5
    const startX = -((total - 1) * spacing) / 2
    return [startX + index * spacing, 1, 0]
  }

  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {tracks.map((track, index) => (
        <TrackShape
          key={track.id}
          track={track}
          position={getTrackPosition(index, tracks.length)}
          isActive={activeTrack === track.id}
        />
      ))}
      
      <OrbitControls />
    </Canvas>
  )
}

export default Scene
