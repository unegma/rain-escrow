import {useRef} from "react";
import {useGLTF} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";

const FAUCET_URL = 'https://assets.unegma.net/unegma.work/rain-erc20-faucet.unegma.work/faucet.gltf';

export default function Faucet({...props}) {
  const ref = useRef<any>();
  const { nodes, materials }: any = useGLTF(FAUCET_URL);

  console.log(nodes, materials);

  useFrame((state: any) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.set(0.1 + Math.cos(t / 4.5) / 10, Math.sin(t / 4) / 4, 0.3 - (1 + Math.sin(t / 4)) / 8)
    ref.current.position.y = (1 + Math.sin(t / 2)) / 10
  })

  return (
    <group {...props} dispose={null}>
      <group ref={ref}>
        <group position={[-0.16, 0, -0.22]} rotation={[0, -Math.PI / 2, 0]}>
          {/*<mesh castShadow geometry={nodes.Object_115.geometry} material={materials['Material.002']} />*/}
          {/*<mesh castShadow receiveShadow geometry={nodes.Object_119.geometry} material={materials['Material.001']} />*/}
          <mesh castShadow receiveShadow geometry={nodes.faucet.geometry} material={materials['Material.001']} />
        </group>
      </group>
    </group>
  )
}
