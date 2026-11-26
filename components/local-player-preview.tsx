"use client";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import assets from "@/public/models/locker/index.json";
import catalog from "@/data/locker-catalog.json";
import { paintFace } from "@/lib/local-face";
import type { Look } from "@/lib/local-look";
import type { Orbit } from "@/lib/orbit-atlas";

export type PlayerPreviewHandle = {
  capture: (expectedConfig?: Look) => string;
};
const loader = new GLTFLoader();
let numberFont: Promise<FontFace> | undefined;
function loadNumberFont() {
  numberFont ??= new FontFace(
    "Varsity Team",
    "url(/fonts/VarsityTeam-Bold.otf)",
  )
    .load()
    .then((font) => {
      document.fonts.add(font);
      return font;
    });
  return numberFont;
}
const models = new Map<string, Promise<THREE.Group>>();
function model(url: string) {
  let promise = models.get(url);
  if (!promise) {
    promise = loader
      .loadAsync(url)
      .then((g) => g.scene)
      .catch((error) => {
        models.delete(url);
        throw error;
      });
    models.set(url, promise);
  }
  return promise.then((g) => g.clone(true));
}
const dict = (v: unknown): Look =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Look) : {};
const num = (c: Look, k: string, d = 0.5) =>
  typeof c[k] === "number" ? Number(c[k]) : d;
const color = (value: unknown, fallback: string) =>
  new THREE.Color("#" + String(value ?? fallback).replace(/^#/, ""));
const radians = (v: number) => (v * Math.PI) / 180;
function dispose(group: THREE.Object3D) {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      for (const material of Array.isArray(o.material)
        ? o.material
        : [o.material])
        material.dispose();
    }
  });
}

