function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect
}) {
  return (
    <div className="card">

      <h3>{question.questionText}</h3>

      <label>
        <input
          type="radio"
          checked={selectedAnswer === question.optionA}
          onChange={() =>
            onAnswerSelect(question.id, question.optionA)
          }
        />
        {question.optionA}
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={selectedAnswer === question.optionB}
          onChange={() =>
            onAnswerSelect(question.id, question.optionB)
          }
        />
        {question.optionB}
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={selectedAnswer === question.optionC}
          onChange={() =>
            onAnswerSelect(question.id, question.optionC)
          }
        />
        {question.optionC}
      </label>

      <br />

      <label>
        <input
          type="radio"
          checked={selectedAnswer === question.optionD}
          onChange={() =>
            onAnswerSelect(question.id, question.optionD)
          }
        />
        {question.optionD}
      </label>

    </div>
  );
}

export default QuestionCard;