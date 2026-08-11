import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)]">Edit Project</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{project.title}</p>
      </div>
      <ProjectForm project={JSON.parse(JSON.stringify(project))} />
    </div>
  );
}
