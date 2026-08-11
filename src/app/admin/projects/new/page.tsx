import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">New Project</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Upload and create a new portfolio piece</p>
      </div>
      <ProjectForm />
    </div>
  );
}
