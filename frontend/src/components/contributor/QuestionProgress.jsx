export default function QuestionProgress({ currentIndex, totalQuestions }) {
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="flex w-full max-w-[886px] flex-col gap-3" aria-label="Question progress">
      <div className="flex items-center justify-between gap-4 text-body-2 text-r-secondary">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-r-card">
        <div
          className="h-full rounded-full bg-r-text transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
