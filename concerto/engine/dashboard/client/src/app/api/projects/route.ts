import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/projects
 * Returns a list of existing projects
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Connect to backend API or database
    // For now, return an empty array to prevent errors
    return NextResponse.json([], {
      status: 200,
      headers: {
        'X-Total-Count': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, language, framework, database, teamSize } = body;

    // Validate required fields
    if (!name || !language || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields: name, language, framework' },
        { status: 400 }
      );
    }

    // TODO: Connect to backend API to create project
    // For now, return a mock project object
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description,
      language,
      framework,
      database,
      teamSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
