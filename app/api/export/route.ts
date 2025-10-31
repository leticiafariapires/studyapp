import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workspaceId = searchParams.get('workspace_id');
  const format = searchParams.get('format') || 'json';

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspace_id parameter is required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Verify workspace access
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (workspaceError || !workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or access denied' },
      { status: 404 }
    );
  }

  try {
    // Fetch all data for the workspace
    const [subjects, questions, readings, tafTrainings] = await Promise.all([
      supabase.from('subjects').select('*').eq('workspace_id', workspaceId),
      supabase.from('questions').select('*').eq('workspace_id', workspaceId),
      supabase.from('readings').select('*').eq('workspace_id', workspaceId),
      supabase.from('taf_trainings').select('*').eq('workspace_id', workspaceId),
    ]);

    const exportData = {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
      },
      subjects: subjects.data || [],
      questions: questions.data || [],
      readings: readings.data || [],
      taf_trainings: tafTrainings.data || [],
      exported_at: new Date().toISOString(),
    };

    if (format === 'csv') {
      // Simple CSV export for questions (most common use case)
      const csvRows = [
        ['Subject', 'Topic', 'Statement', 'Answer Correct', 'Answer User', 'Difficulty', 'Source'],
        ...(questions.data || []).map((q: any) => [
          q.subject_id,
          q.topic_id,
          q.statement,
          q.answer_correct,
          q.answer_user,
          q.difficulty,
          q.source,
        ]),
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="workspace_${workspaceId}_export.csv"`,
        },
      });
    }

    // JSON export
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="workspace_${workspaceId}_export.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
