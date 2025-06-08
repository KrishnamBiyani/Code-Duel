import axios from "axios";

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
  "X-RapidAPI-Key": "4a31d39e9amsh151c6a135bccf01p1d1ef9jsn65c004c85f33", // get this from https://rapidapi.com/judge0-official/api/judge0-ce
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
