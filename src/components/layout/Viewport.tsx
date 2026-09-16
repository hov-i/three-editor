import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Viewport() {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = viewport.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main ref={viewport} className="min-w-0 flex-1 bg-muted/30" />
  );
}
