import axios from "axios";

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": "da79599c85msh85e810a2ee8338bp121a6ajsncaae221e125c", // get this from https://rapidapi.com/judge0-official/api/judge0-ce
};

export const runCode = async (req, res) => {
  const { language_id, source_code, stdin } = req.body;

  try {
    // 1. Submit code
    const submission = await axios.post(
      `${JUDGE0_BASE_URL}/submissions`,
      {
        language_id,
        source_code,
        stdin,
      },
      {
        headers: JUDGE0_HEADERS,
      }
    );

    const token = submission.data.token;

    // 2. Poll for result
    let result;
    let tries = 0;

    while (tries < 10) {
      const check = await axios.get(`${JUDGE0_BASE_URL}/submissions/${token}`, {
        headers: JUDGE0_HEADERS,
      });

      result = check.data;
      if (result.status.id <= 2) {
        // 1 = in queue, 2 = processing
        await new Promise((res) => setTimeout(res, 1000));
        tries++;
      } else {
        break;
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Judge0 error:", err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
};
