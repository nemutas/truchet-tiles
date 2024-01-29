import * as THREE from 'three'
import { Three } from './core/Three'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/output.fs'
import { Main } from './scene/Main'
import { RawShaderMaterial } from './core/ExtendedMaterials'

export class Canvas extends Three {
  private main: Main
  private output: THREE.Mesh<THREE.PlaneGeometry, THREE.RawShaderMaterial, THREE.Object3DEventMap>

  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
    this.main = new Main(this)
    this.output = this.createOutput()

    window.addEventListener('resize', this.resize.bind(this))
    this.renderer.setAnimationLoop(this.anime.bind(this))
  }

  private createOutput() {
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new RawShaderMaterial({
      uniforms: {
        tSource: { value: null },
      },
      vertexShader,
      fragmentShader,
      glslVersion: '300 es',
    })
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
    return mesh
  }

  private resize() {
    this.main.resize()
  }

  private anime() {
    this.updateTime()

    this.main.render()

    this.output.material.uniforms.tSource.value = this.main.texture
    this.render()
  }
}
