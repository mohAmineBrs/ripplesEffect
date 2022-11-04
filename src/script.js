import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import * as dat from 'dat.gui'
import gsap from "gsap";
import { WebGLRenderTarget } from 'three'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const scene1 = new THREE.Scene()

/**
 * Textures
 */
 const textureLoader = new THREE.TextureLoader()
 const brush = textureLoader.load('/textures/brush.png')
 const bg = textureLoader.load('/textures/bg.jpg')



 // Sizes Object initialisation
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}


/**
 * Object
 */
const material = new THREE.ShaderMaterial({
   vertexShader: vertex,
   fragmentShader: fragment,
   side: THREE.DoubleSide,
   uniforms: {
       uTime: {value: 0},
       uMouseMove: {value: null},
       uTexture: {value: bg},
       uDisplacement: {value: null},
       uProgress: {value: 0},

   }
});


const max = 50
const meshes = []

var geometry = new THREE.PlaneBufferGeometry(64, 64, 1, 1)
var fullScreenGeometry = new THREE.PlaneBufferGeometry(sizes.width, sizes.height, 1, 1)

for (let i = 0; i < max; i++) {
    const mat = new THREE.MeshBasicMaterial({
        map: brush,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, mat)
    mesh.visible = false
    mesh.rotation.z = 2 * Math.PI * Math.random()
    scene.add(mesh)
    meshes.push(mesh)
    
}



const background = new THREE.Mesh(fullScreenGeometry, material);
scene1.add(background);


/**
 * Sizes
 */
// sizes.width= window.innerWidth,
// sizes.height= window.innerHeight


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

/////////////////////////////////////////////////////////////////////

/**
 * Mouse Move Event
 */
const mouse = new THREE.Vector2(0, 0)
window.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX - sizes.width / 2;
	mouse.y = sizes.height / 2 - event.clientY;
   

}, false)



let currentWave = 0
const prevMouse = new THREE.Vector2(0, 0)

const setNewWave = (x, y, index) => {
    let mesh = meshes[index]
    mesh.visible = true
    mesh.position.x = x
    mesh.position.y = y
    mesh.scale.x = mesh.scale.y = 1.5
    mesh.material.opacity = 0.5
}
const trackMousePos = () => {
    if (Math.abs(mouse.x - prevMouse.x)<1 && Math.abs(mouse.y - prevMouse.y)<1) {
        // nothing
    } else {
        setNewWave(mouse.x, mouse.y, currentWave)
        currentWave = (currentWave + 1) % max
    }
    prevMouse.x = mouse.x
    prevMouse.y = mouse.y

}

/**
 * Camera
 */
// Orthographique Camera
const frustumSize = sizes.height
const aspect = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, -1000, 1000)
camera.position.z = 2
scene.add(camera)

// Base camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
// camera.position.z = 2
// scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x161149)
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding

// Render Target
const baseTexture = new WebGLRenderTarget(
    sizes.width,
    sizes.height,
    {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
    }
)



/**
 * Animate
 */
 const clock = new THREE.Clock()

const tick = () => {

    trackMousePos()

    const elapsedTime = clock.getElapsedTime()

    // Link Meshes Position to Mouse Position
    meshes.forEach(mesh => {
        if(mesh.visible) {
        // mesh.position.x = mouse.x
        // mesh.position.y = mouse.y
        mesh.rotation.z += 0.02
        mesh.material.opacity *= 0.95
        mesh.scale.x = 0.982 * mesh.scale.x + 0.108
        mesh.scale.y = mesh.scale.x
        if(mesh.material.opacity < 0.002) {mesh.visible = false}
        }

    })

    // Upadte uTime Uniform
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.setRenderTarget(baseTexture)
    renderer.render(scene, camera)
    material.uniforms.uDisplacement.value = baseTexture.texture
    renderer.setRenderTarget(null)
    renderer.clear()
    renderer.render(scene1, camera)


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()