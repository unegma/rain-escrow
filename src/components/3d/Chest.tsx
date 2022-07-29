import * as THREE from 'three'
import React, {useEffect, useRef, useState} from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

const CHEST_URL = `${process.env.REACT_APP_CDN_BASE_URL}/chest-transformed.glb`

type GLTFResult = GLTF & {
  nodes: {
    Chest_Wooden_Lid_Chest_Wooden_0: THREE.Mesh
    Chest_Wooden_Base_Chest_Wooden_0: THREE.Mesh
    ['shadow_1_Material_#293_0']: THREE.Mesh
  }
  materials: {
    Chest_Wooden: THREE.MeshStandardMaterial
    Material_293: THREE.MeshStandardMaterial
  }
}

type ActionName = 'Take 001'
type GLTFActions = Record<ActionName, THREE.AnimationAction>

export default function Chest({ setModalOpen, ...props }: any) {
  const group = useRef<THREE.Group>(null)
  const { nodes, materials, animations } = useGLTF(CHEST_URL, 'https://www.gstatic.com/draco/versioned/decoders/1.4.1/') as GLTFResult
  // @ts-ignore
  const { actions } = useAnimations<GLTFActions>(animations, group)

  const [hovered, setHover] = useState(false)
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  function handleClick() {
    // @ts-ignore
    if(actions['Take 001']) {
      // @ts-ignore
      actions['Take 001'].play(() => {
      });
    }

    setTimeout(() => {
      setModalOpen(true);
      // @ts-ignore
      actions['Take 001'].stop();
    }, 1000)
  }

  return (
  <group ref={group} {...props} dispose={null} onClick={() => handleClick()} onPointerOver={(e) => (e.stopPropagation(), setHover(true))} onPointerOut={(e) => setHover(false)}>
    {/*<group ref={group} {...props} dispose={null}>*/}
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[0,0,0]}>
          <group name="ChestsFBX" rotation={[0, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Chests" position={[4.68, 0, -10.74]} rotation={[0, 0, 0]}>
                  <group name="Chest_Wooden" position={[-24.02, -1.41, 19.71]} rotation={[0, 0, 0.03]}>
                    <group name="Chest_Wooden_Base">
                      <group name="Chest_Wooden_Lid" position={[142.44, 0, 183.85]}>
                        <group name="Object_10" position={[-130.39, 0, 86.57]}>
                          <mesh name="Chest_Wooden_Lid_Chest_Wooden_0" castShadow receiveShadow geometry={nodes.Chest_Wooden_Lid_Chest_Wooden_0.geometry} material={materials.Chest_Wooden} position={[-1.36, 0, 2.13]} />
                        </group>
                      </group>
                      <group name="Object_7" position={[0, 0, 108.53]}>
                        <mesh name="Chest_Wooden_Base_Chest_Wooden_0" castShadow receiveShadow geometry={nodes.Chest_Wooden_Base_Chest_Wooden_0.geometry} material={materials.Chest_Wooden} position={[-6.33, -0.04, -34.49]} />
                      </group>
                    </group>
                  </group>
                  <group name="shadow_1" position={[-11.21, -8.04, 23]} rotation={[0, 0, 0.03]} scale={[1.11, 1, 1]}>
                    <mesh name="shadow_1_Material_#293_0" castShadow receiveShadow geometry={nodes['shadow_1_Material_#293_0'].geometry} material={materials.Material_293} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(CHEST_URL)
