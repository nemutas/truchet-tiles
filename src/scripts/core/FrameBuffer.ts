import * as THREE from 'three'

export type Options = {
  dpr?: number
  matrixAutoUpdate?: boolean
}

export abstract class FrameBuffer {
  protected readonly scene: THREE.Scene
  protected readonly camera: THREE.OrthographicCamera
  protected readonly renderTarget: THREE.WebGLRenderTarget
  private readonly screen: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial, THREE.Object3DEventMap>
  private readonly glslVersion: THREE.GLSLVersion | null

  constructor(
    protected readonly renderer: THREE.WebGLRenderer,
    material: THREE.RawShaderMaterial,
    private options?: Options,
  ) {
    this.glslVersion = this.getGLSLVersion(material)
    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera()
    this.renderTarget = this.createRenderTarget()
    this.screen = this.createScreen(material)

    this.setMatrixAutoUpdate(options?.matrixAutoUpdate ?? false)
  }

  private get devicePixelRatio() {
    return this.options?.dpr ?? window.devicePixelRatio
  }

  private setMatrixAutoUpdate(v: boolean) {
    this.camera.matrixAutoUpdate = v
    this.scene.traverse((o) => (o.matrixAutoUpdate = v))
  }

  protected get size() {
    return { width: this.renderer.domElement.width * this.devicePixelRatio, height: this.renderer.domElement.height * this.devicePixelRatio }
  }

  private getGLSLVersion(material: THREE.RawShaderMaterial) {
    if (material.glslVersion === '300 es' || material.glslVersion === '100') {
      return material.glslVersion
    } else {
      const ver = this.renderer.domElement.getAttribute('glslVersion')
      if (ver) {
        return ver as THREE.GLSLVersion
      } else {
        return null
      }
    }
  }

  protected createRenderTarget() {
    const rt = new THREE.WebGLRenderTarget(this.size.width, this.size.height)
    return rt
  }

  private createScreen(material: THREE.RawShaderMaterial) {
    const shaderObject = this.shaderObject(material.vertexShader, material.fragmentShader)
    material.vertexShader = shaderObject.vertexShader
    material.fragmentShader = shaderObject.fragmentShader
    material.glslVersion = shaderObject.glslVersion

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
    return mesh
  }

  private shaderObject(vs: string, fs: string) {
    if (this.glslVersion === '300 es') {
      let vertexShader = vs.replace('#version 300 es', '')
      let fragmentShader = fs.replace('#version 300 es', '')
      return { vertexShader, fragmentShader, glslVersion: this.glslVersion as THREE.GLSLVersion }
    } else {
      return { vertexShader: vs, fragmentShader: fs, glslVersion: null }
    }
  }

  get uniforms() {
    return this.screen.material.uniforms
  }

  resize() {
    this.renderTarget.setSize(this.size.width, this.size.height)
  }

  get texture() {
    return this.renderTarget.texture
  }

  render(..._args: any[]) {
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.scene, this.camera)
  }
}
