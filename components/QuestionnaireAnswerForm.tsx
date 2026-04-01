"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Loader2, AlertCircle } from "lucide-react";
import { submitQuestionnaireResponses } from "@/lib/actions/questionnaire.actions";

interface QuestionnaireFormProps {
  assignment: any;
  onComplete?: () => void;
}

export default function QuestionnaireAnswerForm({
  assignment,
  onComplete,
}: QuestionnaireFormProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set([assignment.questionnaire.questions[0]?.id])
  );
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required questions
      const requiredQuestions = assignment.questionnaire.questions.filter(
        (q: any) => q.required
      );
      const missingRequired = requiredQuestions.filter(
        (q: any) => !responses[q.id]?.trim()
      );

      if (missingRequired.length > 0) {
        setError(
          `Please answer all required questions (${missingRequired.length} remaining)`
        );
        setLoading(false);
        return;
      }

      // Format responses
      const formattedResponses = Object.entries(responses).map(
        ([questionId, answer]) => ({
          questionId,
          answer: answer,
        })
      );

      const result = await submitQuestionnaireResponses(
        assignment.id,
        formattedResponses
      );

      if (result.success) {
        onComplete?.();
      } else {
        setError(result.error || "Failed to submit questionnaire");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {assignment.questionnaire.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {assignment.questionnaire.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">
              {assignment.questionnaire.questions.length}
            </span>{" "}
            questions
          </div>
          <div className="flex items-center gap-2">
            {new Date(assignment.dueDate) < new Date() ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 border border-red-200">
                ⏰ Overdue
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                Due{" "}
                {new Date(assignment.dueDate).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {assignment.questionnaire.questions.map((question: any, index: number) => {
          const isExpanded = expandedQuestions.has(question.id);
          const answer = responses[question.id] || "";
          const isAnswered = answer.trim().length > 0;

          return (
            <div
              key={question.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              {/* Question Header */}
              <button
                type="button"
                onClick={() => toggleQuestion(question.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {question.title}
                        {question.required && (
                          <span className="text-red-600 ml-1">*</span>
                        )}
                      </h3>
                      {question.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {question.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {isAnswered && (
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Question Body */}
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-gray-200 bg-gray-50 space-y-3">
                  {question.type === "TEXT" && (
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      placeholder="Enter your answer..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required={question.required}
                    />
                  )}

                  {question.type === "TEXTAREA" && (
                    <textarea
                      value={answer}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      placeholder="Enter your answer..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required={question.required}
                    />
                  )}

                  {question.type === "RATING" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={question.minValue || 0}
                          max={question.maxValue || 10}
                          value={answer || question.minValue || 0}
                          onChange={(e) =>
                            handleResponseChange(question.id, e.target.value)
                          }
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          required={question.required}
                        />
                        <span className="min-w-[3rem] text-center font-semibold text-blue-600 bg-blue-50 rounded px-3 py-1">
                          {answer || question.minValue || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{question.minValue || 0}</span>
                        <span>{question.maxValue || 10}</span>
                      </div>
                    </div>
                  )}

                  {question.type === "DATE" && (
                    <input
                      type="date"
                      value={answer}
                      onChange={(e) =>
                        handleResponseChange(question.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required={question.required}
                    />
                  )}

                  {question.type === "YESNO" && (
                    <div className="flex gap-3">
                      {["Yes", "No"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleResponseChange(question.id, option)
                          }
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors border ${
                            answer === option
                              ? "border-blue-600 bg-blue-100 text-blue-700"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === "CHECKBOX" && (
                    <div className="space-y-2">
                      {question.options &&
                        JSON.parse(question.options).map((option: string) => {
                          const selectedOptions = answer
                            ? answer.split(",").map((v: string) => v.trim())
                            : [];
                          const isSelected = selectedOptions.includes(option);

                          return (
                            <label
                              key={option}
                              className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedOptions);
                                  if (e.target.checked) {
                                    newSelected.add(option);
                                  } else {
                                    newSelected.delete(option);
                                  }
                                  handleResponseChange(
                                    question.id,
                                    Array.from(newSelected).join(", ")
                                  );
                                }}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          );
                        })}
                    </div>
                  )}

                  {question.type === "MULTISELECT" && (
                    <select
                      multiple
                      value={
                        answer
                          ? answer.split(",").map((v: string) => v.trim())
                          : []
                      }
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(
                          (opt) => opt.value
                        );
                        handleResponseChange(question.id, selected.join(", "));
                      }}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required={question.required}
                    >
                      {question.options &&
                        JSON.parse(question.options).map((option: string) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Questionnaire
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
