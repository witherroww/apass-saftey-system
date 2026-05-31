// Live aviation weather from 

const METAR_URL = "/api/metar";

export async function fetchNearbyMETARs() {
  const ids = "KBDR,KHVN,KJFK,KLGA,KEWR";
  const url = `${METAR_URL}?ids=${ids}&format=json&hours=6`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("METAR fetch failed");

  const data = await res.json();

  return (data || []).map(m => ({
    icao: m.icaoId,
    lat: m.lat,
    lon: m.lon,
    temp: m.temp,
    dewpoint: m.dewp,
    windDir: m.wdir,
    windSpeed: m.wspd,
    windGust: m.wgst,
    visibility: m.visib,
    altimeter: m.altim,
    ceiling: m.ceil,
    rawText: m.rawOb,
    flightCategory: m.fltCat || "VFR",
    reportTime: m.reportTime,
  }));
}