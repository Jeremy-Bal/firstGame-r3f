import { Debug, Physics } from "@react-three/rapier";
import { OrbitControls } from '@react-three/drei'

import { Level } from './Level.js'
import Lights from './Lights.js'
import Player from './Player.js'
import Effect from "./Effect.js";

export default function Experience()
{
    return <>

        {/* <OrbitControls makeDefault /> */}
        <color args={['#1d1b1b']} attach='background' />
        <Lights />
        <Physics>
            {/* <Debug /> */}
            <Level />
            <Player />
        </Physics>
        <Effect />
    </>
}   