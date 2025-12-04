import { Controller } from "@hotwired/stimulus"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

export default class extends Controller {
    static targets = ["loading"]

    connect() {
        console.log("STEP Viewer controller connected")
        this.initScene()
        
        // Keep loading overlay visible
        this.showLoading(true)
        
        // Set up reset view button
        this.setupResetButton()
        
        // Try to load real STEP file
        this.tryLoadSTEP()
    }
    
    setupResetButton() {
        const resetBtn = document.getElementById('reset-view-btn')
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Resetting camera view')
                if (this.currentModel) {
                    this.fitCameraToModel(this.currentModel)
                } else {
                    this.camera.position.set(100, 100, 100)
                    this.camera.lookAt(0, 0, 0)
                    this.controls.target.set(0, 0, 0)
                    this.controls.update()
                }
            })
        }
    }
    
    tryLoadSTEP() {
        const urlInput = document.getElementById("design-url")
        if (!urlInput || !urlInput.value) {
            console.log('No STEP file URL found, loading placeholder')
            this.loadPlaceholder()
            this.showLoading(false)
            return
        }
        
        console.log('Attempting to load STEP file...')
        
        // Set a timeout fallback
        const timeout = setTimeout(() => {
            console.warn('OCCT initialization timeout - loading placeholder')
            this.loadPlaceholder()
            this.showLoading(false)
        }, 15000)
        
        this.initOCCT()
            .then(() => {
                clearTimeout(timeout)
                console.log("OCCT initialized, loading actual model...")
                this.loadModel()
            })
            .catch(error => {
                clearTimeout(timeout)
                console.error("OCCT initialization failed, loading placeholder:", error)
                this.loadPlaceholder()
                this.showLoading(false)
            })
    }

    disconnect() {
        this.dispose()
    }

    initScene() {
        this.container = document.getElementById("3d-canvas-container")
        if (!this.container) return

        // Scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x1a1a2e)

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.container.clientWidth / this.container.clientHeight,
            0.01,
            100000
        )
        this.camera.position.set(100, 100, 100)

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.container.appendChild(this.renderer.domElement)

        // OrbitControls for interactive camera
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.minDistance = 1
        this.controls.maxDistance = 10000

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambientLight)

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
        dirLight1.position.set(100, 100, 100)
        this.scene.add(dirLight1)

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
        dirLight2.position.set(-100, -100, -100)
        this.scene.add(dirLight2)

        // Grid Helper
        const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222)
        this.scene.add(gridHelper)

        // Axes helper
        const axesHelper = new THREE.AxesHelper(50)
        this.scene.add(axesHelper)

        // Resize handler
        this.handleResize = this.onWindowResize.bind(this)
        window.addEventListener('resize', this.handleResize)

        // Animation Loop
        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)
    }

    async initOCCT() {
        try {
            console.log('Starting OCCT initialization...')
            // Load OCCT loader from CDN
            if (typeof window.occtimportjs === 'undefined') {
                console.log('Loading OCCT library from CDN...')
                await this.loadScript('https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.js')
                console.log('OCCT script loaded')
            } else {
                console.log('OCCT already loaded')
            }
            
            console.log('Initializing OCCT loader instance...')
            this.occtLoader = await window.occtimportjs()
            console.log('OCCT loader initialized successfully')
        } catch (error) {
            console.error('Failed to initialize OCCT loader:', error)
            this.showError('Failed to initialize STEP loader')
            throw error
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
        })
    }

    async loadModel() {
        const urlInput = document.getElementById("design-url")
        if (!urlInput) {
            console.log('No design URL found, skipping model load')
            return
        }

        const url = urlInput.value
        if (!url) {
            console.log('No URL provided, skipping model load')
            return
        }

        console.log("Loading STEP file from:", url)

        try {
            if (!this.occtLoader) {
                throw new Error('OCCT loader not initialized')
            }

            console.log('Fetching STEP file...')
            // Fetch the STEP file
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            console.log('Converting to array buffer...')
            const arrayBuffer = await response.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)
            console.log(`File size: ${uint8Array.length} bytes`)

            // Remove existing model
            if (this.currentModel) {
                this.scene.remove(this.currentModel)
                this.currentModel = null
            }

            console.log('Parsing STEP file with OCCT...')
            // Import STEP file using OCCT
            const result = this.occtLoader.ReadStepFile(uint8Array)

            if (!result.success) {
                throw new Error('Failed to parse STEP file')
            }

            console.log(`Parsing successful! Found ${result.meshes.length} meshes`)

            // Create Three.js geometry
            const modelGroup = new THREE.Group()

            // Process each mesh
            for (let i = 0; i < result.meshes.length; i++) {
                const meshData = result.meshes[i]
                console.log(`Processing mesh ${i + 1}/${result.meshes.length}`)

                // Create geometry
                const geometry = new THREE.BufferGeometry()

                // Vertices
                const vertices = new Float32Array(meshData.attributes.position.array)
                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

                // Normals
                if (meshData.attributes.normal) {
                    const normals = new Float32Array(meshData.attributes.normal.array)
                    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
                } else {
                    geometry.computeVertexNormals()
                }

                // Indices
                if (meshData.index) {
                    const indices = new Uint32Array(meshData.index.array)
                    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
                }

                // Material
                const material = new THREE.MeshPhongMaterial({
                    color: meshData.color || 0x6c8ebf,
                    shininess: 30,
                    side: THREE.DoubleSide
                })

                const mesh = new THREE.Mesh(geometry, material)
                modelGroup.add(mesh)
            }

            console.log('Adding model to scene...')
            // Add to scene
            this.scene.add(modelGroup)
            this.currentModel = modelGroup

            // Center and fit camera
            this.fitCameraToModel(modelGroup)

            // Hide loading overlay after successful load
            this.showLoading(false)

            console.log(`✅ Successfully loaded STEP file with ${result.meshes.length} meshes`)
        } catch (error) {
            console.error('❌ Error loading STEP file:', error)
            console.log('Loading placeholder model instead')
            this.loadPlaceholder()
            this.showLoading(false)
        }
    }

    loadPlaceholder() {
        console.log('Loading placeholder geometry')
        
        // Remove existing model if any
        if (this.currentModel) {
            this.scene.remove(this.currentModel)
            this.currentModel = null
        }
        
        // Create placeholder cube
        const geometry = new THREE.BoxGeometry(20, 20, 20)
        const material = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            roughness: 0.5,
            metalness: 0.5
        })
        const cube = new THREE.Mesh(geometry, material)
        
        // Add edges
        const edges = new THREE.EdgesGeometry(geometry)
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
        const wireframe = new THREE.LineSegments(edges, lineMaterial)
        cube.add(wireframe)
        
        const modelGroup = new THREE.Group()
        modelGroup.add(cube)
        
        this.scene.add(modelGroup)
        this.currentModel = modelGroup
        
        this.fitCameraToModel(modelGroup)
    }

    fitCameraToModel(model) {
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const fov = this.camera.fov * (Math.PI / 180)
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
        cameraZ *= 2.5 // Add margin for better view

        // Update camera near/far planes based on model size
        this.camera.near = maxDim / 1000
        this.camera.far = maxDim * 100
        this.camera.updateProjectionMatrix()

        // Position camera
        this.camera.position.set(
            center.x + cameraZ * 0.5,
            center.y + cameraZ * 0.5,
            center.z + cameraZ
        )
        this.camera.lookAt(center)

        // Update controls
        this.controls.target.copy(center)
        this.controls.minDistance = maxDim / 10
        this.controls.maxDistance = maxDim * 10
        this.controls.update()

        console.log('Camera fitted to model:', {
            center: center,
            size: size,
            maxDim: maxDim
        })
    }

    animate() {
        if (!this.renderer) return

        requestAnimationFrame(this.animate)

        // Update controls
        if (this.controls) {
            this.controls.update()
        }

        this.renderer.render(this.scene, this.camera)
    }

    onWindowResize() {
        if (!this.camera || !this.renderer || !this.container) return

        this.camera.aspect = this.container.clientWidth / this.container.clientHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    }

    showLoading(show) {
        const loadingEl = this.hasLoadingTarget ? this.loadingTarget : document.querySelector('.loading-overlay')
        if (loadingEl) {
            loadingEl.style.display = show ? "flex" : "none"
            console.log(`Loading overlay ${show ? 'shown' : 'hidden'}`)
        }
    }

    showError(message) {
        console.error(message)
        // Could add UI error display here
    }

    dispose() {
        window.removeEventListener('resize', this.handleResize)
        if (this.controls) {
            this.controls.dispose()
        }
        if (this.renderer) {
            this.renderer.dispose()
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement)
            }
        }
    }
}