export function LocalPlayerPreview({
  config,
  outfit = "uniform",
  view = "full",
  orbit,
  onOrbit,
  onImage,
  onError,
  ref,
}: {
  config: Look;
  outfit?: string;
  view?: string;
  orbit: Orbit;
  onOrbit?: (v: Orbit) => void;
  onImage?: (image: string) => void;
  onError?: (message: string) => void;
  ref?: Ref<PlayerPreviewHandle>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onOrbit, onImage, onError });
  useEffect(() => {
    callbacks.current = { onOrbit, onImage, onError };
  }, [onOrbit, onImage, onError]);
  const state = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    root: THREE.Group;
    face?: THREE.Texture;
    number?: THREE.Texture;
    draw: () => void;
    loadedConfig?: Look;
  } | null>(null);
  useImperativeHandle(
    ref,
    () => ({
      capture: (expectedConfig) => {
        const s = state.current;
        if (!s) throw Error("The 3D player is still loading");
        if (expectedConfig && s.loadedConfig !== expectedConfig)
          throw Error(
            "Your look is still loading. Try the download again in a moment.",
          );
        const size = s.renderer.getSize(new THREE.Vector2());
        const scale = Math.max(1, 1240 / (size.y * s.renderer.getPixelRatio()));
        try {
          s.renderer.setSize(size.x * scale, size.y * scale, false);
          s.draw();
          return s.renderer.domElement.toDataURL("image/png");
        } finally {
          s.renderer.setSize(size.x, size.y, false);
          s.draw();
        }
      },
    }),
    [],
  );
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      callbacks.current.onError?.(
        "This browser cannot create a WebGL preview. Try a browser with hardware acceleration enabled.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf3f3fb, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:none";
    renderer.domElement.setAttribute("aria-label", "Interactive 3D player");
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
    camera.position.set(0, 1.05, 4.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.05, 0);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    controls.minPolarAngle = radians(40);
    controls.maxPolarAngle = radians(140);
    controls.rotateSpeed = 0.75;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9b8e82, 1));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-3, 5, 6);
    scene.add(light);
    const root = new THREE.Group();
    scene.add(root);
    const draw = () => renderer.render(scene, camera);
    state.current = { renderer, scene, camera, controls, root, draw };
    controls.addEventListener("change", draw);
    controls.addEventListener("end", () => {
      callbacks.current.onOrbit?.({
        yaw: -THREE.MathUtils.radToDeg(controls.getAzimuthalAngle()),
        pitch: 90 - THREE.MathUtils.radToDeg(controls.getPolarAngle()),
      });
      callbacks.current.onImage?.(renderer.domElement.toDataURL("image/png"));
    });
    const resize = new ResizeObserver(() => {
      const w = element.clientWidth,
        h = element.clientHeight;
      if (w && h) {
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        draw();
      }
    });
    resize.observe(element);
    controls.update();
    return () => {
      resize.disconnect();
      controls.dispose();
      dispose(root);
      state.current?.face?.dispose();
      state.current?.number?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      state.current = null;
    };
  }, []);
  useEffect(() => {
    const s = state.current;
    if (!s) return;
    let cancelled = false;
    const gear =
      outfit === "uniform" ? config : { ...config, ...dict(config.gg) };
    const urls: [string, string, Look?][] = [
      [outfit === "uniform" ? assets.body : assets.gym, "body"],
    ];
    const hair = assets.hair[String(config.hair) as keyof typeof assets.hair];
    if (hair) urls.push([hair, "hair"]);
    const beard = assets.beard[String(config.fh) as keyof typeof assets.beard];
    if (beard) urls.push([beard, "beard"]);
    for (const [slot, value] of Object.entries(dict(config.acc))) {
      const item = dict(value);
      const url =
        assets.accessories[String(item.id) as keyof typeof assets.accessories];
      if (url) urls.push([url, slot, item]);
    }
    Promise.all([
      Promise.all(
        urls.map(async ([url, kind, item]) => ({
          object: await model(url),
          kind,
          item,
        })),
      ),
      paintFace(config),
      loadNumberFont(),
    ])
      .then(([parts, faceCanvas]) => {
        if (cancelled) return;
        const old = s.root.children.slice();
        s.root.clear();
        old.forEach(dispose);
        s.face?.dispose();
        s.number?.dispose();
        s.face = new THREE.CanvasTexture(faceCanvas);
        s.face.colorSpace = THREE.SRGBColorSpace;
        s.face.flipY = false;
        const numberCanvas = document.createElement("canvas");
        numberCanvas.width = 256;
        numberCanvas.height = 256;
        const nc = numberCanvas.getContext("2d")!;
        nc.fillStyle =
          "#" +
          String(
            (Array.isArray(config.kh) ? config.kh[3] : undefined) ?? "ffffff",
          );
        nc.textAlign = "center";
        nc.textBaseline = "middle";
        nc.font = '190px "Varsity Team", sans-serif';
        nc.fillText(String(config.num ?? 1), 128, 134);
        s.number = new THREE.CanvasTexture(numberCanvas);
        s.number.colorSpace = THREE.SRGBColorSpace;
        s.number.flipY = false;
        const kit =
          outfit === "uniform" && Array.isArray(config.kh)
            ? config.kh
            : [
                config.gt ?? "ecebe3",
                config.gs ?? "618fd6",
                "ffffff",
                "ffffff",
              ];
        const zones =
          [
            ["accent", "pants_accent"],
            ["jerseyfront"],
            ["jerseyback"],
            ["jerseycollar", "pantswaist"],
            ["jerseycollar", "pantshem", "pantswaist"],
            ["accent", "jerseycollar", "pants_accent", "pantshem"],
            ["jerseyfront", "pantshem"],
            [],
          ][Number(config.kst ?? 0)] ?? [];
        const skinOptions = catalog.fields.find((f) => f.key === "skin")
          ?.options as { value: unknown; color?: string }[] | undefined;
        const skin = config.skx
          ? String(config.skc ?? "ffdeba")
          : (skinOptions?.find((o) => o.value === config.skin)?.color ??
            "ffdeba");
        for (const { object, kind, item } of parts) {
          let accessoryMaterial = 0;
          object.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            node.frustumCulled = false;
            if (node.morphTargetDictionary && node.morphTargetInfluences) {
              const head = ["", "sharp", "square", "round"][
                Number(config.hs ?? 0)
              ];
              const shorts = ["", "short", "long", "supershort"][
                Number(gear.sl ?? 0)
              ];
              for (const [key, index] of Object.entries(
                node.morphTargetDictionary,
              )) {
                const lower = key.toLowerCase();
                node.morphTargetInfluences[index] =
                  lower === "heavy"
                    ? Math.max(0, (num(config, "w") - 0.5) * 2)
                    : lower === "slim"
                      ? Math.max(0, (0.5 - num(config, "w")) * 2)
                      : ["sharp", "square", "round"].includes(lower)
                        ? Number(lower === head)
                        : node.name.includes("earsmesh")
                          ? Number(lower === String(config.ear).toLowerCase())
                          : node.name.includes("shortsmesh")
                            ? Number(lower === shorts)
                            : node.name.includes("sockmesh")
                              ? Number(key === "Short" && gear.skl === 0)
                              : ["tanktop", "sports bra"].includes(lower)
                                ? Number(
                                    outfit !== "uniform" &&
                                      lower ===
                                        ["", "tanktop", "sports bra"][
                                          Number(config.gsh)
                                        ],
                                  )
                                : 0;
              }
            }
            const convert = (source: THREE.Material) => {
              const old = source as THREE.MeshStandardMaterial;
              const name = source.name.replace(/\d+$/, "");
              const material = new THREE.MeshToonMaterial({
                color: old.color ?? 0xffffff,
                map: old.map,
                transparent: old.transparent,
                opacity: old.opacity,
                side: old.side,
                alphaTest: old.transparent ? 0.05 : 0,
              });
              material.name = source.name;
              if (name === "outline" || /Outline/.test(node.name)) {
                material.color.set(0x111119);
                material.side = THREE.BackSide;
                return material;
              }
              if (kind === "hair" || kind === "beard") {
                const cols = Array.isArray(
                  config[kind === "hair" ? "hcols" : "fhcols"],
                )
                  ? (config[kind === "hair" ? "hcols" : "fhcols"] as string[])
                  : [];
                const slot = Number(source.name.split("_slot_")[1]);
                material.color.copy(color(cols[slot] || config.hcol, "211a14"));
              } else if (item) {
                const colors = Array.isArray(item.cols) ? item.cols : [];
                if (colors[accessoryMaterial])
                  material.color.copy(
                    color(colors[accessoryMaterial], "ffffff"),
                  );
                accessoryMaterial++;
              } else if (
                name === "skin" ||
                name === "body" ||
                /Hand[LR]/.test(node.name)
              )
                material.color.copy(color(skin, "ffdeba"));
              else if (name.includes("jersey") || name === "accent")
                material.color.copy(
                  color(zones.includes(name) ? kit[2] : kit[0], "4b83d5"),
                );
              else if (name === "shorts" || name.startsWith("pants"))
                material.color.copy(
                  color(zones.includes(name) ? kit[2] : kit[1], "17171c"),
                );
              else if (name === "socks")
                material.color.copy(color(gear.sk, "17171c"));
              else if (name === "kneepad")
                material.color.copy(
                  color(
                    node.name.includes("_l") && !gear.kpm ? gear.kpl : gear.kp,
                    "17171c",
                  ),
                );
              else if (name === "shoes")
                material.color.copy(
                  color(
                    node.name.includes("_l") && !gear.shm ? gear.shl : gear.sh,
                    "17171c",
                  ),
                );
              if (name === "kneepad") {
                material.opacity = 1;
                material.transparent = false;
              }
              if (name === "hoodie")
                material.color.copy(
                  color(config.hdx ? config.hdc : kit[0], "4d8cf2"),
                );
              if (name === "face_tex") {
                material.map = s.face!;
                material.color.set(0xffffff);
                material.transparent = true;
                material.side = THREE.DoubleSide;
                material.depthWrite = false;
                node.renderOrder = 2;
              }
              if (name.startsWith("practice_jersey")) {
                material.opacity = outfit === "pinny" ? 1 : 0;
                if (outfit === "pinny")
                  material.color.copy(
                    color(
                      Array.isArray(config.kh) ? config.kh[0] : undefined,
                      "4d8cf2",
                    ),
                  );
                material.transparent = true;
              }
              if (name === "number_tex") {
                material.map = s.number!;
                material.color.set(0xffffff);
                material.transparent = true;
                material.depthWrite = false;
                material.opacity = outfit === "casual" ? 0 : 1;
              }
              return material;
            };
            node.material = Array.isArray(node.material)
              ? node.material.map(convert)
              : convert(node.material);
            if (node.name.includes("hood"))
              node.visible = outfit !== "uniform" && Number(config.gsh) === 3;
            if (node.name.includes("sockmesh"))
              node.visible = gear.gso !== false;
            if (node.name.includes("kneepad")) {
              const left = node.name.includes("_l"),
                style = Number(left && !gear.kpm ? gear.kpsl : gear.kps) || 0;
              const match =
                style === 1
                  ? /kneepad_[lr]__/.test(node.name)
                  : node.name.includes("kneepad_short_");
              node.visible =
                gear.gkp !== false &&
                match &&
                (num(gear, "kpw", 0) === 0 ||
                  node.name.includes(num(gear, "kpw", 0) === 1 ? "_r" : "_l"));
            }
            if (node.name.includes("earsmesh")) {
              node.visible = config.ear !== "None";
            }
          });
          if (item) {
            const pivot = new THREE.Vector3(0, 1.477, 0);
            for (const child of object.children) child.position.sub(pivot);
            object.position.copy(pivot);
            object.position.add(
              new THREE.Vector3(
                (num(item, "px") - 0.5) * 0.6,
                (num(item, "py") - 0.5) * 0.6,
                (num(item, "pz") - 0.5) * 0.6,
              ),
            );
            object.rotation.set(
              (num(item, "rx") - 0.5) * Math.PI,
              (num(item, "ry") - 0.5) * Math.PI + (item.back ? Math.PI : 0),
              (num(item, "rz") - 0.5) * Math.PI,
            );
            const scale = 0.5 + num(item, "sc");
            object.scale.set(
              scale * (0.5 + num(item, "sx")),
              scale * (0.5 + num(item, "sy")),
              scale * (0.5 + num(item, "sz")),
            );
            if (item.fl) object.scale.x *= -1;
          }
          if (kind === "hair" && config.hfl) object.scale.x *= -1;
          if (kind === "beard") {
            const pivot = new THREE.Vector3(0, 1.477, 0);
            for (const child of object.children) child.position.sub(pivot);
            object.position.copy(pivot);
            object.position.add(
              new THREE.Vector3(
                (num(config, "fpx") - 0.5) * 0.5,
                (num(config, "fpy") - 0.5) * 0.6,
                (num(config, "fpz") - 0.5) * 0.5,
              ),
            );
            object.rotation.set(
              (num(config, "frx") - 0.5) * Math.PI,
              (num(config, "fry") - 0.5) * Math.PI,
              (num(config, "frz") - 0.5) * Math.PI,
            );
            const scale = 0.5 + num(config, "fsc");
            object.scale.set(
              scale * (0.5 + num(config, "fsx")),
              scale * (0.5 + num(config, "fsy")),
              scale * (0.5 + num(config, "fsz")),
            );
          }
          s.root.add(object);
        }
        s.root.scale.setScalar(1 + (num(config, "h") - 0.5) * 0.12);
        s.root.updateMatrixWorld(true);
        const meshes: THREE.Mesh[] = [];
        s.root.traverse((node) => {
          if (node instanceof THREE.Mesh) meshes.push(node);
        });
        for (const mesh of meshes) {
          if (!mesh.visible || /number|face__/i.test(mesh.name)) continue;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          if (materials.every((material) => material.opacity === 0)) continue;
          const outline = new THREE.MeshToonMaterial({
            color: 0x111119,
            side: THREE.BackSide,
          });
          const thickness =
            (0.018 / mesh.getWorldScale(new THREE.Vector3()).length()) *
            Math.sqrt(3);
          outline.onBeforeCompile = (shader) => {
            shader.uniforms.inkWidth = { value: thickness };
            shader.vertexShader =
              "uniform float inkWidth;\n" +
              shader.vertexShader.replace(
                "#include <project_vertex>",
                "transformed += normalize(objectNormal) * inkWidth;\n#include <project_vertex>",
              );
          };
          const shell = new THREE.Mesh(mesh.geometry, outline);
          shell.morphTargetInfluences = mesh.morphTargetInfluences;
          shell.renderOrder = -1;
          mesh.add(shell);
        }
        s.loadedConfig = config;
        s.draw();
        callbacks.current.onImage?.(
          s.renderer.domElement.toDataURL("image/png"),
        );
      })
      .catch((error) => {
        if (!cancelled)
          callbacks.current.onError?.(
            error instanceof Error
              ? error.message
              : "Could not load the 3D player",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [config, outfit]);
  useEffect(() => {
    const s = state.current;
    if (!s) return;
    const target = view === "head" ? 1.5 : 1.05;
    const radius = view === "head" ? 1.8 : 4.4;
    s.controls.target.set(0, target, 0);
    s.camera.position
      .setFromSpherical(
        new THREE.Spherical(
          radius,
          radians(90 - orbit.pitch),
          radians(-orbit.yaw),
        ),
      )
      .add(s.controls.target);
    s.controls.update();
    s.draw();
  }, [orbit.yaw, orbit.pitch, view]);
  return <div ref={host} style={{ position: "absolute", inset: 0 }} />;
}
