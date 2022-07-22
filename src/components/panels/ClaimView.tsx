import React, {Suspense, useEffect} from "react";
import {
  useParams
} from "react-router-dom";
import NavBar from "../layout/NavBar";
import EscrowClaimModal from "./EscrowClaimModal";
import {Canvas} from "@react-three/fiber";
import {ContactShadows, Environment, OrbitControls} from "@react-three/drei";
import Chest from "../3d/Chest";
const CHAIN_NAME = process.env.REACT_APP_CHAIN_NAME; // Mumbai (Polygon Testnet) Chain ID
const BASE_URL = process.env.REACT_APP_BASE_URL;

type claimViewProps = {
  modalOpen: any
  setModalOpen: any,  buttonLock: any, tokenAddress: string,
  consoleColor: any, consoleData: any, initiateClaim: any, claimView: any, setEscrowAddress: any
}

// todo rename to escrowView
export default function ClaimView({
    modalOpen,
    setModalOpen, buttonLock,
    consoleData, consoleColor, initiateClaim,
    claimView, setEscrowAddress
  }: claimViewProps )
{

  let {id}: any = useParams();
  // set token address by url instead of t= (check line 80 onwards works in app.tsx for getting the tokenData)
  useEffect(() => {
    setEscrowAddress(id);
  }, []);

  return (
    <>
      { claimView && (
        <>
          <NavBar string={`Claim Your Tokens!`} />
          <p className='deploy-own'>Make sure you are connected to the <b className='modalTextRed'>{CHAIN_NAME}</b> Network. <a href={`${window.location}`}>Click Here to Deploy Your Own Sale!</a></p>

          <div className="canvasContainer">
            <EscrowClaimModal
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              buttonLock={buttonLock}
              consoleData={consoleData}
              consoleColor={consoleColor}
              initiateClaim={initiateClaim}
            />

            <Canvas className="the-canvas" shadows dpr={[1,2 ]} camera={{ position: [0,-20,0], fov: 50 }}>
              <ambientLight intensity={1} />
              <spotLight position={[1, 6, 1.5]} angle={0.2} penumbra={1} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
              <spotLight position={[-5, 5, -1.5]} angle={0.03} penumbra={1} intensity={4} castShadow shadow-mapSize={[1024, 1024]} />
              <spotLight position={[5, 5, -5]} angle={0.3} penumbra={1} intensity={4} castShadow={true} shadow-mapSize={[256, 256]} color="#ffffc0" />
              <Suspense fallback={null}>
                <Environment preset="studio" />
                <Chest scale={0.02} position={[0,0,-3]} rotation={[0.2, 0, 1.2]} setModalOpen={setModalOpen} />
                <ContactShadows frames={1} rotation-x={[Math.PI / 2]} position={[0, -0.33, 0]} far={0.4} width={2} height={2} blur={4} />
              </Suspense>
              {/*<OrbitControls enableZoom={true}  enablePan={true} />*/}

            </Canvas>

          </div>
        </>
      )}
    </>
  )
}
