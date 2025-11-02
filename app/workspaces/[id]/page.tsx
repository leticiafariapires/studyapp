import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { RevisionTracker } from "@/components/revision-tracker";
import { ArrowLeft, Settings, BookOpen, Target, Dumbbell, Sparkles, TrendingUp, Clock, Award, Star, Plus, CalendarDays } from "lucide-react";

export default async function WorkspacePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.id)
    .single();

  if (workspaceError || !workspace) {
    redirect("/dashboard");
  }

  // Load dashboard data based on workspace type
  let dashboardData: any = {};

  if (workspace.type === 'concurso') {
    // Load study sessions stats
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', params.id)
      .eq('session_type', 'study');
    
    console.log('🔍 Workspace ID:', params.id);
    console.log('📊 Sessions found:', sessions?.length || 0);
    if (sessionsError) console.error('❌ Sessions error:', sessionsError);

    const totalMinutes = sessions?.reduce((sum, s) => sum + (s.metadata?.duration_minutes || 0), 0) || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.metadata?.questions_total || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + (s.metadata?.questions_correct || 0), 0) || 0;

    // Last 7 days activity
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentSessions = sessions?.filter(s => new Date(s.start_at) >= last7Days) || [];

    dashboardData = {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalQuestions,
      accuracy: totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0,
      sessionsCount: sessions?.length || 0,
      recentSessions: recentSessions.length,
      streak: sessions && sessions.length > 0 ? Math.min(sessions.length, 7) : 0,
    };
  } else if (workspace.type === 'faculdade') {
    // Load readings stats
    const { data: readings } = await supabase
      .from('readings')
      .select('*')
      .eq('workspace_id', params.id);

    // Load upcoming assessments
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const { data: upcomingAssessments } = await supabase
      .from('faculty_assessments')
      .select(`
        *,
        subject:subjects(name, color)
      `)
      .gte('due_date', today.toISOString())
      .lte('due_date', nextWeek.toISOString())
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(5);

    // Load subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('workspace_id', params.id)
      .order('name');

    // Load study sessions
    const { data: studySessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', params.id)
      .eq('session_type', 'study');

    // Process subjects with stats
    const subjectsWithStats = subjects?.map(subject => {
      const subjectSessions = studySessions?.filter(s => 
        s.metadata?.subject_name === subject.name
      ) || [];
      
      const totalTime = subjectSessions.reduce((sum, s) => 
        sum + (s.metadata?.duration_minutes || 0), 0
      );
      
      const totalQuestions = subjectSessions.reduce((sum, s) => 
        sum + (s.metadata?.questions_total || 0), 0
      );
      
      const correctAnswers = subjectSessions.reduce((sum, s) => 
        sum + (s.metadata?.questions_correct || 0), 0
      );
      
      const accuracy = totalQuestions > 0 
        ? Math.round((correctAnswers / totalQuestions) * 100) 
        : 0;
      
      return {
        ...subject,
        totalSessions: subjectSessions.length,
        totalTime,
        totalQuestions,
        accuracy,
        lastStudied: subjectSessions.length > 0 
          ? new Date(Math.max(...subjectSessions.map(s => new Date(s.start_at).getTime())))
          : null
      };
    }) || [];

    // Get top rated books
    const topRated = readings
      ?.filter(r => r.stars && r.stars > 0)
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 3) || [];

    const avgRating = readings?.filter(r => r.stars).reduce((sum, r) => sum + (r.stars || 0), 0) / (readings?.filter(r => r.stars).length || 1) || 0;
    const tbr = readings?.filter(r => (r as any).status === 'quero_ler').slice(0, 12) || [];

    // Get recent subjects (last 5 studied)
    const recentSubjects = [...subjectsWithStats]
      .sort((a, b) => {
        if (!a.lastStudied) return 1;
        if (!b.lastStudied) return -1;
        return b.lastStudied.getTime() - a.lastStudied.getTime();
      })
      .slice(0, 5);

    dashboardData = {
      // Reading stats
      totalBooks: readings?.length || 0,
      totalReadings: readings?.length || 0,
      withReview: readings?.filter(r => r.review).length || 0,
      avgRating: avgRating.toFixed(1),
      topRated,
      tbr,
      readThisMonth: readings?.filter(r => {
        const created = new Date(r.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0,
      
      // Subject stats
      totalSubjects: subjects?.length || 0,
      totalStudyTime: studySessions?.reduce((sum, s) => sum + (s.metadata?.duration_minutes || 0), 0) || 0,
      subjectsWithStats,
      recentSubjects,
      
      // Session stats
      totalSessions: studySessions?.length || 0,
      sessionsThisMonth: studySessions?.filter(s => {
        const date = new Date(s.start_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length || 0,

      // Upcoming assessments
      upcomingAssessments: upcomingAssessments || [],
    };
  } else if (workspace.type === 'taf') {
    // Load training stats
    const { data: trainings } = await supabase
      .from('taf_trainings')
      .select('*')
      .eq('workspace_id', params.id)
      .order('training_date', { ascending: false });

    const thisMonth = trainings?.filter(t => {
      const date = new Date(t.training_date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }) || [];

    const totalDistance = trainings?.reduce((sum, t) => sum + (t.distance_m || 0), 0) || 0;
    const totalTime = trainings?.reduce((sum, t) => sum + (t.time_s || 0), 0) || 0;

    const bestRun = trainings?.filter(t => t.distance_m > 0 && t.time_s > 0)
      .sort((a, b) => {
        const paceA = a.time_s / (a.distance_m / 1000);
        const paceB = b.time_s / (b.distance_m / 1000);
        return paceA - paceB;
      })[0];

    dashboardData = {
      totalTrainings: trainings?.length || 0,
      thisMonth: thisMonth.length,
      totalDistance: (totalDistance / 1000).toFixed(1),
      totalHours: (totalTime / 3600).toFixed(1),
      bestPace: bestRun ? ((bestRun.time_s / (bestRun.distance_m / 1000)) / 60).toFixed(2) : null,
    };
  } else if (workspace.type === 'planner') {
    // Load planner stats
    const { data: tasks } = await supabase
      .from('planner_tasks')
      .select('*')
      .eq('workspace_id', params.id);

    const { data: events } = await supabase
      .from('planner_events')
      .select('*')
      .eq('workspace_id', params.id);

    const { data: notes } = await supabase
      .from('planner_notes')
      .select('*')
      .eq('workspace_id', params.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = tasks?.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate >= today && taskDate < tomorrow;
    }) || [];

    const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
    const overdueTasks = tasks?.filter(task => 
      task.due_date && new Date(task.due_date) < today && task.status !== 'completed'
    ) || [];

    dashboardData = {
      totalTasks: tasks?.length || 0,
      todayTasks: todayTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      totalEvents: events?.length || 0,
      totalNotes: notes?.length || 0,
    };
  }

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'concurso':
        return Target;
      case 'faculdade':
        return BookOpen;
      case 'taf':
        return Dumbbell;
      case 'planner':
        return CalendarDays;
      default:
        return Sparkles;
    }
  };

  const getWorkspaceColor = (type: string) => {
    switch (type) {
      case 'concurso':
        return 'text-blue-600 dark:text-blue-400';
      case 'faculdade':
        return 'text-purple-600 dark:text-purple-400';
      case 'taf':
        return 'text-green-600 dark:text-green-400';
      case 'planner':
        return 'text-cyan-600 dark:text-cyan-400';
      default:
        return 'text-orange-600 dark:text-orange-400';
    }
  };

  const Icon = getWorkspaceIcon(workspace.type);

  // Função para formatar datas
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'hoje';
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <WorkspaceSwitcher />
          </div>
          <Link href={`/workspaces/${params.id}/settings`}>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg bg-primary/10 ${getWorkspaceColor(workspace.type)}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{workspace.name}</h1>
              <p className="text-muted-foreground capitalize">{workspace.type}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        {workspace.type === 'concurso' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalHours}h</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.sessionsCount} sessões registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Questões</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalQuestions}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.accuracy}% de acerto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Últimos 7 Dias</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.recentSessions}</div>
                <p className="text-xs text-muted-foreground">
                  sessões recentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sequência</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.streak}</div>
                <p className="text-xs text-muted-foreground">
                  dias de estudos
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Avisos de Avaliações Próximas - Faculdade */}
        {workspace.type === 'faculdade' && dashboardData.upcomingAssessments && dashboardData.upcomingAssessments.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <CalendarDays className="w-5 h-5" />
                ⚠️ Avaliações Próximas
              </CardTitle>
              <CardDescription>Próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.upcomingAssessments.map((assessment: any) => (
                  <Link
                    key={assessment.id}
                    href={`/workspaces/${params.id}/faculty-subjects/${assessment.subject_id}/assessments`}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-white dark:border-amber-800 dark:bg-amber-950/30 hover:shadow-md transition-shadow cursor-pointer">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: assessment.subject?.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {assessment.type === 'exam' && '📝'}
                          {assessment.type === 'assignment' && '📄'}
                          {assessment.type === 'project' && '🎯'}
                          {assessment.type === 'quiz' && '❓'}
                          {assessment.type === 'presentation' && '🎤'}
                          {assessment.type === 'other' && '📋'}
                          {' '}{assessment.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.subject?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-amber-700 dark:text-amber-400">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(assessment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link href={`/workspaces/${params.id}/faculty-calendar`}>
                  <Button className="w-full" variant="outline">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Ver Calendário Completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção de Livros para Faculdade */}
        {workspace.type === 'faculdade' && dashboardData.topRated && dashboardData.topRated.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Livros Mais Bem Avaliados
              </CardTitle>
              <CardDescription>Suas melhores leituras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.topRated.map((book: any, index: number) => (
                  <div key={book.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                          {book.author && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= book.stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {book.review && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {book.review}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matérias Recentes e Próximas Atividades - APENAS para concurso */}
        {workspace.type === 'concurso' && dashboardData.subjectsWithStats && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Matérias Recentes</CardTitle>
                  <CardDescription>Suas matérias mais estudadas recentemente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.subjectsWithStats && dashboardData.subjectsWithStats.length > 0 ? (
                      dashboardData.subjectsWithStats.slice(0, 5).map((subject: any) => (
                        <div 
                          key={subject.id} 
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="h-10 w-1 rounded-full" 
                              style={{ backgroundColor: subject.color || '#3b82f6' }}
                            />
                            <div>
                              <h4 className="font-medium">{subject.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {subject.totalSessions} sessões • {subject.totalTime} min
                                {subject.accuracy > 0 ? ` • ${subject.accuracy}% acerto` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subject.lastStudied ? (
                              <span>Estudado {formatDate(subject.lastStudied)}</span>
                            ) : (
                              <span className="text-amber-500">Nunca estudado</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma matéria estudada ainda.</p>
                        <Link 
                          href={`/workspaces/${params.id}/subjects`}
                          className="text-primary hover:underline mt-2 inline-block"
                        >
                          Adicionar matérias
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-right">
                    <Link 
                      href={`/workspaces/${params.id}/subjects`}
                      className="text-sm text-primary hover:underline"
                    >
                      Ver todas as matérias →
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Próximas Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Próximas Atividades</CardTitle>
                  <CardDescription>Suas próximas tarefas e prazos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.subjectsWithStats && dashboardData.subjectsWithStats
                      .filter((s: any) => s.totalSessions === 0)
                      .slice(0, 3)
                      .map((subject: any) => (
                        <div 
                          key={subject.id} 
                          className="p-3 rounded-lg border border-amber-100 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="h-10 w-1 rounded-full" 
                              style={{ backgroundColor: subject.color || '#3b82f6' }}
                            />
                            <div>
                              <h4 className="font-medium">{subject.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Ainda não estudada
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Link 
                              href={`/workspaces/${params.id}/study-sessions?subject=${encodeURIComponent(subject.name)}`}
                              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              Iniciar sessão de estudo
                            </Link>
                          </div>
                        </div>
                      ))}
                    
                    <div className="text-center py-4">
                      <Link 
                        href={`/workspaces/${params.id}/study-sessions`}
                        className="inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nova sessão de estudo
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {workspace.type === 'faculdade' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matérias</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalSubjects}</div>
                <p className="text-xs text-muted-foreground">
                  disciplinas cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leituras</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalReadings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  livros e artigos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalAssessments || 0}</div>
                <p className="text-xs text-muted-foreground">
                  provas e trabalhos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anotações</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalNotes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  notas de estudo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {workspace.type === 'planner' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  tarefas cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.todayTasks}</div>
                <p className="text-xs text-muted-foreground">
                  tarefas para hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.completed}</div>
                <p className="text-xs text-muted-foreground">
                  de {dashboardData.totalTasks} tarefas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardData.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  tarefas pendentes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {workspace.type === 'taf' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalTrainings}</div>
                <p className="text-xs text-muted-foreground">
                  treinos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.thisMonth}</div>
                <p className="text-xs text-muted-foreground">
                  treinos realizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalDistance}km</div>
                <p className="text-xs text-muted-foreground">
                  em {dashboardData.totalHours}h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Melhor Pace</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.bestPace ? `${dashboardData.bestPace}` : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  min/km
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspace.type === 'concurso' && (
            <>
              <Link href={`/workspaces/${workspace.id}/study-sessions`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Sessões de Estudo</CardTitle>
                    <CardDescription>
                      {dashboardData.totalSessions || 0} sessões registradas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tempo estudado, questões resolvidas, acertos e erros
                    </p>
                    <Button className="w-full">
                      {dashboardData.totalSessions > 0 ? 'Ver Sessões' : 'Registrar Primeira Sessão'}
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/subjects`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Matérias</CardTitle>
                    <CardDescription>Organize seus estudos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gerencie matérias do edital
                    </p>
                    <Button className="w-full">
                      Abrir Matérias
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/reports`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Relatórios</CardTitle>
                    <CardDescription>Análises e estatísticas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Desempenho por matéria, evolução e insights
                    </p>
                    <Button className="w-full">
                      Ver Relatórios
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {workspace.type === 'faculdade' && (
            <>
              <Link href={`/workspaces/${workspace.id}/faculty-subjects`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>📚 Matérias</CardTitle>
                    <CardDescription>Disciplinas e conteúdos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gerencie suas matérias, tópicos, leituras, anotações e avaliações
                    </p>
                    <Button className="w-full">
                      Ver Matérias
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/readings`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>📚 Leituras</CardTitle>
                    <CardDescription>Livros e materiais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione e avalie livros da sua biblioteca
                    </p>
                    <Button className="w-full">
                      Ver Leituras
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/faculty-calendar`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>📅 Calendário Acadêmico</CardTitle>
                    <CardDescription>Provas e trabalhos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Visualize todas as avaliações em um calendário
                    </p>
                    <Button className="w-full">
                      Ver Calendário
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {workspace.type === 'taf' && (
            <>
              <Link href={`/workspaces/${workspace.id}/trainings`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Treinos</CardTitle>
                    <CardDescription>Registre seus treinos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Corrida, força, circuito e mais
                    </p>
                    <Button className="w-full">
                      Abrir Treinos
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/reports`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Evolução</CardTitle>
                    <CardDescription>Acompanhe seu progresso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gráficos de desempenho e evolução
                    </p>
                    <Button className="w-full">
                      Ver Evolução
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}

          {workspace.type === 'planner' && (
            <>
              <Link href={`/workspaces/${workspace.id}/planner/tasks`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Tarefas</CardTitle>
                    <CardDescription>Gerencie suas tarefas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Organize atividades com prioridades e prazos
                    </p>
                    <Button className="w-full">
                      Ver Tarefas
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/planner/calendar`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Calendário</CardTitle>
                    <CardDescription>Eventos e compromissos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Visualize e gerencie seus eventos
                    </p>
                    <Button className="w-full">
                      Ver Calendário
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/workspaces/${workspace.id}/planner/notes`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>Notas</CardTitle>
                    <CardDescription>Anotações rápidas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Notas coloridas estilo post-it
                    </p>
                    <Button className="w-full">
                      Ver Notas
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Revisões Programadas - Apenas para Concurso */}
        {workspace.type === 'concurso' && (
          <div className="mt-8">
            <RevisionTracker workspaceId={workspace.id} />
          </div>
        )}

      </div>
    </div>
  );
}
