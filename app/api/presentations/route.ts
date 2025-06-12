import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const presentationsDir = path.join(process.cwd(), "public", "presentation");

    // Check if directory exists
    if (!fs.existsSync(presentationsDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(presentationsDir);

    const presentations = files
      .filter((file) => file.toLowerCase().endsWith(".pdf"))
      .map((file) => {
        const filePath = path.join(presentationsDir, file);
        const stats = fs.statSync(filePath);

        return {
          name: file,
          path: `/presentation/${file}`,
          size: stats.size,
          lastModified: stats.mtime,
        };
      });

    return NextResponse.json(presentations);
  } catch (error) {
    console.error("Error reading presentations:", error);
    return NextResponse.json(
      { error: "Failed to read presentations" },
      { status: 500 }
    );
  }
}
