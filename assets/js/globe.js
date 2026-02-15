(async function(){
  const wrap = document.getElementById("globeWrap");
  const modal = document.getElementById("countryModal");
  const mClose = document.getElementById("mClose");
  const mTitle = document.getElementById("mTitle");
  const mFlag = document.getElementById("mFlag");
  const mKV = document.getElementById("mKV");

  const visited = new Set([
    "Syria","Jordan","Lebanon","United Arab Emirates","Saudi Arabia",
    "Germany","Italy","France","Switzerland","Austria","Canada","United States"
  ]);

  function openModal(){ modal.classList.add("show"); }
  function closeModal(){ modal.classList.remove("show"); }
  mClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });
  window.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModal(); });

  // fetch world polygons (TopoJSON)
  const world = await fetch("https://unpkg.com/world-atlas@2/countries-110m.json").then(r=>r.json());
  const countries = topojson.feature(world, world.objects.countries).features;

  // helper: facts from Rest Countries (works for every country)
  async function getCountryInfo(name){
    // Some names differ between datasets; RestCountries search handles most.
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`;
    const data = await fetch(url).then(r=>r.json());
    // pick best match
    const c = Array.isArray(data) ? data[0] : data;

    const flagPng = c?.flags?.png || c?.flags?.svg || "";
    const capital = (c?.capital && c.capital[0]) ? c.capital[0] : "—";
    const region = c?.region || "—";
    const subregion = c?.subregion || "—";
    const population = c?.population ? c.population.toLocaleString() : "—";
    const area = c?.area ? `${c.area.toLocaleString()} km²` : "—";
    const languages = c?.languages ? Object.values(c.languages).join(", ") : "—";
    const currencies = c?.currencies ? Object.values(c.currencies).map(x=>x.name).join(", ") : "—";

    // fun facts (generated, but real-data based)
    const fun = [];
    if(c?.timezones?.length) fun.push(`Time zones: ${c.timezones.slice(0,3).join(", ")}${c.timezones.length>3?"…":""}`);
    if(c?.car?.side) fun.push(`They drive on the ${c.car.side} side.`);
    if(c?.continents?.length) fun.push(`Continent: ${c.continents.join(", ")}`);
    if(c?.idd?.root) fun.push(`Calling code starts with ${c.idd.root}${(c.idd.suffixes?.[0]||"")}`);
    if(c?.startOfWeek) fun.push(`Week starts on: ${c.startOfWeek}.`);

    return { flagPng, capital, region, subregion, population, area, languages, currencies, fun };
  }

  // color logic
  function countryColor(feature){
    const name = feature.properties?.name || feature.properties?.NAME || "";
    // Some world-atlas builds do not include name; globe.gl will still render shapes,
    // but we’ll use a fallback from a mapping later. For now default.
    return "rgba(255,255,255,.04)";
  }

  // Create globe
  const Globe = window.GlobeGL();
  const globe = Globe(wrap)
    .backgroundColor("rgba(0,0,0,0)")
    .showAtmosphere(true)
    .atmosphereColor("rgba(45,226,230,.30)")
    .atmosphereAltitude(0.22)
    .polygonsData(countries)
    .polygonAltitude(d => {
      const n = d.properties?.name || "";
      return visited.has(n) ? 0.10 : 0.055;
    })
    .polygonCapColor(d => {
      const n = d.properties?.name || "";
      if(visited.has(n)) return "rgba(45,226,230,.30)";
      return "rgba(255,255,255,.05)";
    })
    .polygonSideColor(() => "rgba(0,0,0,.18)")
    .polygonStrokeColor(d => {
      const n = d.properties?.name || "";
      if(visited.has(n)) return "rgba(33,230,166,.65)";
      return "rgba(255,255,255,.18)";
    })
    .polygonsTransitionDuration(260)
    .onPolygonClick(async (poly) => {
      const name = poly.properties?.name || "Country";

      // zoom to polygon centroid-ish
      const { lat, lng } = polygonCenter(poly);
      globe.pointOfView({ lat, lng, altitude: 1.75 }, 750);

      // show modal content
      mTitle.textContent = name;
      mFlag.innerHTML = `<div style="padding:14px;color:var(--muted)">Loading…</div>`;
      mKV.innerHTML = "";

      openModal();

      try{
        const info = await getCountryInfo(name);

        mFlag.innerHTML = info.flagPng
          ? `<img src="${info.flagPng}" alt="Flag of ${name}" style="width:100%;display:block;">`
          : `<div style="padding:14px;color:var(--muted)">Flag not available</div>`;

        const rows = [
          ["Capital", info.capital],
          ["Region", `${info.region}${info.subregion !== "—" ? " · " + info.subregion : ""}`],
          ["Population", info.population],
          ["Area", info.area],
          ["Languages", info.languages],
          ["Currencies", info.currencies],
          ["Fun facts", info.fun.length ? "• " + info.fun.join("<br>• ") : "—"]
        ];

        mKV.innerHTML = rows.map(([k,v]) => `
          <div class="row"><strong>${k}</strong><span>${v}</span></div>
        `).join("");

      }catch(err){
        mFlag.innerHTML = `<div style="padding:14px;color:var(--muted)">Couldn’t load country info.</div>`;
        mKV.innerHTML = `<div class="row"><strong>Tip</strong><span>If this happens, refresh. Some countries have name formatting differences.</span></div>`;
      }
    });

  // nice camera start
  globe.pointOfView({ lat: 25, lng: 15, altitude: 2.25 }, 0);

  // slow rotation
  const controls = globe.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;

  function polygonCenter(feature){
    // very simple centroid approximation
    const coords = feature.geometry.coordinates;
    let sumLat = 0, sumLng = 0, count = 0;

    const walk = (arr) => {
      for(const item of arr){
        if(typeof item[0] === "number"){
          sumLng += item[0];
          sumLat += item[1];
          count++;
        }else{
          walk(item);
        }
      }
    };
    walk(coords);

    const lat = count ? sumLat / count : 0;
    const lng = count ? sumLng / count : 0;
    return { lat, lng };
  }
})();
