"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ResponseViewerProps {
  assignmentId: string;
  onBack?: () => void;
}

const formatDate = (date: string | Date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ResponseViewer({
  assignmentId,
  onBack,
}: ResponseViewerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResponses();
  }, [assignmentId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/questionnaires/responses?assignmentId=${assignmentId}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch responses" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      if (!result.data) {
        throw new Error("Invalid response format from server");
      }
      setData(result.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching responses:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderResponse = (question: any) => {
    if (!question.response) {
      return <span className="text-gray-400 italic">No response provided</span>;
    }

    const response = question.response;

    switch (question.questionType) {
      case "TEXT":
      case "TEXTAREA":
        return <p className="whitespace-pre-wrap">{response.responseText}</p>;

      case "NUMBER":
        return <p>{response.responseNumber}</p>;

      case "RATING":
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {response.responseNumber}
            </span>
            <span className="text-gray-500">/ 5</span>
          </div>
        );

      case "YESNO":
        return (
          <Badge
            variant={response.responseText === "Yes" ? "default" : "secondary"}
          >
            {response.responseText}
          </Badge>
        );

      case "DATE":
        return (
          <p>
            {response.responseText
              ? new Date(response.responseText).toLocaleDateString()
              : "N/A"}
          </p>
        );

      case "MULTIPLE_CHOICE":
      case "CHECKBOX":
        try {
          const values = response.responseJson
            ? JSON.parse(response.responseJson)
            : [];
          return (
            <div className="space-y-2">
              {values.map((val: string, idx: number) => (
                <Badge key={idx} variant="outline">
                  {val}
                </Badge>
              ))}
            </div>
          );
        } catch {
          return <p>{response.responseText}</p>;
        }

      default:
        return <p>{response.responseText}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { assignment, template, responses } = data;
  const patientName =
    `${assignment.patient?.firstName || ""} ${assignment.patient?.lastName || ""}`.trim();

  return (
    <div className="space-y-6">
      {onBack && (
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{template.title}</CardTitle>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Patient: <span className="font-semibold">{patientName}</span>
              </p>
            </div>
            <Badge
              variant={
                assignment.status === "COMPLETED" ? "default" : "secondary"
              }
              className="text-base"
            >
              {assignment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Assigned Date</p>
            <p className="font-semibold">{formatDate(assignment.assignedAt)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="font-semibold">
              {assignment.dueDate
                ? formatDate(assignment.dueDate)
                : "No due date"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed Date</p>
            <p className="font-semibold">
              {assignment.completedAt
                ? formatDate(assignment.completedAt)
                : "Not completed"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Questions</p>
            <p className="font-semibold">{template.questions?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Responses */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardContent className="pt-6">
              <p className="text-yellow-700 dark:text-yellow-400">
                No responses submitted yet
              </p>
            </CardContent>
          </Card>
        ) : (
          responses.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Question {question.questionNumber}
                    </p>
                    <p className="mt-1 text-base font-medium">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="rounded-md bg-gray-50 p-4 dark:bg-slate-900/50">
                    {renderResponse(question)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
