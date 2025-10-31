"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  ListTodo, 
  StickyNote,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Tag,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  category_id: string | null;
  category?: { name: string; color: string };
}

interface Event {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  color: string;
}

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    const supabase = createClient();

    // Carregar tarefas
    const { data: tasksData } = await supabase
      .from('planner_tasks')
      .select(`
        *,
        category:planner_categories(name, color)
      `)
      .eq('workspace_id', workspaceId)
      .neq('status', 'completed')
      .order('due_date', { ascending: true });

    if (tasksData) {
      setTasks(tasksData);
      
      // Filtrar tarefas de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasksFiltered = tasksData.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate >= today && taskDate < tomorrow;
      });
      setTodayTasks(todayTasksFiltered);

      // Calcular estatísticas
      const now = new Date();
      const overdueCount = tasksData.filter(task => 
        task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
      ).length;

      setStats({
        total: tasksData.length,
        completed: 0,
        inProgress: tasksData.filter(t => t.status === 'in_progress').length,
        overdue: overdueCount
      });
    }

    // Carregar eventos próximos (próximos 7 dias)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: eventsData } = await supabase
      .from('planner_events')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('start_date', today.toISOString())
      .lte('start_date', nextWeek.toISOString())
      .order('start_date', { ascending: true })
      .limit(5);

    if (eventsData) {
      setUpcomingEvents(eventsData);
    }

    setLoading(false);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const supabase = createClient();
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    
    await supabase
      .from('planner_tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    showToast(
      newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta',
      'success'
    );
    loadData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem prazo';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Atrasada ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/workspaces/${workspaceId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <WorkspaceSwitcher />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Planner Pessoal
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize suas tarefas e compromissos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atrasadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <CardTitle>Tarefas de Hoje</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {todayTasks.length} tarefas
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma tarefa para hoje! 🎉</p>
                  </div>
                ) : (
                  todayTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id, task.status)}
                        className="mt-0.5"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          {task.category && (
                            <span
                              className="text-xs px-2 py-1 rounded-full"
                              style={{ 
                                backgroundColor: task.category.color + '20',
                                color: task.category.color 
                              }}
                            >
                              {task.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* All Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-primary" />
                    <CardTitle>Todas as Tarefas</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}/planner/tasks`}>
                      Ver todas
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className="mt-0.5"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle>Próximos Eventos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Nenhum evento próximo
                  </div>
                ) : (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border-l-4"
                      style={{ borderLeftColor: event.color }}
                    >
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.start_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))
                )}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/workspaces/${workspaceId}/planner/calendar`}>
                    Ver Calendário Completo
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/workspaces/${workspaceId}/planner/tasks`}>
                    <ListTodo className="w-4 h-4 mr-2" />
                    Gerenciar Tarefas
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/workspaces/${workspaceId}/planner/calendar`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Calendário
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/workspaces/${workspaceId}/planner/notes`}>
                    <StickyNote className="w-4 h-4 mr-2" />
                    Minhas Notas
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/workspaces/${workspaceId}/planner/categories`}>
                    <Tag className="w-4 h-4 mr-2" />
                    Categorias
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
