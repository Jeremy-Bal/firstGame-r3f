import { Float, Text, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import useGame from './stores/useGame'

THREE.ColorManagement.legacyMode = false

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0, roughness: 0 })
const floor2Material = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0, roughness: 0 })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000', metalness: 0, roughness: 1 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#887777', metalness: 0, roughness: 0 })


export function BlocStart({position = [0, 0, 0]})
{
    return <group position={position}>
                <mesh geometry={boxGeometry}
                    material={floor1Material}
                    scale={[4, 0.2, 4]} 
                    position={[0, -0.1, 0]}
                    receiveShadow />
                    
                    <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
                        <Text
                            font="./bebas-neue-v9-latin-regular.woff"
                            scale={ 4 }
                            maxWidth={ 0.25 }
                            lineHeight={ 0.75 }
                            textAlign="right"
                            position={ [ 0.75, 0.65, 0 ] }
                            rotation-y={ - 0.25 }
                        >
                            <meshBasicMaterial toneMapped = { false } />
                            Marble Race
                        </Text>
                    </Float>
            </group>
}

export function BlocSpinner({position = [0, 0, 0]})
{
    const spinner = useRef()
    const [ speed ] = useState(()=> {
        return (Math.random() + 0.2) * (Math.random() > 0.5 ? -1 : 1)
    })
    useFrame((state)=>{
        const time = state.clock.elapsedTime
        
        const angleEur = new THREE.Euler(0, time * speed, 0)
        const angleQuat = new THREE.Quaternion().setFromEuler(angleEur)

        spinner.current.setNextKinematicRotation(angleQuat)
    })

    return <>
        <group position={position}>
                <mesh geometry={boxGeometry}
                    material={floor2Material}
                    scale={[4, 0.2, 4]} 
                    position={[0, -0.1, 0]}
                    receiveShadow />

                <RigidBody type='kinematicPosition' restitution={0.2} friction={0} ref={spinner}>
                    <mesh geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[3.5, 0.3, 0.3]}
                        position={[0, 0.2, 0]}
                        castShadow 
                        receiveShadow />
                </RigidBody>
            </group>
    </>
}

export function BlocLimbo({position = [0, 0, 0]})
{
    const limbo = useRef()
    const [ timeOffset ] = useState(()=> {
        return Math.random() * Math.PI * 2
    })
    useFrame((state)=>{
        const time = state.clock.elapsedTime
        
        const translation = Math.sin(time + timeOffset) + 1.15
        limbo.current.setNextKinematicTranslation({x: position[0], y: translation + position[1], z: position[2]})
    })

    return <>
        <group position={position}>
                <mesh geometry={boxGeometry}
                    material={floor2Material}
                    scale={[4, 0.2, 4]} 
                    position={[0, -0.1, 0]}
                    receiveShadow />

                <RigidBody type='kinematicPosition' restitution={0.2} friction={0} ref={limbo}>
                    <mesh geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[3.5, 0.2, 0.5]}
                        position={[0, 0, 0]}
                        castShadow 
                        receiveShadow />
                </RigidBody>
            </group>
    </>
}

export function BlocWall({position = [0, 0, 0]})
{
    const wall = useRef()
    const [ timeOffset ] = useState(()=> {
        return Math.random() * Math.PI * 2
    })
    useFrame((state)=>{
        const time = state.clock.elapsedTime
        
        const translation = Math.sin(time + timeOffset) * 1.25
        wall.current.setNextKinematicTranslation({x: translation + position[0], y: position[1], z: position[2]})
    })

    return <>
        <group position={position}>
                <mesh geometry={boxGeometry}
                    material={floor2Material}
                    scale={[4, 0.2, 4]} 
                    position={[0, -0.1, 0]}
                    receiveShadow />

                <RigidBody type='kinematicPosition' restitution={0.2} friction={0} ref={wall}>
                    <mesh geometry={boxGeometry}
                        material={obstacleMaterial}
                        scale={[1.5, 1.5, 0.3]}
                        position={[0, 0.8, 0]}
                        castShadow 
                        receiveShadow />
                </RigidBody>
            </group>
    </>
}

export function BlocEnd({position = [0, 0, 0]})
{
    const modele = useGLTF('./hamburger.glb')
    const end = useGame((state)=>state.end)
    
    modele.scene.children.forEach((mesh)=>mesh.castShadow = true)

    const humburgerCollision = ()=>
    {
        //End phase with collision
        end()
    }
    return <>
        <group position={position}>
            <mesh geometry={boxGeometry}
                material={floor1Material}
                scale={[4, 0.2, 4]} 
                position={[0, 0, 0]}
                receiveShadow />

            <RigidBody type='fixed' colliders='hull' onCollisionEnter={humburgerCollision}>
                <primitive object={modele.scene} scale={0.2} position-y={0.1}/>
            </RigidBody>

            {/* Final text */}
            <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
                <Text
                    font="./bebas-neue-v9-latin-regular.woff"
                    scale={ 10 }
                    maxWidth={ 0.25 }
                    lineHeight={ 0.75 }
                    textAlign="right"
                    position={ [ 0.75, 2.0, 0 ] }
                    rotation-y={ - 0.45 }
                >
                    <meshBasicMaterial toneMapped = { false } />
                    Final !!
                </Text>
            </Float>
        </group>
    </>
}

function Bounds({length = 1})
{
    length += 2

    return<>
        <RigidBody restitution={0.2} friction={0} type='fixed'>
            <mesh position={ [2.15, 0.55, - (length * 2) + 2] }
                geometry={boxGeometry} 
                material={wallMaterial}
                scale={[0.3, 1.5, 4 * length]}
                receiveShadow />

            <mesh position={ [- 2.15, 0.55, - (length * 2) + 2] }
                geometry={boxGeometry} 
                material={wallMaterial}
                scale={[0.3, 1.5, 4 * length]}
                receiveShadow />

            <mesh position={ [0, 0.75, - (length * 4) + 2] }
                geometry={boxGeometry} 
                material={wallMaterial}
                scale={[4, 1.5, 0.3]}
                castShadow />

                <CuboidCollider args={[2, 0.1, 2 * length]} 
                    position={[0, - 0.1, -(length * 2) + 2]}
                    restitution={0.2}
                    friction={1} />
        </RigidBody>
    </>
}

export function Level({count = 5, types = [BlocWall, BlocSpinner, BlocLimbo]})
{
    const restartWorld = useGame((state)=>state.restartWorld)

    useEffect(()=>{
        //subscribe to restart event, for rerender componant and change 'restartWorld'
        const subs = useGame.subscribe((state)=>state.restartWorld)

        return()=>subs()
    },[])

    const block = useMemo(()=>{
        const block = []
        for (let i = 0; i < count; i++) {
            block.push(types[Math.floor(Math.random() * types.length)])
        }
        return block
    },[types, count, restartWorld])

    return<>
        <BlocStart position={[0, 0, 0]} />

        {block.map((Block, index) => <Block key={index} position={[0, 0, - (index + 1) * 4]}/> ) }

        <BlocEnd position={[0, 0, - (count + 1) * 4]} />

        <Bounds length={count}/>
    </>
}