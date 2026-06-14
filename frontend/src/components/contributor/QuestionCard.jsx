import AiOrb from "@/components/contributor/shell/AiOrb.jsx";
import AutosaveStatus from "@/components/contributor/AutosaveStatus.jsx";

function MicButton({ isListening, speechSupported, onToggleListening }) {
  return (
    <button
      type="button"
      onClick={onToggleListening}
      disabled={!speechSupported}
      aria-label={isListening ? "Stop speaking" : "Speak your answer"}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-r-border-focus disabled:cursor-not-allowed disabled:opacity-50 ${
        isListening
          ? "border-r-text bg-r-text text-r-btn-text"
          : "border-r-muted bg-white text-r-text hover:border-r-border-focus"
      }`}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    </button>
  );
}

export default function QuestionCard({
  answerText,
  autosaveStatus,
  isListening,
  speechSupported,
  onAnswerChange,
  onAnswerBlur,
  onToggleListening,
  question,
}) {
  return (
    <section className="flex w-full max-w-[886px] flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center">
      <AiOrb className="mx-auto lg:mx-0" />

      <div className="flex w-full max-w-[434px] flex-col gap-5">
        <div className="flex items-start gap-3">
          <MicButton
            isListening={isListening}
            speechSupported={speechSupported}
            onToggleListening={onToggleListening}
          />
          <div className="min-w-0 flex-1">
            <label htmlFor={`question-answer-${question.id}`} className="sr-only">
              Your answer
            </label>
            <textarea
              id={`question-answer-${question.id}`}
              value={answerText}
              onChange={(event) => onAnswerChange(event.target.value)}
              onBlur={onAnswerBlur}
              placeholder="Share it in your own words. A few lines is enough."
              rows={10}
              className="min-h-[280px] w-full resize-y rounded-[13px] border border-r-muted bg-white px-5 py-4 text-body text-r-text outline-none transition placeholder:text-r-secondary focus:border-r-border-focus focus:ring-2 focus:ring-r-card"
            />
          </div>
        </div>

        {!speechSupported ? (
          <p className="rounded-[13px] bg-r-card px-4 py-3 text-body-2 text-r-secondary">
            Speech input is not supported in this browser. You can still type your answer.
          </p>
        ) : isListening ? (
          <p className="text-body-2 text-r-secondary">Listening… speak naturally and your words will appear above.</p>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <AutosaveStatus status={autosaveStatus} />
          <p className="shrink-0 text-body-2 text-r-muted">
            {answerText.length.toLocaleString()} characters
          </p>
        </div>
      </div>
    </section>
  );
}
