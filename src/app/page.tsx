"use client";

import DragAndDrop from "@/components/DragAndDrop";
import { useRef, useState } from "react";

type AnalysisState = "upload" | "analyzing" | "results";

interface CVResult {
  file: File;
  fullName: string;
  score: number;
  explanation: string;
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("upload");
  const [cvResults, setCvResults] = useState<CVResult[]>([]);
  const jobFileInputRef = useRef<HTMLInputElement>(null);

  const handleJobDescriptionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJobDescription(file);
    }
  };

  const triggerJobFileUpload = () => {
    jobFileInputRef.current?.click();
  };

  const removeJobDescription = () => {
    setJobDescription(null);
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = "";
    }
  };

  const handleCvFilesSelected = (files: File[]) => {
    setCvFiles(files);
  };

  const startAnalysis = async () => {
    if (!jobDescription || cvFiles.length === 0) return;

    setAnalysisState("analyzing");

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      // Add CV files
      cvFiles.forEach((file, index) => {
        formData.append(`cvFiles[${index}]`, file);
      });

      // Send to test upload endpoint
      const response = await fetch("/api/test-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload test failed");
      }

      const analysisResult = (await response.json()) as {
        message: string;
        result: { fullName: string; score: number; explanation: string }[];
      };
      console.log("OpenAI analysis response:", analysisResult);

      // Convert to our CVResult format
      const results: CVResult[] = analysisResult.result
        .map((result, index) => ({
          file: cvFiles[index] || new File([], `CV_${index + 1}`),
          fullName: result.fullName || `Candidate ${index + 1}`,
          score: result.score || 0,
          explanation: result.explanation || "No explanation provided",
        }))
        .sort((a, b) => b.score - a.score); // Sort by score descending

      setCvResults(results);
      setAnalysisState("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      setAnalysisState("upload");
    }
  };

  const resetAnalysis = () => {
    setAnalysisState("upload");
    setCvResults([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (analysisState === "upload") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">CV Matcher</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Upload a job description and compare it with multiple CVs
            </p>
          </div>

          <div className="space-y-8">
            {/* Job Description Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Step 1: Upload Job Description
              </h2>

              <input
                ref={jobFileInputRef}
                type="file"
                onChange={handleJobDescriptionUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />

              {!jobDescription ? (
                <button
                  onClick={triggerJobFileUpload}
                  className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                      Upload Job Description
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to select PDF, DOC, DOCX, or TXT file
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">{jobDescription.name}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Job description uploaded successfully
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeJobDescription}
                    className="p-2 text-green-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                    title="Remove job description"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* CV Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Step 2: Upload CVs to Compare
              </h2>
              <DragAndDrop
                acceptedTypes={["application/pdf", ".doc", ".docx"]}
                maxFiles={20}
                maxSizeMB={10}
                onFilesSelected={handleCvFilesSelected}
              />
            </div>

            {/* Analyze Button */}
            {jobDescription && cvFiles.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={startAnalysis}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <span>Analyze CVs ({cvFiles.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Analysis and Results Layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 min-h-screen p-6 transform transition-all duration-500 ease-in-out flex flex-col">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Overview</h2>
              <button
                onClick={resetAnalysis}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                title="Back to upload"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Job Description Card */}
          {jobDescription && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Job Description</h3>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    {jobDescription.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">{formatFileSize(jobDescription.size)}</p>
                </div>
              </div>
            </div>
          )}

          {/* CV Files Summary */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              CVs to Analyze ({cvFiles.length})
            </h3>
            <div className="space-y-2">
              {cvFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {analysisState === "analyzing" ? (
              // Analysis Loading State
              <div className="flex flex-col items-center justify-center min-h-96">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Analyzing CVs...</h2>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                  We&apos;re comparing {cvFiles.length} CV{cvFiles.length > 1 ? "s" : ""} against your job description.
                  This may take a few moments.
                </p>
              </div>
            ) : (
              // Results Table
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analysis Results</h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {cvResults.length} CVs analyzed and ranked
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Match Score
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Analysis
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {cvResults.map((result, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                    index === 0
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                                      : index === 1
                                        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                        : index === 2
                                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
                                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                  }`}
                                >
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {result.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {result.file.name} • {formatFileSize(result.file.size)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      result.score >= 90
                                        ? "bg-green-500"
                                        : result.score >= 75
                                          ? "bg-yellow-500"
                                          : result.score >= 60
                                            ? "bg-orange-500"
                                            : "bg-red-500"
                                    }`}
                                    style={{ width: `${result.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {result.score}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-md">
                                <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
                                  {result.explanation}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
