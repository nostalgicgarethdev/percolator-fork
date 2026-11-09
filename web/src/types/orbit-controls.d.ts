declare module "three/addons/controls/OrbitControls.js" {
  import { Camera, Vector3 } from "three";

  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    target: Vector3;
    enablePan: boolean;
    enableZoom: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    rotateSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    update(): boolean;
    dispose(): void;
  }
}
