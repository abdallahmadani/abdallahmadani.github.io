const visited = new Set([
  "Syria","Jordan","Lebanon","United Arab Emirates","Saudi Arabia",
  "Germany","Italy","France","Switzerland","Austria","Canada","United States"
]);

const modal = document.getElementById("countryModal");
const closeBtn = document.getElementById("closeModal");
const nameEl = document.getElementById("cName");
const flagEl = document.getElementById("cFlag");
const capEl  = document.getElementById("cCapital");
const regEl  = document.getElementById("cRegion");
const popEl  = document.getElementById("cPopulation");
const funEl  = document.getElementById("cFun");

function openModal(){ modal.setAttribute("open",""); }
function closeModal(){ modal.removeAttribute("open"); }

if(closeBtn) closeBtn.addEventListener("click", closeModal);
if(modal) modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

function prettyNum(n){
  if(!n && n!==0) return "—";
  return new Intl.NumberFormat().format(n);
}

async function loadCountryInfo(countryName){
  nameEl.textContent = countryName;
  flagEl.src = "";
  capEl.textContent = "Loading…";
  regEl.textContent = "Loading…";
  popEl.textContent = "Loading…";
  funEl.textContent = "Loading…";

  try{
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
    const r = await fetch(url);
    if(!r.ok) throw new Error("not ok");
    const data = await r.json();
    const c = data[0];

    const flag = c.flags?.png || c.flags?.svg || "";
    const capital = (c.capital && c.capital[0]) ? c.capital[0] : "—";
    const region = [c.region, c.subregion].filter(Boolean).join(" • ") || "—";
    const population = prettyNum(c.population);

    flagEl.src = flag;
    capEl.textContent = capital;
    regEl.textContent = region;
    popEl.textContent = population;

    const facts = [];
    if(c.languages) facts.push(`Languages: ${Object.values(c.languages).slice(0,3).join(", ")}${Object.values(c.languages).length>3 ? "…" : ""}`);
    if(c.currencies){
      const cur = Object.values(c.currencies)[0];
      if(cur) facts.push(`Currency: ${cur.name}${cur.symbol ? ` (${cur.symbol})` : ""}`);
    }
    if(c.timezones && c.timezones.length) facts.push(`Time zones: ${c.timezones.slice(0,2).join(", ")}${c.timezones.length>2 ? "…" : ""}`);
    funEl.textContent = facts.length ? facts.join(" · ") : "—";

  }catch(e){
    capEl.textContent = "—";
    regEl.textContent = "—";
    popEl.textContent = "—";
    funEl.textContent = "Couldn’t load facts (API blocked/offline). The globe still works.";
  }
}

async function initGlobe(){
  const canvas = document.getElementById("globeCanvas");
  if(!canvas) return;

  const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");
  const { OrbitControls } = await import("https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js");
  const ThreeGlobe = (await import("https://unpkg.com/three-globe@2.33.1/dist/three-globe.module.js")).default;
  const topojson = await import("https://cdn.jsdelivr.net/npm/topojson-client@3/+esm");

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 0, 360);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 240;
  controls.maxDistance = 520;

  const amb = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(amb);

  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(120, 60, 150);
  scene.add(dir);

  const globe = new ThreeGlobe()
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-night.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .showAtmosphere(true)
    .atmosphereColor("#2DE2E6")
    .atmosphereAltitude(0.12);

  globe.globeMaterial().transparent = true;
  globe.globeMaterial().opacity = 0.75;

  scene.add(globe);

  const world = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json").then(r=>r.json());
  const countries = topojson.feature(world, world.objects.countries).features;

  globe
    .polygonsData(countries)
    .polygonCapColor(d => {
      const n = d.properties?.name || "";
      if(visited.has(n)) return "rgba(52,211,153,0.55)";
      return "rgba(255,255,255,0.06)";
    })
    .polygonSideColor(() => "rgba(255,255,255,0.02)")
    .polygonStrokeColor(d => {
      const n = d.properties?.name || "";
      if(visited.has(n)) return "rgba(45,226,230,0.75)";
      return "rgba(255,255,255,0.14)";
    })
    .polygonAltitude(d => {
      const n = d.properties?.name || "";
      return visited.has(n) ? 0.035 : 0.01;
    })
    .polygonsTransitionDuration(250);

  globe.onPolygonClick(async (poly, ev) => {
    const name = poly?.properties?.name || "Unknown";
    openModal();
    await loadCountryInfo(name);
  });

  function onResize(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  window.addEventListener("resize", onResize, {passive:true});

  (function animate(){
    controls.update();
    globe.rotation.y += 0.0008;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();
}

initGlobe();
