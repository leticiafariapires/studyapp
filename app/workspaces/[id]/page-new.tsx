import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { CircularProgress } from "@/components/circular-progress";
import { StatCard } from "@/components/stat-card";
import { StreakTracker } from "@/components/streak-tracker";
import { 
  BookOpen, 
  Target, 
  Clock, 
  Award, 
  TrendingUp, 
  Calendar, 
  FileText,
  Plus,
  Bell,
  User,
  CheckCircle2,
  Brain,
  Timer
} from "lucide-react";

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
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', params.id)
      .eq('session_type', 'study');

    const totalMinutes = sessions?.reduce((sum, s) => sum + (s.metadata?.duration_minutes || 0), 0) || 0;
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.metadata?.questions_total || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + (s.metadata?.questions_correct || 0), 0) || 0;

    // Last 7 days activity
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentSessions = sessions?.filter(s => new Date(s.start_at) >= last7Days) || [];

    // Get subjects
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('workspace_id', params.id)
      .order('name');

    // Calculate weekly streak
    const today = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      
      const hasSession = sessions?.some(s => {
        const sessionDate = new Date(s.start_at);
        return sessionDate.toDateString() === date.toDateString();
      });

      return {
        day: dayName,
        active: hasSession || false
      };
    });

    const currentStreak = weekData.filter(d => d.active).length;

    dashboardData = {
      totalHours: (totalMinutes / 60).toFixed(1),
      totalQuestions,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      sessionsCount: sessions?.length || 0,
      recentSessions: recentSessions.length,
      streak: currentStreak,
      weekData,
      totalSubjects: subjects?.length || 0,
      completedSubjects: Math.floor((subjects?.length || 0) * 0.3), // Mock data
    };
  } else if (workspace.type === 'faculdade') {
    // Load faculty data
    const { data: subjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('workspace_id', params.id);

    const { data: readings } = await supabase
      .from('readings')
      .select('*')
      .eq('workspace_id', params.id);

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('workspace_id', params.id)
      .eq('session_type', 'study');

    // Calculate weekly streak
    const today = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      
      const hasSession = sessions?.some(s => {
        const sessionDate = new Date(s.start_at);
        return sessionDate.toDateString() === date.toDateString();
      });

      return {
        day: dayName,
        active: hasSession || false
      };
    });

    const currentStreak = weekData.filter(d => d.active).length;
    const totalMinutes = sessions?.reduce((sum, s) => sum + (s.metadata?.duration_minutes || 0), 0) || 0;

    dashboardData = {
      totalSubjects: subjects?.length || 0,
      totalReadings: readings?.length || 0,
      totalSessions: sessions?.length || 0,
      totalHours: (totalMinutes / 60).toFixed(1),
      completedReadings: readings?.filter(r => (r as any).status === 'lido').length || 0,
      streak: currentStreak,
      weekData,
      accuracy: 75, // Mock data
    };
  } else if (workspace.type === 'taf') {
    // Load training data
    const { data: trainings } = await supabase
      .from('taf_trainings')
      .select('*')
      .eq('workspace_id', params.id)
      .order('training_date', { ascending: false });

    const totalDistance = trainings?.reduce((sum, t) => sum + (t.distance_m || 0), 0) || 0;
    const totalTime = trainings?.reduce((sum, t) => sum + (t.time_s || 0), 0) || 0;

    // Calculate weekly activity
    const today = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()];
      
      const hasTraining = trainings?.some(t => {
        const trainingDate = new Date(t.training_date);
        return trainingDate.toDateString() === date.toDateString();
      });

      return {
        day: dayName,
        active: hasTraining || false
      };
    });

    const currentStreak = weekData.filter(d => d.active).length;

    dashboardData = {
      totalTrainings: trainings?.length || 0,
      totalDistance: (totalDistance / 1000).toFixed(1),
      totalHours: (totalTime / 3600).toFixed(1),
      streak: currentStreak,
      weekData,
      completedWorkouts: trainings?.length || 0,
      accuracy: 85, // Performance score
    };
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 hidden lg:block">
        <WorkspaceSidebar workspaceId={params.id} workspaceType={workspace.type} />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Home page</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Welcome Message */}
          <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Ótimo esforço até agora! Continue o bom trabalho, e com um pouco mais de foco na sua frequência, você certamente atingirá seu potencial máximo! 💪
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                ✕
              </Button>
            </CardContent>
          </Card>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desempenho Geral</CardTitle>
                  <CardDescription>Taxa de conclusão do curso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <CircularProgress 
                      value={dashboardData.accuracy || 80} 
                      label="PRO LEARNER"
                      size={180}
                      strokeWidth={14}
                      color="#10b981"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <StatCard
                  icon={BookOpen}
                  title={workspace.type === 'concurso' ? 'Total de matérias' : workspace.type === 'faculdade' ? 'Total de disciplinas' : 'Total de treinos'}
                  value={workspace.type === 'taf' ? dashboardData.totalTrainings : dashboardData.totalSubjects || 0}
                  iconColor="text-cyan-500"
                  iconBgColor="bg-cyan-50 dark:bg-cyan-900/20"
                  progressValue={workspace.type === 'concurso' ? 5 : 3}
                  progressColor="#06b6d4"
                />

                <StatCard
                  icon={Target}
                  title={workspace.type === 'taf' ? 'Treinos concluídos' : 'Matérias concluídas'}
                  value={workspace.type === 'taf' ? dashboardData.completedWorkouts : dashboardData.completedSubjects || 1}
                  iconColor="text-blue-500"
                  iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                  progressValue={workspace.type === 'concurso' ? 1 : 2}
                  progressColor="#3b82f6"
                />

                <StatCard
                  icon={Brain}
                  title="Quiz praticado"
                  value="20"
                  subtitle="de 100"
                  iconColor="text-purple-500"
                  iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                  progressValue={20}
                  progressColor="#a855f7"
                />

                <StatCard
                  icon={CheckCircle2}
                  title="Tarefas concluídas"
                  value="10"
                  subtitle="de 15"
                  iconColor="text-green-500"
                  iconBgColor="bg-green-50 dark:bg-green-900/20"
                  progressValue={67}
                  progressColor="#10b981"
                />

                <StatCard
                  icon={Clock}
                  title={workspace.type === 'taf' ? 'Horas treinadas' : 'Aulas assistidas'}
                  value={workspace.type === 'taf' ? `${dashboardData.totalHours}h` : '70%'}
                  iconColor="text-orange-500"
                  iconBgColor="bg-orange-50 dark:bg-orange-900/20"
                  progressValue={70}
                  progressColor="#f97316"
                />

                <StatCard
                  icon={Timer}
                  title="Horas dedicadas"
                  value={`${dashboardData.totalHours || 0}h`}
                  subtitle="Total de horas em estudos"
                  iconColor="text-pink-500"
                  iconBgColor="bg-pink-50 dark:bg-pink-900/20"
                  progressValue={parseInt(dashboardData.totalHours) || 0}
                  progressColor="#ec4899"
                />
              </div>

              {/* Upcoming Classes/Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {workspace.type === 'faculdade' ? 'Próximas Aulas' : workspace.type === 'taf' ? 'Próximos Treinos' : 'Próximas Sessões'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workspace.type === 'concurso' && (
                      <>
                        <Link href={`/workspaces/${params.id}/study-sessions`}>
                          <div className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <img 
                              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop" 
                              alt="Study" 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">Sessão de Estudos - Direito Constitucional</h4>
                              <p className="text-sm text-gray-500">por Você</p>
                              <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                                Direito
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Próxima sessão</p>
                              <p className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Quando quiser
                              </p>
                              <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                                Iniciar
                              </Button>
                            </div>
                          </div>
                        </Link>

                        <Link href={`/workspaces/${params.id}/study-sessions`}>
                          <div className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <img 
                              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop" 
                              alt="Study" 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">Questões - Português</h4>
                              <p className="text-sm text-gray-500">por Você</p>
                              <Badge variant="secondary" className="mt-1 bg-cyan-100 text-cyan-700">
                                Português
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Em 2 horas</p>
                              <p className="text-xs text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                Agendado
                              </p>
                              <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                                Iniciar
                              </Button>
                            </div>
                          </div>
                        </Link>
                      </>
                    )}

                    {workspace.type === 'faculdade' && (
                      <>
                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all">
                          <img 
                            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop" 
                            alt="Class" 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">Cálculo II - Aula 5</h4>
                            <p className="text-sm text-gray-500">por Prof. Silva</p>
                            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                              Matemática
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Hoje, 14:00</p>
                            <p className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Em 2h
                            </p>
                            <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                              Entrar
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all">
                          <img 
                            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=100&h=100&fit=crop" 
                            alt="Class" 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">Física Quântica - Lab 3</h4>
                            <p className="text-sm text-gray-500">por Prof. Santos</p>
                            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                              Física
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Amanhã, 10:00</p>
                            <p className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Em 1 dia
                            </p>
                            <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                              Entrar
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {workspace.type === 'taf' && (
                      <>
                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-all">
                          <img 
                            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=100&h=100&fit=crop" 
                            alt="Training" 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">Corrida 5km</h4>
                            <p className="text-sm text-gray-500">Treino de Resistência</p>
                            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                              Cardio
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Hoje, 06:00</p>
                            <p className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Manhã
                            </p>
                            <Button size="sm" className="mt-2 bg-green-500 hover:bg-green-600">
                              Iniciar
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              {/* Streak Tracker */}
              {dashboardData.weekData && (
                <StreakTracker 
                  currentStreak={dashboardData.streak || 0}
                  weekData={dashboardData.weekData}
                />
              )}

              {/* Assignment/Tasks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Tarefas</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver tudo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">Resolver questões de matemática</h4>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            Tarefa 5
                          </Badge>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ● Prazo: 15 Nov, 2024 • 12:00PM
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                          Ver
                        </Button>
                        <Button size="sm" className="flex-1 h-8 bg-green-500 hover:bg-green-600 text-xs">
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Quizzes */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Quiz Pendentes</CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Ver tudo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">Revisão Geral</h4>
                        <p className="text-xs text-gray-500">● 10 questões ● 15 min</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Iniciar
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">Teste Rápido</h4>
                        <p className="text-xs text-gray-500">● 10 questões ● 15 min</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Iniciar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
