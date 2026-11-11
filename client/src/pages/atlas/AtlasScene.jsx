import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createExplosionLayout } from './explosion-layout.js';
import { decodeModelResponse } from './model-download.js';
import { PointerTap } from './pointer-tap.js';
import { SYSTEMS } from './atlasData.js';

const SYSTEM_COLORS = Object.fromEntries(SYSTEMS.map((system) => [system.id, system.color]));

function getTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

const AtlasScene = forwardRef(function AtlasScene(
  { atlas, state, onSelect, onStatus, onError, theme },
  ref,
) {
  const host = useRef(null);
  const latest = useRef(state);
  const select = useRef(onSelect);
  const status = useRef(onStatus);
  const fail = useRef(onError);
  const themeRef = useRef(theme || getTheme());
  const applyThemeRef = useRef(() => {});
  const apiRef = useRef({});

  latest.current = state;
  select.current = onSelect;
  status.current = onStatus;
  fail.current = onError;
  themeRef.current = theme || getTheme();

  useImperativeHandle(
    ref,
    () => ({
      ensureParts: (ids) => apiRef.current.ensureParts?.(ids) ?? Promise.resolve(),
      ensureSystem: (systemId) => apiRef.current.ensureSystem?.(systemId) ?? Promise.resolve(),
      resetView: () => apiRef.current.resetView?.(),
    }),
    [],
  );

  useEffect(() => {
    applyThemeRef.current(themeRef.current);
  }, [theme]);

  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;

    let disposed = false;
    let frame = 0;
    let dirty = true;
    let ready = false;
    let readyEmitted = false;
    let lastView = '';
    let lastReset = -1;
    let lastIsolate = '';
    let layoutKey = '';
    let amount = 0;
    let lastState = null;
    let lastRequiredKey = '';
    let needsFit = true;

    const abort = new AbortController();
    let renderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      fail.current?.(
        'Trình duyệt không khởi động được WebGL. Hãy dùng trình duyệt có hỗ trợ WebGL.',
      );
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, el.clientWidth < 768 ? 1.5 : 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Mô hình giải phẫu 3D tương tác. Kéo để xoay, cuộn để zoom và bấm vào cấu trúc để xem chi tiết.',
    );

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, 1, 0.005, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(1.4, 1.05, 3.6);
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.minDistance = 0.07;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.96;
    controls.addEventListener('change', () => {
      dirty = true;
    });

    const pmrem = new T.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();

    const hemi = new T.HemisphereLight(0xffffff, 0xa7acb2, 1.05);
    scene.add(hemi);
    const keyLight = new T.DirectionalLight(0xfffaf4, 2.3);
    keyLight.position.set(-2, 4, 3);
    scene.add(keyLight);
    const rimLight = new T.DirectionalLight(0xe9f0ff, 1.8);
    rimLight.position.set(2, 2, -3);
    scene.add(rimLight);

    const ground = new T.Mesh(
      new T.CircleGeometry(30, 96),
      new T.MeshStandardMaterial({ color: 0xd5d9dc, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.019;
    scene.add(ground);

    const platform = new T.Mesh(
      new T.CylinderGeometry(0.68, 0.7, 0.028, 100),
      new T.MeshStandardMaterial({ color: 0xeeeeec, metalness: 0.12, roughness: 0.67 }),
    );
    platform.position.y = -0.016;
    scene.add(platform);

    const ring = new T.Mesh(
      new T.RingGeometry(0.63, 0.632, 128),
      new T.MeshBasicMaterial({
        color: 0x8c969f,
        transparent: true,
        opacity: 0.4,
        side: T.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    scene.add(ring);

    const innerRing = new T.Mesh(
      new T.RingGeometry(0.55, 0.551, 128),
      new T.MeshBasicMaterial({
        color: 0xa4aeb8,
        transparent: true,
        opacity: 0.16,
        side: T.DoubleSide,
      }),
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.001;
    scene.add(innerRing);

    const applyTheme = (mode) => {
      if (!renderer) return;
      const dark = mode === 'dark';
      renderer.setClearColor(dark ? '#0b1220' : '#f2f3f3');
      ground.material.color.set(dark ? '#0f172a' : '#d5d9dc');
      platform.material.color.set(dark ? '#111c2e' : '#eeeeec');
      platform.material.metalness = dark ? 0.32 : 0.12;
      ring.material.color.set(dark ? '#64748b' : '#8c969f');
      innerRing.material.color.set(dark ? '#475569' : '#a4aeb8');
      hemi.intensity = dark ? 0.72 : 1.05;
      hemi.groundColor.set(dark ? '#1e293b' : '#a7acb2');
      keyLight.intensity = dark ? 2.05 : 2.3;
      rimLight.intensity = dark ? 1.45 : 1.8;
      dirty = true;
    };
    applyThemeRef.current = applyTheme;
    applyTheme(themeRef.current);

    const width = T.MathUtils.ceilPowerOfTwo(atlas.parts.length);
    const data = new Float32Array(width * 4);
    const partTexture = new T.DataTexture(data, width, 1, T.RGBAFormat, T.FloatType);
    partTexture.needsUpdate = true;

    const selectedData = new Uint8Array(width * 4);
    const selectionTexture = new T.DataTexture(selectedData, width, 1);
    selectionTexture.needsUpdate = true;

    const materials = [];
    const geometries = [];
    const pickers = [];
    const centers = atlas.parts.map((part) =>
      new T.Vector3()
        .fromArray(part.bounds[0])
        .add(new T.Vector3().fromArray(part.bounds[1]))
        .multiplyScalar(0.5),
    );
    const offsets = [];
    const bounds = atlas.parts.map(
      (part) =>
        new T.Box3(
          new T.Vector3().fromArray(part.bounds[0]),
          new T.Vector3().fromArray(part.bounds[1]),
        ),
    );

    let packingWidth = 1;
    let packingHeight = 1;

    const markerPositions = new Float32Array(atlas.parts.length * 3);
    const markerGeometry = new T.BufferGeometry();
    markerGeometry.setAttribute('position', new T.BufferAttribute(markerPositions, 3));
    const markerMaterial = new T.PointsMaterial({
      color: 0x64748b,
      size: 5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.72,
      depthTest: false,
    });
    markerMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;',
      );
    };
    const markers = new T.Points(markerGeometry, markerMaterial);
    markers.frustumCulled = false;
    markers.renderOrder = 10;
    markers.visible = false;
    scene.add(markers);

    const hover = document.createElement('div');
    hover.className = 'atlas-part-hover';
    hover.setAttribute('role', 'tooltip');
    hover.hidden = true;
    el.appendChild(hover);

    const findTarget = (x, y, radius, targets) => {
      let best = -1;
      let score = Infinity;
      for (const target of targets) {
        const dx = Math.max(target.left - x, 0, x - target.right);
        const dy = Math.max(target.top - y, 0, y - target.bottom);
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const candidate = distance + Math.hypot(target.x - x, target.y - y) * 0.025;
        if (candidate < score) {
          score = candidate;
          best = target.index;
        }
      }
      return best;
    };

    const materialFor = (system) => {
      const material = new T.MeshStandardMaterial({
        color: SYSTEM_COLORS[system] ?? '#aebbb8',
        metalness: 0.08,
        roughness: 0.53,
        side: T.DoubleSide,
        transparent: system === 'integumentary',
        opacity: system === 'integumentary' ? 0.1 : 1,
        depthWrite: system !== 'integumentary',
      });
      material.onBeforeCompile = (shader) => {
        shader.uniforms.partState = { value: partTexture };
        shader.uniforms.selectionState = { value: selectionTexture };
        shader.uniforms.stateWidth = { value: width };
        shader.vertexShader =
          'attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n' +
          shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;',
        );
        shader.fragmentShader =
          'varying float partVisible; varying float partSelected;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <clipping_planes_fragment>',
          '#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;',
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.85, 0.78), partSelected * 0.75);',
        );
      };
      materials.push(material);
      return material;
    };
    const mats = new Map(SYSTEMS.map((system) => [system.id, materialFor(system.id)]));

    const partById = new Map(atlas.parts.map((part) => [part.id, part]));
    const systemChunks = new Map();
    for (const part of atlas.parts) {
      const set = systemChunks.get(part.system) ?? new Set();
      set.add(part.chunk);
      systemChunks.set(part.system, set);
    }

    const loadedChunks = new Set();
    const loadingChunks = new Set();
    const chunkPromises = new Map();
    const queue = [];
    let activeLoads = 0;
    let loadedMeshes = 0;

    const stateChunks = (next = latest.current) => {
      const set = new Set();
      for (const system of next.visible) {
        for (const chunk of systemChunks.get(system) ?? []) set.add(chunk);
      }
      for (const id of next.selected) {
        const part = partById.get(id);
        if (part) set.add(part.chunk);
      }
      return set;
    };

    const emitStatus = (phase) => {
      const required = stateChunks();
      const loaded = [...required].filter((chunk) => loadedChunks.has(chunk)).length;
      const complete = required.size === 0 || loaded === required.size;
      if (complete && !readyEmitted) {
        readyEmitted = true;
        ready = true;
        needsFit = true;
        dirty = true;
      }
      status.current?.({
        phase: readyEmitted ? 'ready' : phase || 'loading',
        ready: readyEmitted,
        complete,
        loading: !complete || loadingChunks.size > 0,
        loaded,
        required: required.size,
        loadedChunks: loadedChunks.size,
        totalChunks: atlas.chunks.length,
        parts: loadedMeshes,
        totalParts: atlas.parts.length,
      });
    };

    const loadChunk = async (chunkIndex) => {
      if (loadedChunks.has(chunkIndex)) return;
      const chunk = atlas.chunks[chunkIndex];
      if (!chunk) throw new Error('Không tìm thấy chunk giải phẫu.');
      loadingChunks.add(chunkIndex);
      emitStatus('loading');
      try {
        const compressed = Boolean(chunk.gzip);
        const response = await fetch(compressed ? chunk.gzip : chunk.url, {
          signal: abort.signal,
        });
        const buffer = await decodeModelResponse(response, chunk.bytes, compressed);
        if (disposed) return;

        const groups = new Map();
        atlas.parts.forEach((part, index) => {
          if (part.chunk !== chunkIndex) return;
          const geometry = new T.BufferGeometry();
          geometry.setAttribute(
            'position',
            new T.BufferAttribute(
              new Float32Array(buffer, part.positions, part.vertexCount * 3),
              3,
            ),
          );
          geometry.setAttribute(
            'normal',
            new T.BufferAttribute(
              new Int16Array(buffer, part.normals, part.vertexCount * 3),
              3,
              true,
            ),
          );
          geometry.setIndex(
            new T.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1),
          );
          geometry.boundingBox = bounds[index].clone();
          geometry.computeBoundingSphere();
          geometry.setAttribute(
            'partIndex',
            new T.BufferAttribute(new Float32Array(part.vertexCount).fill(index), 1),
          );
          const pick = new T.Mesh(geometry);
          pick.matrixAutoUpdate = false;
          pickers[index] = pick;
          geometries.push(geometry);
          const list = groups.get(part.system) ?? [];
          list.push(geometry);
          groups.set(part.system, list);
          loadedMeshes += 1;
        });

        groups.forEach((list, system) => {
          const geometry = mergeGeometries(list, false);
          if (!geometry) throw new Error('Không ghép được hình học giải phẫu.');
          geometries.push(geometry);
          const mesh = new T.Mesh(geometry, mats.get(system));
          mesh.frustumCulled = false;
          scene.add(mesh);
        });

        loadedChunks.add(chunkIndex);
        loadingChunks.delete(chunkIndex);
        lastState = null;
        layoutKey = '';
        dirty = true;
        needsFit = true;
        emitStatus('ready');
      } catch (error) {
        loadingChunks.delete(chunkIndex);
        chunkPromises.delete(chunkIndex);
        if (!disposed && error?.name !== 'AbortError') {
          fail.current?.(error?.message || 'Không tải được hình học giải phẫu.');
        }
        throw error;
      }
    };

    const pump = () => {
      while (activeLoads < 3 && queue.length) {
        const item = queue.shift();
        if (loadedChunks.has(item.chunk)) {
          item.resolve();
          continue;
        }
        activeLoads += 1;
        loadChunk(item.chunk)
          .then(item.resolve)
          .catch(item.reject)
          .finally(() => {
            activeLoads -= 1;
            pump();
          });
      }
    };

    const ensureChunk = (chunkIndex) => {
      if (loadedChunks.has(chunkIndex)) return Promise.resolve();
      if (chunkPromises.has(chunkIndex)) return chunkPromises.get(chunkIndex);
      const promise = new Promise((resolve, reject) => {
        queue.push({ chunk: chunkIndex, resolve, reject });
      });
      chunkPromises.set(chunkIndex, promise);
      pump();
      return promise;
    };

    const ensureChunks = (chunks) => Promise.all([...chunks].map((chunk) => ensureChunk(chunk)));

    apiRef.current = {
      ensureParts: (ids) =>
        ensureChunks(
          new Set(
            ids
              .map((id) => partById.get(id))
              .filter(Boolean)
              .map((part) => part.chunk),
          ),
        ),
      ensureSystem: (systemId) => ensureChunks(systemChunks.get(systemId) ?? []),
      resetView: () => {
        controls.reset();
        camera.position.set(1.4, 1.05, 3.6);
        controls.target.set(0, 0.85, 0);
        controls.update();
        dirty = true;
      },
    };

    const initialChunks = stateChunks();
    emitStatus('loading');
    ensureChunks(initialChunks).catch(() => {});

    const fit = (view, extent = 0) => {
      const mobile = el.clientWidth < 768;
      const reservedHeight = mobile ? 330 : 270;
      const horizontalReserve = mobile ? 40 : 320;
      const normalDistance = mobile
        ? Math.max(
            4.5,
            (1.8 * el.clientHeight) /
              Math.max(160, el.clientHeight - reservedHeight) /
              (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2))),
          )
        : 4;
      const availableAspect = Math.max(
        0.35,
        (el.clientWidth - horizontalReserve) / Math.max(160, el.clientHeight - reservedHeight),
      );
      const atlasDistance =
        (Math.max(packingHeight, packingWidth / availableAspect) /
          (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
        (el.clientHeight / Math.max(160, el.clientHeight - reservedHeight)) *
        1.08;
      const distance = T.MathUtils.lerp(normalDistance, Math.max(0.2, atlasDistance), extent);
      if (extent > 0.8) view = 'front';
      const direction =
        view === 'front'
          ? new T.Vector3(0, 0.02, 1)
          : view === 'back'
            ? new T.Vector3(0, 0.02, -1)
            : view === 'side'
              ? new T.Vector3(1, 0.02, 0)
              : new T.Vector3(0.35, 0.06, 1).normalize();
      controls.target.set(
        extent > 0.1 && el.clientWidth > 767 ? -packingWidth * 0.12 : 0,
        extent > 0.1 || mobile ? 0.85 : 0.68,
        0,
      );
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      controls.update();
      dirty = true;
    };

    const resize = () => {
      layoutKey = '';
      lastState = null;
      needsFit = true;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, el.clientWidth < 768 || el.clientHeight < 600 ? 1.5 : 2),
      );
      camera.aspect = el.clientWidth / Math.max(1, el.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit(latest.current.view, amount);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    const tap = new PointerTap();
    const worldBox = new T.Box3();
    const hitPoint = new T.Vector3();
    let targets = [];
    let lastHoverAt = 0;

    const down = (event) => {
      hover.hidden = true;
      tap.down(
        event.pointerId,
        event.clientX,
        event.clientY,
        event.pointerType === 'touch' ? 12 : 5,
      );
    };

    const move = (event) => {
      tap.move(event.pointerId, event.clientX, event.clientY);
      if (event.buttons || amount < 0.5 || event.pointerType === 'touch') {
        hover.hidden = true;
        return;
      }
      const now = performance.now();
      if (now - lastHoverAt < 40) return;
      lastHoverAt = now;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const index = findTarget(x, y, 12, targets);
      hover.hidden = index < 0;
      renderer.domElement.style.cursor = index < 0 ? 'grab' : 'pointer';
      if (index >= 0) {
        hover.textContent = atlas.parts[index].name;
        hover.style.left = `${Math.max(8, Math.min(x + 14, el.clientWidth - 260))}px`;
        hover.style.top = `${Math.max(8, Math.min(y + 18, el.clientHeight - 55))}px`;
      }
    };

    const cancel = (event) => tap.cancel(event.pointerId);

    const up = (event) => {
      const validTap = tap.up(event.pointerId, event.clientX, event.clientY);
      if (!validTap || !ready) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      let nearest = Infinity;
      let found = -1;
      const hasSolid = atlas.parts.some(
        (part, index) => part.system !== 'integumentary' && data[index * 4 + 3] > 0.5,
      );
      pickers.forEach((mesh, index) => {
        if (
          !mesh ||
          data[index * 4 + 3] < 0.5 ||
          (hasSolid && atlas.parts[index].system === 'integumentary')
        ) {
          return;
        }
        worldBox.copy(bounds[index]).translate(mesh.position);
        if (!raycaster.ray.intersectBox(worldBox, hitPoint)) return;
        const hits = raycaster.intersectObject(mesh, false);
        if (hits[0] && hits[0].distance < nearest) {
          nearest = hits[0].distance;
          found = index;
        }
      });
      if (found < 0 && amount > 0.45) {
        found = findTarget(
          event.clientX - rect.left,
          event.clientY - rect.top,
          event.pointerType === 'touch' ? 24 : 16,
          targets,
        );
      }
      if (found >= 0) {
        hover.hidden = true;
        select.current?.(atlas.parts[found].id);
      }
    };

    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);

    const clock = new T.Clock();
    let lastExtent = -1;
    const projected = new T.Vector3();

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const nextState = latest.current;
      const changed =
        lastState?.visible !== nextState.visible ||
        lastState?.selected !== nextState.selected ||
        lastState?.isolate !== nextState.isolate ||
        lastState?.highlightSelection !== nextState.highlightSelection;
      const moving = Math.abs(amount - nextState.explode) > 0.0001;

      const required = stateChunks(nextState);
      const requiredKey = [...required].sort((a, b) => a - b).join(',');
      if (requiredKey !== lastRequiredKey) {
        lastRequiredKey = requiredKey;
        ensureChunks(required).catch(() => {});
        emitStatus('loading');
      }

      if (moving) {
        amount = T.MathUtils.damp(amount, nextState.explode, 8, dt);
        dirty = true;
      }

      if (changed || moving || lastExtent < 0 || needsFit) {
        const visible = new Set(nextState.visible);
        const selection = new Set(nextState.selected);
        const visibleParts = atlas.parts.filter(
          (part) =>
            loadedChunks.has(part.chunk) &&
            (nextState.isolate
              ? selection.has(part.id)
              : visible.has(part.system) || selection.has(part.id)),
        );
        const nextLayoutKey = `${visibleParts.map((part) => part.id).join(',')}:${camera.aspect.toFixed(3)}`;
        if (nextLayoutKey !== layoutKey) {
          const layout = createExplosionLayout(visibleParts, camera.aspect);
          packingWidth = layout.width || 1;
          packingHeight = layout.height || 1;
          atlas.parts.forEach((part, index) => {
            const cell = layout.cells.get(part.id);
            offsets[index] = cell
              ? new T.Vector3(cell.x, cell.y + 0.85, 0)
              : centers[index].clone();
          });
          layoutKey = nextLayoutKey;
          if (amount > 0.05 && !nextState.isolate) {
            fit(nextState.view, Math.max(0, (amount - 0.3) / 0.7));
          }
          if (needsFit) {
            fit(nextState.view, amount);
            needsFit = false;
          }
        }

        atlas.parts.forEach((part, index) => {
          const center = centers[index];
          const destination = offsets[index] ?? center;
          let dx = 0;
          let dy = 0;
          let dz = 0;
          if (amount <= 0.45) {
            const t = amount / 0.45;
            const group = Math.max(
              0,
              SYSTEMS.findIndex((system) => system.id === part.system),
            );
            const angle = (group / SYSTEMS.length) * Math.PI * 2;
            dx = Math.sin(angle) * t * 0.48;
            dy = (center.y - 0.85) * t * 0.28;
            dz = Math.cos(angle) * t * 0.48;
          } else {
            const t = (amount - 0.45) / 0.55;
            const group = Math.max(
              0,
              SYSTEMS.findIndex((system) => system.id === part.system),
            );
            const angle = (group / SYSTEMS.length) * Math.PI * 2;
            dx = T.MathUtils.lerp(Math.sin(angle) * 0.48, destination.x - center.x, t);
            dy = T.MathUtils.lerp((center.y - 0.85) * 0.28, destination.y - center.y, t);
            dz = T.MathUtils.lerp(Math.cos(angle) * 0.48, -center.z, t);
          }
          const isSelected = selection.has(part.id);
          const isHighlighted = isSelected && nextState.highlightSelection !== false;
          const visibleNow =
            loadedChunks.has(part.chunk) &&
            (nextState.isolate ? isSelected : visible.has(part.system) || isSelected);
          data.set([dx, dy, dz, visibleNow ? 1 : 0], index * 4);
          selectedData[index * 4] = isHighlighted ? 255 : 0;
          markerPositions.set(
            visibleNow ? [center.x + dx, center.y + dy, center.z + dz] : [10000, 10000, 10000],
            index * 3,
          );
          const mesh = pickers[index];
          if (mesh) {
            mesh.position.set(dx, dy, dz);
            mesh.updateMatrix();
            mesh.updateMatrixWorld(true);
          }
        });
        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;
        markerGeometry.attributes.position.needsUpdate = true;
        lastState = nextState;
        lastExtent = amount;
        needsFit = false;
        dirty = true;
      }

      if (nextState.view !== lastView || nextState.reset !== lastReset) {
        fit(nextState.view, amount);
        lastView = nextState.view;
        lastReset = nextState.reset;
      }
      if (moving && !nextState.isolate) {
        fit(amount > 0.5 ? 'front' : nextState.view, Math.max(0, (amount - 0.3) / 0.7));
      }

      const isolateKey = nextState.isolate
        ? `${nextState.selected.join(',')}:${nextState.reset}:${nextState.inspectorOpen}:${nextState.layersOpen}:${camera.aspect}`
        : '';
      if (isolateKey !== lastIsolate || (nextState.isolate && moving)) {
        if (nextState.isolate) {
          const box = new T.Box3();
          atlas.parts.forEach((part, index) => {
            if (nextState.selected.includes(part.id)) {
              box.union(
                bounds[index]
                  .clone()
                  .translate(
                    new T.Vector3(data[index * 4], data[index * 4 + 1], data[index * 4 + 2]),
                  ),
              );
            }
          });
          if (!box.isEmpty()) {
            const center = box.getCenter(new T.Vector3());
            const size = box.getSize(new T.Vector3());
            const w = el.clientWidth;
            const h = el.clientHeight;
            const mobile = w < 768;
            // The landscape shortcut is for phones on their side, not for a
            // short desktop viewport. Without the `mobile` guard it steals the
            // desktop layout and left-aligns the isolated structure.
            const landscape = mobile && w > h && h <= 600;
            let left = 20;
            let right = w - 20;
            let top = mobile ? 175 : 110;
            let bottom = h - 170;
            if (nextState.inspectorOpen) {
              if (landscape) {
                right = w - 335;
                top = 100;
                bottom = h - 125;
              } else if (mobile) {
                const sheet = document.querySelector('.atlas-detail')?.getBoundingClientRect();
                const header = document.querySelector('.atlas-identity')?.getBoundingClientRect();
                top = (header?.bottom ?? 94) + 16;
                bottom = (sheet?.top ?? h * 0.58 - 139) - 16;
              } else {
                right = w - 370;
                // Keep the isolated structure in the open area between the
                // systems rail and the detail sheet. The old `w > 1100`
                // threshold made 1,000–1,100 px screens center the model
                // behind the systems rail.
                left = nextState.layersOpen === false ? 25 : 285;
              }
            }
            let availableWidth = Math.max(150, right - left);
            let availableHeight = Math.max(40, bottom - top);
            let centerX = (left + right) / 2;
            let centerY = (top + bottom) / 2;

            // On a roomy desktop, center on the actual screen instead of the
            // midpoint of the remaining strip. Fit within symmetric margins so
            // the zoomed structure still cannot run under either panel.
            if (!mobile) {
              const halfW = w / 2;
              const halfH = h / 2;
              const leftSpace = halfW - left;
              const rightSpace = right - halfW;
              const topSpace = halfH - top;
              const bottomSpace = bottom - halfH;

              if (leftSpace > 150 && rightSpace > 150) {
                centerX = halfW;
                availableWidth = 2 * Math.min(leftSpace, rightSpace);
              }
              if (topSpace > 100 && bottomSpace > 100) {
                centerY = halfH;
                availableHeight = 2 * Math.min(topSpace, bottomSpace);
              }
            }

            camera.setViewOffset(w, h, w / 2 - centerX, h / 2 - centerY, w, h);
            const distance = Math.max(
              0.07,
              (Math.max(
                (size.y * h) / availableHeight,
                (size.x * w) / availableWidth / camera.aspect,
                size.z,
              ) /
                (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
                1.35,
            );
            controls.maxDistance = Math.max(40, distance * 2);
            controls.target.copy(center);
            camera.position
              .copy(center)
              .add(new T.Vector3(0.2, 0.1, 1).normalize().multiplyScalar(distance));
            controls.update();
            dirty = true;
          }
        } else if (lastIsolate) {
          camera.clearViewOffset();
          fit(nextState.view, amount);
        }
        lastIsolate = isolateKey;
      }

      controls.enableRotate = amount < 0.8;
      controls.mouseButtons.LEFT = amount < 0.8 ? T.MOUSE.ROTATE : T.MOUSE.PAN;
      controls.touches.ONE = amount < 0.8 ? T.TOUCH.ROTATE : T.TOUCH.PAN;
      ground.visible =
        platform.visible =
        ring.visible =
        innerRing.visible =
          amount < 0.5 && !nextState.isolate;
      markers.visible = amount > 0.75;
      controls.autoRotate = nextState.rotate && !nextState.isolate && amount < 0.4;
      controls.autoRotateSpeed = 0.65;
      controls.update();
      if (controls.autoRotate) dirty = true;

      if (dirty) {
        renderer.render(scene, camera);
        targets = [];
        if (amount > 0.45) {
          const hasSolid = atlas.parts.some(
            (part, index) => part.system !== 'integumentary' && data[index * 4 + 3] > 0.5,
          );
          atlas.parts.forEach((part, index) => {
            if (data[index * 4 + 3] < 0.5 || (hasSolid && part.system === 'integumentary')) {
              return;
            }
            let left = Infinity;
            let right = -Infinity;
            let top = Infinity;
            let bottom = -Infinity;
            for (let corner = 0; corner < 8; corner += 1) {
              projected
                .set(
                  part.bounds[corner & 1 ? 1 : 0][0] + data[index * 4],
                  part.bounds[corner & 2 ? 1 : 0][1] + data[index * 4 + 1],
                  part.bounds[corner & 4 ? 1 : 0][2] + data[index * 4 + 2],
                )
                .project(camera);
              const x = ((projected.x + 1) * el.clientWidth) / 2;
              const y = ((1 - projected.y) * el.clientHeight) / 2;
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
            projected
              .copy(centers[index])
              .add(new T.Vector3(data[index * 4], data[index * 4 + 1], data[index * 4 + 2]))
              .project(camera);
            if (projected.z < -1 || projected.z > 1) return;
            targets.push({
              index,
              x: ((projected.x + 1) * el.clientWidth) / 2,
              y: ((1 - projected.y) * el.clientHeight) / 2,
              left,
              right,
              top,
              bottom,
            });
          });
        }
        dirty = false;
      }
    };
    animate();

    const contextLost = (event) => {
      event.preventDefault();
      fail.current?.('Phiên 3D bị trình duyệt tạm dừng. Hãy tải lại trang để tiếp tục.');
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      scene.traverse((object) => {
        if (object instanceof T.Mesh && !geometries.includes(object.geometry)) {
          object.geometry.dispose();
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach((material) => material.dispose());
        }
      });
      env.dispose();
      partTexture.dispose();
      selectionTexture.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      hover.remove();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [atlas]);

  return <div ref={host} className="atlas-scene h-full w-full" />;
});

export default AtlasScene;
