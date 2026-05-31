export default async function handler(req, res) {
  const query = new URLSearchParams(req.query).toString();

  const url = `https://aviationweather.gov/api/data/metar?${query}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "METAR fetch failed",
      });
    }

    const text = await response.text();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({
      error: "METAR proxy failed",
      message: error.message,
    });
  }
}