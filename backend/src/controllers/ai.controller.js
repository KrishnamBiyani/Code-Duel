import axios from "axios";

export const chatWithAI = async (req, res) => {
  const { message, questionTitle, questionDescription } = req.body;
  const normalizedMessage = message?.trim();
  const normalizedQuestionTitle = questionTitle?.trim() || "General";
  const normalizedQuestionDescription =
    questionDescription?.trim() || "DSA prep";

  if (!normalizedMessage) {
    return res.status(400).json({ message: "Message is required" });
  }

  if (!process.env.RAG_SERVICE_URL) {
    return res.status(500).json({ message: "RAG service URL is not configured" });
  }

  const context =
    `Question Title: ${normalizedQuestionTitle}\n` +
    `Question Description: ${normalizedQuestionDescription}`;

  try {
    const response = await axios.post(`${process.env.RAG_SERVICE_URL}/chat`, {
      message: normalizedMessage,
      context,
      questionTitle: normalizedQuestionTitle,
      questionDescription: normalizedQuestionDescription,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("RAG service error:", error?.response?.data || error.message);

    return res.status(error?.response?.status || 500).json({
      message: "Failed to get AI response",
      error: error?.response?.data || error.message,
    });
  }
};
