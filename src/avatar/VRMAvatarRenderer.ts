import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, type VRM } from '@pixiv/three-vrm';
import type { AvatarAssetDescriptor } from './AvatarAssetProvider';
import type { RealisticRenderInput } from './RealisticAvatarRenderer';
import { RealisticAvatarRenderer } from './RealisticAvatarRenderer';
import { VRMExpressionMapper } from './VRMExpressionMapper';

export class VRMAvatarRenderer {
  private fallback = new RealisticAvatarRenderer();
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private vrm?: VRM;
  private observer?: ResizeObserver;
  private mapper = new VRMExpressionMapper();

  mount(container: HTMLElement, asset: AvatarAssetDescriptor): void {
    if (!asset.modelUrl || !/\.vrm($|\?)/i.test(asset.modelUrl)) { this.fallback.mount(container, asset); return; }
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color('#d8e1de');
    this.camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 100); this.camera.position.set(0, 1.35, 3.2); this.camera.lookAt(0, 1.3, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true }); this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); container.replaceChildren(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#65736f', 2)); const key = new THREE.DirectionalLight('#fff7ef', 3); key.position.set(-2,3,4); this.scene.add(key);
    const loader = new GLTFLoader(); loader.register((parser) => new VRMLoaderPlugin(parser));
    void loader.loadAsync(asset.modelUrl).then((gltf) => { this.vrm = gltf.userData.vrm as VRM; this.scene?.add(this.vrm.scene); });
    this.observer = new ResizeObserver(() => this.resize(container)); this.observer.observe(container); this.resize(container);
  }

  update(input: RealisticRenderInput): void {
    if (!this.renderer || !this.scene || !this.camera || !this.vrm) { this.fallback.update(input); return; }
    const expressions = this.mapper.map(input.frame);
    this.vrm.expressionManager?.setValue('blink', expressions.blink); this.vrm.expressionManager?.setValue('happy', expressions.happy); this.vrm.expressionManager?.setValue('relaxed', expressions.relaxed); this.vrm.expressionManager?.setValue('aa', expressions.aa); this.vrm.expressionManager?.setValue('ih', expressions.ih); this.vrm.expressionManager?.setValue('ou', expressions.ou);
    const head = this.vrm.humanoid.getNormalizedBoneNode('head'); if (head) head.rotation.set(input.frame.headY * .5, input.frame.headX * .6, input.frame.tilt * .45);
    const spine = this.vrm.humanoid.getNormalizedBoneNode('spine'); if (spine) spine.rotation.z = (input.frame.shoulderShift ?? 0) * .08;
    this.vrm.lookAt?.lookAt(new THREE.Vector3((input.frame.eyeContact ?? .65) - .5, 1.4, 3)); this.vrm.update(1 / 30); this.renderer.render(this.scene, this.camera);
  }
  canvas(): HTMLCanvasElement { return this.renderer?.domElement ?? this.fallback.canvas(); }
  dispose(): void { this.observer?.disconnect(); this.renderer?.dispose(); this.fallback.dispose(); }
  private resize(container: HTMLElement): void { if (!this.renderer || !this.camera) return; const width=Math.max(1,container.clientWidth); const height=Math.max(1,container.clientHeight); this.renderer.setSize(width,height,false); this.camera.aspect=width/height; this.camera.updateProjectionMatrix(); }
}
