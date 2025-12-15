import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
// TrackShape removed

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
  {/* TrackShape removed */}
      
      <OrbitControls />
    </Canvas>
  )
}

export default Scene
