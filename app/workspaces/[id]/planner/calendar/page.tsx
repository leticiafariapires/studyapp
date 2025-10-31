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
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Pencil,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_all_day: boolean;
  color: string;
  category_id: string | null;
  category?: { name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

const eventColors = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
];

export default function CalendarPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
    is_all_day: false,
    color: "#3b82f6",
    category_id: "none"
  });

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [workspaceId, currentDate]);

  const loadCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('planner_categories')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('name');

    if (data) setCategories(data);
  };

  const loadEvents = async () => {
    const supabase = createClient();
    
    // Carregar eventos do mês atual (usando meio-dia para evitar problemas de timezone)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1, 12, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    
    const { data } = await supabase
      .from('planner_events')
      .select(`
        *,
        category:planner_categories(name, color)
      `)
      .eq('workspace_id', workspaceId)
      .gte('start_date', startOfMonth.toISOString())
      .lte('start_date', endOfMonth.toISOString())
      .order('start_date', { ascending: true });

    if (data) setEvents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    // Para eventos de dia inteiro, usar meio-dia para evitar problemas de timezone
    const startDateTime = formData.is_all_day
      ? new Date(`${formData.start_date}T12:00:00`).toISOString()
      : new Date(`${formData.start_date}T${formData.start_time}`).toISOString();

    const endDateTime = formData.end_date
      ? formData.is_all_day
        ? new Date(`${formData.end_date}T12:00:00`).toISOString()
        : new Date(`${formData.end_date}T${formData.end_time || formData.start_time}`).toISOString()
      : null;

    const eventData = {
      workspace_id: workspaceId,
      title: formData.title,
      description: formData.description || null,
      start_date: startDateTime,
      end_date: endDateTime,
      location: formData.location || null,
      is_all_day: formData.is_all_day,
      color: formData.color,
      category_id: formData.category_id !== 'none' ? formData.category_id : null,
      updated_at: new Date().toISOString()
    };

    if (editingEvent) {
      await supabase
        .from('planner_events')
        .update(eventData)
        .eq('id', editingEvent.id);
      showToast('Evento atualizado com sucesso!', 'success');
    } else {
      await supabase
        .from('planner_events')
        .insert(eventData);
      showToast('Evento criado com sucesso!', 'success');
    }

    setDialogOpen(false);
    setEditingEvent(null);
    resetForm();
    loadEvents();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      location: "",
      is_all_day: false,
      color: "#3b82f6",
      category_id: "none"
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    
    // Usar a data diretamente da string ISO sem conversão para evitar problemas de timezone
    const startDateStr = event.start_date.split('T')[0];
    const startTimeStr = event.start_date.split('T')[1]?.slice(0, 5) || "";
    
    const endDateStr = event.end_date ? event.end_date.split('T')[0] : "";
    const endTimeStr = event.end_date ? event.end_date.split('T')[1]?.slice(0, 5) || "" : "";

    setFormData({
      title: event.title,
      description: event.description || "",
      start_date: startDateStr,
      start_time: event.is_all_day ? "" : startTimeStr,
      end_date: endDateStr,
      end_time: event.is_all_day ? "" : endTimeStr,
      location: event.location || "",
      is_all_day: event.is_all_day,
      color: event.color,
      category_id: event.category_id || "none"
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    const supabase = createClient();
    await supabase.from('planner_events').delete().eq('id', id);
    showToast('Evento excluído com sucesso!', 'success');
    loadEvents();
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Formatar data alvo como YYYY-MM-DD
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return events.filter(event => {
      // Pegar apenas a parte da data (YYYY-MM-DD) do timestamp
      const eventDateStr = event.start_date.split('T')[0];
      return eventDateStr === targetDateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/planner`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Calendário</h1>
              <p className="text-muted-foreground text-sm">
                {events.length} eventos este mês
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/workspaces/${workspaceId}/planner/event-categories`}>
              <Button variant="outline" size="sm">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Categorias
              </Button>
            </Link>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? "Editar Evento" : "Novo Evento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEvent ? "Atualize os detalhes do evento" : "Adicione um novo evento ao calendário"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Reunião de equipe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhes do evento..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_all_day"
                      checked={formData.is_all_day}
                      onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_all_day" className="cursor-pointer">
                      Dia inteiro
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Data de Início *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>

                    {!formData.is_all_day && (
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Horário de Início</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="end_date">Data de Término</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>

                    {!formData.is_all_day && formData.end_date && (
                      <div className="space-y-2">
                        <Label htmlFor="end_time">Horário de Término</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: Sala de reuniões, Online"
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
                            {cat.icon && `${cat.icon} `}{cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Categorias: Aniversário, Consulta, Exame, etc. 
                      <Link href={`/workspaces/${workspaceId}/planner/event-categories`} className="text-primary hover:underline ml-1">
                        Gerenciar categorias
                      </Link>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Evento</Label>
                    <div className="flex gap-2">
                      {eventColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-10 h-10 rounded-lg border-2 transition-all ${
                            formData.color === color.value 
                              ? 'border-primary scale-110' 
                              : 'border-gray-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingEvent ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-bold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={today}>
                Hoje
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((day, index) => {
                const isToday = day && 
                  day === new Date().getDate() && 
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();
                
                const dayEvents = day ? getEventsForDay(day) : [];

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] border rounded-lg p-2 ${
                      day ? 'bg-card hover:bg-accent/50 cursor-pointer transition-colors' : 'bg-muted/30'
                    } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80"
                              style={{ 
                                backgroundColor: event.color + '20',
                                color: event.color,
                                borderLeft: `3px solid ${event.color}`
                              }}
                              onClick={() => handleEdit(event)}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground px-2">
                              +{dayEvents.length - 2} mais
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento neste mês</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-1 h-full rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(event.start_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: event.is_all_day ? undefined : '2-digit',
                            minute: event.is_all_day ? undefined : '2-digit'
                          })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                        {event.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: event.category.color + '20',
                              color: event.category.color
                            }}
                          >
                            {event.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}
