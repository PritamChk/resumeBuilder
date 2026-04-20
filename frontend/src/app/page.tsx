import ResumeBuilder from "@/components/ResumeBuilder";

export default function Home() {
  return (
    <main className="container mx-auto p-4 min-h-screen flex flex-col">
      <header className="py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-primary">
          Agentic Resume
        </h1>
      </header>
      <ResumeBuilder />
    </main>
  );
}
