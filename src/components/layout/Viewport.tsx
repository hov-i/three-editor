import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";

const FONT_URL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

// 방식 1) 캔버스에 텍스트를 그려서 텍스처로 만들고 Sprite에 입히는 방식
// 폰트 로딩이 필요 없고, Sprite는 항상 카메라를 바라봄(빌보드)이라 라벨에 적합
function createTextSprite(text: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.font = "bold 40px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2, 0.5, 1); // 캔버스 비율(256:64=4:1)에 맞춰 스케일

  return sprite;
}

// 방식 2) 폰트를 json으로 로드해서 실제 메쉬(입체)로 텍스트를 만드는 방식
// 조명/그림자를 받을 수 있고 회전 가능, 폰트 로딩이 비동기라 늦게 나타남
function loadTextGeometryMesh(
  text: string,
  onLoad: (mesh: THREE.Mesh) => void,
) {
  const loader = new FontLoader();
  loader.load(FONT_URL, (font) => {
    const geometry = new TextGeometry(text, {
      font,
      size: 0.5,
      depth: 0.1, // 글자의 두께(구 버전에서는 height 옵션)
    });
    geometry.center(); // 텍스트를 원점 기준 중앙 정렬

    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    onLoad(new THREE.Mesh(geometry, material));
  });
}

// 방식 3) 진짜 HTML 엘리먼트를 3D 공간 좌표계에 배치하는 방식 (CSS3DRenderer)
// WebGL이 아니라 DOM을 3D 변환으로 배치하는 것이라 폰트/스타일링이 자유로움
function createCss3dLabel(text: string): CSS3DObject {
  const div = document.createElement("div");
  div.textContent = text;
  div.style.color = "white";
  div.style.fontSize = "24px";
  div.style.fontFamily = "sans-serif";

  const object = new CSS3DObject(div);
  object.scale.set(0.01, 0.01, 0.01); // CSS 픽셀 단위라 3D 씬 스케일에 맞춰 축소
  return object;
}

export function Viewport() {
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = viewport.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();

    const geometry = new THREE.BoxGeometry(1, 1, 1); // Object, 정육면체의 모든 점(vertices)과 채움(faces)을 포함하는 객체
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // 재질, MeshBasicMaterial는 기본 재질로 적용될 속성 객체를 받음 color는 hex colors.
    const cube = new THREE.Mesh(geometry, material); // Object를 가져와 재질을 적용한 객체, 씬에 삽입하고 자유롭게 이동 가능

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); // 라인을 그릴때의 재질은 LineBasicMaterial를 별도로 사용해야한다.

    const points = []; // 라인이 지나갈 점들의 목록, 순서대로 이어짐
    points.push(new THREE.Vector3(-2, 0, 0)); // 시작점
    points.push(new THREE.Vector3(0, 2, 0)); // 중간점
    points.push(new THREE.Vector3(2, 0, 0)); // 끝점, 점 3개라 꺾인 선(∧자) 하나가 그려짐
    const LineGeometry = new THREE.BufferGeometry().setFromPoints(points); // points 배열을 정점 데이터로 변환
    const line = new THREE.Line(LineGeometry, lineMaterial); // geometry(정점)+material(색)을 합쳐 실제 라인 오브젝트 생성, scene.add() 해야 화면에 보임

    const camera = new THREE.PerspectiveCamera(
      75, // FOV(시야각) field of view, 화면에 보이는 장면의 범위 (도 단위)
      container.clientWidth / container.clientHeight, // 항상 요소의 너비/요소의 높이로 해야 찌그러지지 않음
      0.1, // near, 카메라로부터 이 거리보다 가까운건 렌더링 x
      1000, // far, 카메라로부터 이거리보다 먼건 렌더링 x
    );

    renderer.setSize(container.clientWidth, container.clientHeight); // 보통 브라우저 창의너비와 높이 사용, 성능이 중요하다면 setSize로 작게 렌더링 가능
    // 앱 크기는 유지하되 해상도를 낮추고 싶다면 setSize로 false를 지정해 호출하면?
    // `<canvas>`의 너비와 높이가 100%라면 false를 지정해 앱을 절반 해상도로 렌더링 한다. `updateStyle setSize(window.innerWidth/2, window.innerHeight/2, false)`
    renderer.domElement.style.position = "absolute"; // CSS3DRenderer와 같은 자리에 겹쳐야 하므로
    renderer.domElement.style.top = "0";
    container.appendChild(renderer.domElement);

    scene.add(cube);
    scene.add(line);
    camera.position.z = 5;

    // TextGeometry는 조명에 반응하는 재질을 쓰므로 빛이 있어야 입체(음영)가 보임
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1, 1, 2);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const spriteLabel = createTextSprite("Cube (Sprite)"); // 방식 1: Canvas Sprite 라벨
    spriteLabel.position.set(0, 1.2, 0); // 큐브 위에 배치
    scene.add(spriteLabel);

    let textMesh: THREE.Mesh | undefined; // 방식 2: TextGeometry (비동기 로드)
    loadTextGeometryMesh("Hi", (mesh) => {
      mesh.position.set(-2, 0, 0); // 큐브 왼쪽에 배치
      scene.add(mesh);
      textMesh = mesh;
    });

    const css3dLabel = createCss3dLabel("Cube (CSS3D)"); // 방식 3: CSS3DRenderer 라벨
    css3dLabel.position.set(0, -1.2, 0); // 큐브 아래에 배치
    scene.add(css3dLabel);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(container.clientWidth, container.clientHeight);
    cssRenderer.domElement.style.position = "absolute";
    cssRenderer.domElement.style.top = "0";
    cssRenderer.domElement.style.pointerEvents = "none"; // WebGL 캔버스 위에서 클릭을 가로채지 않도록
    container.style.position = "relative";
    container.appendChild(cssRenderer.domElement);

    function animate(time: number) {
      cube.rotation.x = time / 2000;
      cube.rotation.y = time / 1000;
      if (textMesh) {
        textMesh.rotation.y = time / 1000;
      }
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera); // CSS3D 레이어도 매 프레임 같이 렌더링
    }
    renderer.setAnimationLoop(animate); // 이렇게 구현 시 화면이 새로 고쳐질때마다 렌더러가 장면을 그리는 루프가 생성된다 (주사율 초당 60회)
    // setAnimationLoop는 rAF로 동작함
    // 왜 setInterval이 아니라 rAF냐
    // setInterval이라면?
    //   setInterval(() => {
    //   renderer.render(scene, camera);
    // }, 16); // 대충 60fps 노리고
    // 브라우저가 화면을 그리는 리페인트 타이밍이랑 안맞을 수 있다.
    // 사용자가 다른 탭으로 이동해도 계속 setInterval은 돌기 때문에 CPU/GPU 모두 사용하면서 큐브를 계속 그리고 있기 때문에 배터리, 발열, 소음 등 성능에서 안좋다.

    // rAF는 브라우저가 다음 화면을 그릴준비가 됐을때 콜백을 호출 (초당 60번)
    // 탭이 백그라운드로 갈 시 RAF호출을 멈춤
    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
      container.removeChild(cssRenderer.domElement);
    };
  }, []);

  return (
    <>
      <main className="min-w-0 flex-1 bg-muted/30">
        {/* 텍스트를 삽입하고 싶다면 직접 DOM요소로 추가, z-index로 높은 위치에 배치해야함 */}
        <div className="z-100 absolute top-20 w-full text-amber-50">
          Hello World
        </div>
        <div className="min-w-0 w-full h-full" ref={viewport} />
      </main>
      <main />
    </>
  );
}
