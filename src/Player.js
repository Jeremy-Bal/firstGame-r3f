import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, useRapier } from '@react-three/rapier';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three'
import useGame from './stores/useGame';

export default function Player()
{
    const [subscribesKeys, getKeys] = useKeyboardControls()
    //sphere player
    const body = useRef()
    const {rapier, world} = useRapier()
    //rapier world
    const rapierWorld = world.raw()
    const [ smoothedCameraPosition ] = useState(()=>new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(()=>new THREE.Vector3())

    const start = useGame((state)=>state.start)
    const restart = useGame((state)=>state.restart)

    const jump = () =>
    {
        //set origin
        const origin = body.current.translation()
        origin.y -= 0.31
        //set direction to cast
        const direction = { x: 0, y: -1, z:0 }
        //set raycast
        const ray = new rapier.Ray(origin, direction)
        //associate raycast with rapierWorld
        const hit = rapierWorld.castRay(ray, 10, true)

        //distance from floor
        if(hit.toi < 0.15){
            body.current.applyImpulse({ x: 0, y: 0.5, z:0 })
        }
    }
    const reset = ()=>{
        body.current.setTranslation({x: 0, y: 0, z: 0})
        body.current.setLinvel({x: 0, y: 0, z: 0})
        body.current.setAngvel({x: 0, y: 0, z: 0})
    }
    useEffect(()=>{
        const unsubscribePhase = useGame.subscribe(
            (state)=>state.phase,
            (value)=>{
                if(value === 'ready')
                    reset()
            }
        )

        const unsubscribesKeys = subscribesKeys(
            //add event when player jump
            (state)=>state.jump,
            (value)=>{
                //return true when payer press the key
                if(value)
                    //return jump function
                    return jump()
            })

        // Triger when user press any controls keys and start function
        const unsubscribeAny = subscribesKeys(
            ()=>
            {
                start()
            }
        )

        return () => 
        {
            //prevent to subscribe keys only one
            unsubscribesKeys()
            unsubscribeAny()
            unsubscribePhase()
        }
    }, [])
    useFrame((state, delta)=>{
        //Controls
        const {forward, backward, leftward, rightward, jump} = getKeys()

        const impulse = {x: 0, y: 0, z: 0}
        const rotation = {x: 0, y: 0, z: 0}

        const impulseStrength = 0.6 * delta
        const rotationStrength = 0.2 * delta

        if(forward)
        {
            impulse.z -= impulseStrength
            rotation.x -= rotationStrength
        }
        
        if(backward)
        {
            impulse.z += impulseStrength
            rotation.x += rotationStrength
        }

        if(leftward)
        {
            impulse.x -= impulseStrength
            rotation.z += rotationStrength
        }

        if(rightward)
        {
            impulse.x += impulseStrength
            rotation.z -= rotationStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(rotation)

        //Camera
        const bodyPosition = body.current.translation()
        const cameraPosition = new THREE.Vector3(10, 10, 10)

        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        //smooth camera position and target with lerp function who smooth the vec3 with another vec3
        smoothedCameraPosition.lerp(cameraPosition, delta * 5)
        smoothedCameraTarget.lerp(cameraTarget, delta * 5)

        //add position to camera
        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)


        //Restart when falling
        if(bodyPosition.y < - 4)
            restart()
    })

    return <RigidBody colliders={'ball'} 
            restitution={0.2}
            friction={1}
            position={[0, 0, 0]}
            linearDamping={0.5}
            angularDamping={0.5}
            ref={body} >
        <mesh castShadow>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial color={'mediumpurple'} flatShading />
        </mesh>
    </RigidBody>
}