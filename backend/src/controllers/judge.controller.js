import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";

// Load API keys from env
const API_KEYS = [process.env.JUDGE0_API_1, process.env.JUDGE0_API_2];

let useFirstKey = true; // Toggle between keys

export const runCode = async (req, res) => {
  const { language_id, source_code, stdin } = req.body;

  // Rotate keys
  const apiKey = useFirstKey ? API_KEYS[0] : API_KEYS[1];
  useFirstKey = !useFirstKey;

  const JUDGE0_HEADERS = {
    "Content-Type": "application/json",
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "X-RapidAPI-Key": apiKey,
  };

  try {
    // Step 1: Submit code
    const submission = await axios.post(
      `${JUDGE0_BASE_URL}/submissions`,
      { language_id, source_code, stdin },
      { headers: JUDGE0_HEADERS }
    );

    const token = submission.data.token;

    // Step 2: Poll for result
    let result;
    let tries = 0;

    while (tries < 10) {
      const check = await axios.get(`${JUDGE0_BASE_URL}/submissions/${token}`, {
        headers: JUDGE0_HEADERS,
      });

      result = check.data;

      if (result.status.id <= 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
