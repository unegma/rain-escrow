import React, {Suspense, useEffect} from "react";
import {
  useParams
} from "react-router-dom";
import NavBar from "./NavBar";
import Modal from "./Modal";
import {Canvas, useFrame} from "@react-three/fiber";
import {ContactShadows, Environment, OrbitControls} from "@react-three/drei";
import Faucet from "./Faucet";

import { useRef, useState } from 'react'
import { Selection, Select, EffectComposer, Outline } from '@react-three/postprocessing';

const displayedImage = 'https://assets.unegma.net/unegma.work/rain-escrow-example.unegma.work/vault.jpg';

type tokenViewProps = {
  modalOpen: any
  // reserveName: string, reserveSymbol: string, modalOpen: any,
  setModalOpen: any,  buttonLock: any, tokenAddress: string,
  // reserveInitialSupply: any,
  // redeemableName: any, redeemableSymbol: any, modalOpen: any, setModalOpen: any, initiateBuy: any, buttonLock: any,
  // redeemableTokenAddress: any, staticReservePriceOfRedeemable: any, reserveSymbol: any, consoleData: any,
    consoleColor: any, consoleData: any, initiateClaim: any, claimView: any, setEscrowAddress: any
}

function Box(props: any) {
  const ref = useRef<any>(null)
  const [hovered, hover] = useState(false)
  useFrame((state, delta) => (ref.current.rotation.x = ref.current.rotation.y += delta))
  return (
    <Select enabled={hovered}>
      <mesh ref={ref} {...props} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </Select>
  )
}

// todo rename to escrowView
export default function TokenView({
    modalOpen,
    // reserveName, reserveSymbol, modalOpen, reserveInitialSupply,
    setModalOpen, buttonLock, tokenAddress,
    consoleData, consoleColor, initiateClaim,
    // initiateBuy, buttonLock, tokenAddress,
    // staticReservePriceOfRedeemable, reserveSymbol, consoleData, consoleColor, redeemableInitialSupply
    claimView, setEscrowAddress
  }: tokenViewProps )
{
  let { id } = useParams();

  // set token address by url instead of t= (check line 80 onwards works in app.tsx for getting the tokenData)
  useEffect(() => {
    setEscrowAddress(id);
  }, []);

  return (
    <>
      { claimView && (
        <>
          <NavBar string={`Claim Your Tokens!`} stringRight={`Click the Vault!`} />
          <div className="canvasContainer">
            <Modal
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              // reserveSymbol={reserveSymbol}
              // reserveInitialSupply={reserveInitialSupply}
              // initiateBuy={initiateBuy}
              buttonLock={buttonLock}
              // redeemableTokenAddress={redeemableTokenAddress}
              // staticReservePriceOfRedeemable={staticReservePriceOfRedeemable}
              // redeemableSymbol={redeemableSymbol}
              consoleData={consoleData}
              consoleColor={consoleColor}
              initiateClaim={initiateClaim}
              // tokenAddress={tokenAddress}
            />

            {/*<Canvas onClick={() => {setModalOpen(!modalOpen)}} shadows dpr={[1,2 ]} camera={{ position: [0, 0, 1.1], fov: 50 }}>*/}
            {/*  <ambientLight intensity={2} />*/}
            {/*  <spotLight position={[1, 6, 1.5]} angle={0.2} penumbra={1} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />*/}
            {/*  <spotLight position={[-5, 5, -1.5]} angle={0.03} penumbra={1} intensity={4} castShadow shadow-mapSize={[1024, 1024]} />*/}
            {/*  <spotLight position={[5, 5, -5]} angle={0.3} penumbra={1} intensity={4} castShadow={true} shadow-mapSize={[256, 256]} color="#ffffc0" />*/}
            {/*  <Suspense fallback={null}>*/}
            {/*    /!*<Shoes modalOpen={modalOpen} setModalOpen={setModalOpen} amount={redeemableInitialSupply} />*!/*/}
            {/*    /!*<Environment preset="city" />*!/*/}
            {/*    /!*<Faucet scale={0.225} position={[0, -0.09, 0]} />*!/*/}
            {/*    <ContactShadows frames={1} rotation-x={[Math.PI / 2]} position={[0, -0.33, 0]} far={0.4} width={2} height={2} blur={4} />*/}
            {/*  </Suspense>*/}
            {/*  <OrbitControls autoRotate autoRotateSpeed={1} />*/}
            {/*</Canvas>*/}

            <Canvas onClick={() => {setModalOpen(!modalOpen)}} dpr={[1, 2]}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <pointLight position={[-10, -10, -10]} />
              <Selection>
                <EffectComposer multisampling={8} autoClear={false}>
                  <Outline blur visibleEdgeColor={1} edgeStrength={100} width={500} />
                </EffectComposer>
                <Box position={[0, 0, 0]} />
              </Selection>
            </Canvas>

            {/*<img onClick={() => {setModalOpen(!modalOpen)}} className="faucetImage" src={displayedImage} alt="#" /><br/>*/}


          </div>
        </>
      )}
    </>
  )
}
