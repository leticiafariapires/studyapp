"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Flag,
  Filter,
  SortAsc
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  category_id: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function PlannerTasksPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task['priority'],
    status: "todo" as Task['status'],
    due_date: "",
    category_id: "none",
    tags: ""
  });

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, [workspaceId]);

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('planner_categories')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (data) setCategories(data);
  };

  const loadTasks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('planner_tasks')
      .select(`
        *,
        category:planner_categories(id, name, color)
      `)
      .eq('workspace_id', workspaceId)
      .order('due_date', { ascending: true });

    if (data) setTasks(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const taskData = {
      workspace_id: workspaceId,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      category_id: formData.category_id && formData.category_id !== 'none' ? formData.category_id : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
      updated_at: new Date().toISOString()
    };

    if (editingTask) {
      await supabase
        .from('planner_tasks')
        .update(taskData)
        .eq('id', editingTask.id);
      showToast('Tarefa atualizada com sucesso!', 'success');
    } else {
      await supabase
        .from('planner_tasks')
        .insert(taskData);
      showToast('Tarefa criada com sucesso!', 'success');
    }

    setDialogOpen(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      due_date: "",
      category_id: "none",
      tags: ""
    });
    loadTasks();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
      category_id: task.category_id || "none",
      tags: task.tags ? task.tags.join(', ') : ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;

    const supabase = createClient();
    await supabase.from('planner_tasks').delete().eq('id', id);
    showToast('Tarefa excluída com sucesso!', 'success');
    loadTasks();
  };

  const toggleTaskStatus = async (task: Task) => {
    const supabase = createClient();
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    await supabase
      .from('planner_tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    showToast(
      newStatus === 'completed' ? 'Tarefa concluída!' : 'Tarefa reaberta',
      'success'
    );
    loadTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = { urgent: 'Urgente', high: 'Alta', medium: 'Média', low: 'Baixa' };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels = { 
      todo: 'A Fazer', 
      in_progress: 'Em Andamento', 
      completed: 'Concluída', 
      cancelled: 'Cancelada' 
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sem prazo';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

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
          <Link href={`/workspaces/${workspaceId}/planner`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <WorkspaceSwitcher />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Tarefas</h1>
              <p className="text-muted-foreground text-sm">
                {filteredTasks.length} tarefas
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: "",
                    description: "",
                    priority: "medium",
                    status: "todo",
                    due_date: "",
                    category_id: "none",
                    tags: ""
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Atualize os detalhes da tarefa" : "Adicione uma nova tarefa ao seu planner"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Comprar mantimentos"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione detalhes sobre a tarefa..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value as Task['priority'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">A Fazer</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Data de Vencimento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_id">Categoria</Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem categoria</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Ex: pessoal, urgente, casa"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTask ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="todo">A Fazer</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[180px]">
              <Flag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma tarefa encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-1"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>

                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {getStatusLabel(task.status)}
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

                        {task.due_date && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(task.due_date)}
                          </span>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
