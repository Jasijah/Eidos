import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { AvatarFrame } from '../types';
import type { AvatarAssetDescriptor } from './AvatarAssetProvider';
import type { ResolvedRealismProfile } from './RealismProfile';

export interface RealisticRenderInput {
  frame: AvatarFrame;
  asset: AvatarAssetDescriptor;
  realism: ResolvedRealismProfile;
  label: string;
}

export class RealisticAvatarRenderer {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(28, 4 / 3, 0.1, 100);
  private renderer?: THREE.WebGLRenderer;
  private root = new THREE.Group();
  private head = new THREE.Group();
  private torso = new THREE.Group();
  private leftEye = new THREE.Group();
  private rightEye = new THREE.Group();
  private leftLid?: THREE.Mesh;
  private rightLid?: THREE.Mesh;
  private mouth?: THREE.Mesh;
  private jaw?: THREE.Mesh;
  private brows: THREE.Mesh[] = [];
  private resizeObserver?: ResizeObserver;
  private disposed = false;

  mount(container: HTMLElement, asset: AvatarAssetDescriptor): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    container.replaceChildren(this.renderer.domElement);
    this.scene.background = new THREE.Color('#d8e1de');
    this.scene.fog = new THREE.Fog('#d8e1de', 7, 12);
    this.camera.position.set(0, 0.1, 7.2);
    this.camera.lookAt(0, 0.15, 0);
    this.scene.add(this.root);
    this.addLighting();
    this.addBackground(asset.background);
    this.buildProceduralHuman(asset);
    if (asset.modelUrl) void this.loadProviderModel(asset.modelUrl);
    this.resizeObserver = new ResizeObserver(() => this.resize(container));
    this.resizeObserver.observe(container);
    this.resize(container);
  }

  update(input: RealisticRenderInput): void {
    if (!this.renderer || this.disposed) return;
    const { frame, realism } = input;
    const breathing = ((frame.breathing ?? 0.5) - 0.5) * 0.035;
    this.root.position.y = -0.18 + breathing;
    this.head.rotation.set(frame.headY * 0.5, frame.headX * 0.6, frame.tilt * 0.45);
    this.head.position.x = frame.headX * 0.12;
    this.head.position.y = 0.7 + frame.headY * 0.08;
    this.torso.rotation.z = (frame.shoulderShift ?? 0) * 0.08;
    this.torso.position.y = ((frame.posture ?? realism.postureLift) - 0.5) * 0.18;

    const eyeScale = frame.blink ? 0.08 : Math.max(0.45, 1 - (frame.eyeSquint ?? 0.06) * 0.7);
    if (this.leftLid) this.leftLid.scale.y = eyeScale;
    if (this.rightLid) this.rightLid.scale.y = eyeScale;
    const gaze = ((frame.eyeContact ?? 0.65) - 0.5) * 0.08;
    this.leftEye.rotation.y = gaze;
    this.rightEye.rotation.y = gaze;

    if (this.mouth) {
      this.mouth.scale.x = frame.viseme === 'wide' ? 1.18 : frame.viseme === 'round' ? 0.82 : 1;
      this.mouth.scale.y = 0.32 + Math.min(1, frame.mouthOpen) * 2.4;
      this.mouth.position.y = -0.43 + frame.smile * 0.04;
    }
    if (this.jaw) this.jaw.position.y = -0.27 - (frame.jawOpen ?? 0) * 0.09;
    for (const [index, brow] of this.brows.entries()) {
      brow.position.y = 0.22 + (frame.brow ?? 0) * 0.07;
      brow.rotation.z = (index === 0 ? -1 : 1) * (0.04 + frame.smile * 0.04);
    }
    this.renderer.render(this.scene, this.camera);
  }

  canvas(): HTMLCanvasElement {
    if (!this.renderer) throw new Error('Renderer is not mounted.');
    return this.renderer.domElement;
  }

  dispose(): void {
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }

  private addLighting(): void {
    this.scene.add(new THREE.HemisphereLight('#f8fbfa', '#65736f', 1.8));
    const key = new THREE.DirectionalLight('#fff7ef', 4.4);
    key.position.set(-3.5, 4.5, 5);
    key.castShadow = true;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight('#b7d9d1', 2.1);
    fill.position.set(4, 2, 3);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight('#ffffff', 2.3);
    rim.position.set(0, 3, -4);
    this.scene.add(rim);
  }

  private addBackground(background: string): void {
    const palette = background === 'studio'
      ? { wall: '#cfd4d5', panel: '#f5f6f6' }
      : background === 'blur'
        ? { wall: '#bfcac7', panel: '#dfe8e5' }
        : background.startsWith('#')
          ? { wall: background, panel: background }
          : { wall: '#cdd8d4', panel: '#eef3f1' };
    this.scene.background = new THREE.Color(palette.wall);
    this.scene.fog = new THREE.Fog(palette.wall, 7, 12);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 1 }));
    floor.position.set(0, 0, -3.2);
    this.scene.add(floor);
    const panelMaterial = new THREE.MeshStandardMaterial({ color: palette.panel, roughness: 0.92 });
    for (const x of [-3.4, 3.3]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 4.8, 0.16), panelMaterial);
      panel.position.set(x, 0.4, -2.7);
      this.scene.add(panel);
    }
  }

  private buildProceduralHuman(asset: AvatarAssetDescriptor): void {
    const skin = new THREE.MeshPhysicalMaterial({ color: asset.skinTone, roughness: 0.64, sheen: 0.12, clearcoat: 0.04 });
    const hair = new THREE.MeshStandardMaterial({ color: asset.hairTone, roughness: 0.78 });
    const jacket = new THREE.MeshPhysicalMaterial({ color: asset.jacketTone, roughness: 0.82, sheen: 0.18 });
    const shirt = new THREE.MeshStandardMaterial({ color: asset.shirtTone, roughness: 0.74 });

    const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(1.38, 1.2, 8, 32), jacket);
    shoulders.scale.set(1.36, 0.78, 0.55);
    shoulders.position.y = -1.05;
    this.torso.add(shoulders);
    const shirtFront = new THREE.Mesh(new THREE.CapsuleGeometry(0.52, 0.72, 8, 24), shirt);
    shirtFront.scale.set(0.8, 0.9, 0.28);
    shirtFront.position.set(0, -0.72, 0.48);
    this.torso.add(shirtFront);
    this.root.add(this.torso);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.39, 0.72, 32), skin);
    neck.position.y = 0.1;
    this.root.add(neck);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.88, 64, 48), skin);
    face.scale.set(0.82, 1.08, 0.78);
    this.head.add(face);
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.64, 48, 32), skin);
    jaw.scale.set(0.9, 0.62, 0.76);
    jaw.position.set(0, -0.27, 0.05);
    this.jaw = jaw;
    this.head.add(jaw);

    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.91, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.54), hair);
    hairCap.scale.set(0.86, 1.03, 0.8);
    hairCap.position.y = 0.12;
    this.head.add(hairCap);

    this.leftEye = this.makeEye(-0.29);
    this.rightEye = this.makeEye(0.29);
    this.head.add(this.leftEye, this.rightEye);
    this.leftLid = this.leftEye.children[0] as THREE.Mesh;
    this.rightLid = this.rightEye.children[0] as THREE.Mesh;

    const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.18, 8, 18), skin);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.08, 0.69);
    this.head.add(nose);

    this.mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.25, 8, 20), new THREE.MeshPhysicalMaterial({ color: '#5b2929', roughness: 0.58 }));
    this.mouth.rotation.z = Math.PI / 2;
    this.mouth.position.set(0, -0.43, 0.68);
    this.head.add(this.mouth);

    for (const x of [-0.29, 0.29]) {
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.25, 6, 16), hair);
      brow.rotation.z = Math.PI / 2 + (x < 0 ? -0.04 : 0.04);
      brow.position.set(x, 0.22, 0.68);
      this.brows.push(brow);
      this.head.add(brow);
    }

    this.head.position.y = 0.7;
    this.root.add(this.head);
  }

  private makeEye(x: number): THREE.Group {
    const eye = new THREE.Group();
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#f4f1eb', roughness: 0.38 }));
    white.scale.set(1.18, 0.72, 0.42);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.052, 20, 12), new THREE.MeshPhysicalMaterial({ color: '#283a36', roughness: 0.26, clearcoat: 0.5 }));
    iris.position.z = 0.12;
    eye.add(white, iris);
    eye.position.set(x, 0.04, 0.68);
    return eye;
  }

  private async loadProviderModel(modelUrl: string): Promise<void> {
    try {
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      this.root.clear();
      gltf.scene.scale.setScalar(1.7);
      gltf.scene.position.y = -1.65;
      this.root.add(gltf.scene);
    } catch {
      // Procedural avatar remains active when a provider asset cannot load.
    }
  }

  private resize(container: HTMLElement): void {
    if (!this.renderer) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
