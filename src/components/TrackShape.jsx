import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const TrackShape = ({ track, position, isActive }) => {
  const meshRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x += delta * 0.2
      
      // Smooth scale interpolation
      const targetScale = isActive ? 1.5 : 1
      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1)
    }
  })

  const renderShape = () => {
    switch (track.shape) {
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />
      case 'box':
        return <boxGeometry args={[0.8, 0.8, 0.8]} />
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />
      case 'torus':
        return <torusGeometry args={[0.4, 0.2, 16, 32]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.4, 0.4, 1, 32]} />
      case 'octahedron':
        return <octahedronGeometry args={[0.6]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.5]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[0.5]} />
      default:
        return <sphereGeometry args={[0.5, 32, 32]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      {renderShape()}
      <meshStandardMaterial 
        color={track.color} 
        emissive={track.color}
        emissiveIntensity={isActive ? 0.5 : 0.1}
      />
    </mesh>
  )
}

export default TrackShape
