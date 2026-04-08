"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, Eye } from "lucide-react";

interface Response {
  id: string;
  responseText?: string;
  responseNumber?: number;
  responseJson?: any;
  question: {
    id: string;
    questionNumber: number;
    questionText: string;
    questionType: string;
  };
}

interface Assignment {
  template?: {
    title: string;
    description?: string;
    specialty: string;
    questions: any[];
  };
  patient?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  status: string;
  completedAt?: string;
  score?: number;
  scoreOutOf?: number;
  responses: any[];
}

interface DoctorQuestionnaireResponsesProps {
  templateId?: string;
  patientId?: string;
  assignmentId?: string;
}

export default function DoctorQuestionnaireResponses({
  templateId,
  patientId,
  assignmentId,
}: DoctorQuestionnaireResponsesProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  useEffect(() => {
    fetchResponses();
  }, [templateId, patientId, assignmentId]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      let url = "/api/questionnaires/responses?";

      if (assignmentId) {
        url += `assignmentId=${assignmentId}`;
      } else if (patientId && templateId) {
        url += `patientId=${patientId}&templateId=${templateId}`;
      } else {
        setError(
          "Please provide either assignmentId or both patientId and templateId"
        );
        return;
      }

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch responses");

      const data = await response.json();
      setAssignments(data.data);

      if (data.data.length > 0) {
        setSelectedAssignment(data.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (assignment: Assignment) => {
    // Simple text-based export for now
    const content = generateTextReport(assignment);
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute(
      "download",
      `questionnaire-${assignment.patient?.user.firstName}-${Date.now()}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateTextReport = (assignment: Assignment): string => {
    let report = "";
    report += `QUESTIONNAIRE RESPONSE REPORT\n`;
    report += `=============================\n\n`;
    report += `Document: ${assignment.template?.title}\n`;
    report += `Patient: ${assignment.patient?.user.firstName} ${assignment.patient?.user.lastName}\n`;
    report += `Email: ${assignment.patient?.user.email}\n`;
    report += `Status: ${assignment.status}\n`;
    report += `Completed: ${assignment.completedAt ? new Date(assignment.completedAt).toLocaleString() : "Not completed"}\n\n`;

    report += `RESPONSES\n`;
    report += `=========\n\n`;

    assignment.responses.forEach((response: Response, idx: number) => {
      report += `Q${response.question.questionNumber}: ${response.question.questionText}\n`;
      report += `Type: ${response.question.questionType}\n`;
      report += `Answer: ${response.responseText || response.responseNumber || JSON.stringify(response.responseJson || "N/A")}\n\n`;
    });

    return report;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || assignments.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-700">{error || "No responses found"}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Responses List */}
      {assignments.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-colors ${
                selectedAssignment === assignment
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardContent className="pt-6">
                <p className="font-medium">
                  {assignment.patient?.user.firstName}{" "}
                  {assignment.patient?.user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {assignment.patient?.user.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={
                      assignment.status === "COMPLETED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {assignment.status}
                  </Badge>
                  {assignment.completedAt && (
                    <Badge variant="outline">
                      {new Date(assignment.completedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Response Detail */}
      {selectedAssignment && (
        <div className="space-y-4">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedAssignment.template?.title}</CardTitle>
                  {selectedAssignment.template?.description && (
                    <CardDescription className="mt-2">
                      {selectedAssignment.template.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(selectedAssignment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Patient and Status Info */}
              <div className="flex flex-col gap-2 mt-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Patient:
                  </span>
                  <p className="text-sm">
                    {selectedAssignment.patient?.user.firstName}{" "}
                    {selectedAssignment.patient?.user.lastName}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <Badge className="ml-2" variant="outline">
                      {selectedAssignment.status}
                    </Badge>
                  </div>
                  {selectedAssignment.completedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Completed:
                      </span>
                      <p className="text-sm">
                        {new Date(
                          selectedAssignment.completedAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Responses */}
          <div className="space-y-3">
            <h3 className="font-semibold">Patient Responses</h3>
            {selectedAssignment.responses.length > 0 ? (
              selectedAssignment.responses.map(
                (response: Response, idx: number) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="font-medium">
                          Q{response.question.questionNumber}:{" "}
                          {response.question.questionText}
                        </p>
                        <Badge variant="outline">
                          {response.question.questionType}
                        </Badge>
                        <div className="bg-gray-50 p-3 rounded">
                          {response.responseText && (
                            <p className="text-sm">{response.responseText}</p>
                          )}
                          {response.responseNumber !== undefined && (
                            <p className="text-sm">{response.responseNumber}</p>
                          )}
                          {response.responseJson && (
                            <p className="text-sm text-gray-600">
                              {JSON.stringify(response.responseJson)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <p className="text-yellow-700">No responses submitted yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
