import React from "react";
import QuestionForm from "@/components/QuestionForm";
import ProtectedRoute from "@/components/ProtectedRoute";

export const metadata = {
  title: "Ask a question",
};

export default function AskPage() {
  return (
    <ProtectedRoute>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-4">Ask a public question</h1>

        <section className="space-y-6">
          <QuestionForm />
        </section>
      </main>
    </ProtectedRoute>
  );
}

