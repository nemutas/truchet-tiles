import * as THREE from 'three'
import { Canvas } from '../Canvas'
import { BackBuffer } from '../core/BackBuffer'
import fragmentShader from '../shader/main.fs'
import vertexShader from '../shader/quad.vs'

export class Main extends BackBuffer {
  constructor(private canvas: Canvas) {
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [canvas.size.width, canvas.size.height] },
        tBackBuffer: { value: null },
      },
      vertexShader,
      fragmentShader,
    })

    super(canvas.renderer, material)
  }

  resize() {
    super.resize()
    this.uniforms.uResolution.value = [this.size.width, this.size.height]
  }

  render() {
    this.uniforms.uTime.value += this.canvas.time.delta
    this.uniforms.tBackBuffer.value = this.backBuffer
    super.render()
  }
}
