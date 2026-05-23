import Question from "../models/questions.model.js";

export const randomQuestion = async (req, res) => {
  try {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);

    if (!question) {
      return res.status(401).json({ message: "No questions found" });
    }

    res.status(200).json({
      question,
      startTime: Date.now(),
      duration: 10 * 60 * 1000,
    });
  } catch (error) {
    console.log("Error in question controller: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
