import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/upload";
import { slugify } from "@/lib/utils";

// GET — List all projects (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") where.category = category;
  if (featured === "true") where.featured = true;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(projects);
}

// POST — Create a new project (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, videoUrl, thumbnailUrl, aspectRatio, featured, caseStudy, beforeUrl, afterUrl } = body;

    if (!title || !category || !videoUrl) {
      return NextResponse.json(
        { error: "Title, category, and video are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Get max sortOrder
    const maxOrder = await prisma.project.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder ?? 0) + 1;

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description: description || null,
        category,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        aspectRatio: aspectRatio || "16:9",
        featured: featured || false,
        sortOrder,
        caseStudy: caseStudy || null,
        beforeUrl: beforeUrl || null,
        afterUrl: afterUrl || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

// PATCH — Update a project (admin only)
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// DELETE — Delete a project (admin only)
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Clean up uploaded files
    if (project.videoUrl) await deleteFile(project.videoUrl);
    if (project.thumbnailUrl) await deleteFile(project.thumbnailUrl);
    if (project.beforeUrl) await deleteFile(project.beforeUrl);
    if (project.afterUrl) await deleteFile(project.afterUrl);

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
