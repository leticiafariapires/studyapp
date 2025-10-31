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
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";

interface Assessment {
  id: string;
  subject_id: string;
  title: string;
  type: string;
  due_date: string;
  subject?: {
    name: string;
    color: string;
  };
}

export default function FacultyCalendarPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({
    subject_id: "",
    title: "",
    type: "exam",
    description: "",
    due_date: "",
    weight: "",
    max_grade: "10",
  });

  useEffect(() => {
    loadSubjects();
    loadAssessments();
  }, [currentDate]);

  const loadSubjects = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (data) setSubjects(data);
  };

  const loadAssessments = async () => {
    const supabase = createClient();
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data } = await supabase
      .from('faculty_assessments')
      .select(`
        *,
        subject:subjects(name, color)
      `)
      .gte('due_date', startOfMonth.toISOString())
      .lte('due_date', endOfMonth.toISOString())
      .order('due_date', { ascending: true });

    if (data) setAssessments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    
    await supabase.from('faculty_assessments').insert({
      subject_id: formData.subject_id,
      title: formData.title,
      type: formData.type,
      description: formData.description || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      max_grade: parseFloat(formData.max_grade),
      status: 'pending',
    });

    setDialogOpen(false);
    setFormData({
      subject_id: "",
      title: "",
      type: "exam",
      description: "",
      due_date: "",
      weight: "",
      max_grade: "10",
    });
    loadAssessments();
  };

  const openDialogForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setFormData({ ...formData, due_date: dateStr });
    setDialogOpen(true);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getAssessmentsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    return assessments.filter(a => {
      const assessmentDate = new Date(a.due_date).toISOString().split('T')[0];
      return assessmentDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'exam': return '📝';
      case 'assignment': return '📄';
      case 'project': return '🎯';
      case 'quiz': return '❓';
      case 'presentation': return '🎤';
      default: return '📋';
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/workspaces/${workspaceId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-8 h-8" />
              Calendário Acadêmico
            </h1>
            <p className="text-muted-foreground">
              Visualize todas as provas, trabalhos e prazos
            </p>
          </div>
        </div>

        {/* Calendar Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm p-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayAssessments = getAssessmentsForDay(day);
                const isToday = 
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={day}
                    className={`min-h-[100px] p-2 border rounded-lg relative group ${
                      isToday ? 'bg-primary/10 border-primary' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm">{day}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openDialogForDate(day)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {dayAssessments.map((assessment) => (
                        <Link
                          key={assessment.id}
                          href={`/workspaces/${workspaceId}/faculty-subjects/${assessment.subject_id}/assessments`}
                        >
                          <div
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: assessment.subject?.color + '20',
                              borderLeft: `3px solid ${assessment.subject?.color}`
                            }}
                          >
                            <div className="font-medium truncate">
                              {getTypeEmoji(assessment.type)} {assessment.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {assessment.subject?.name}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Assessments List */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma avaliação agendada para este mês
              </p>
            ) : (
              <div className="space-y-3">
                {assessments.slice(0, 5).map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/workspaces/${workspaceId}/faculty-subjects/${assessment.subject_id}/assessments`}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: assessment.subject?.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {getTypeEmoji(assessment.type)} {assessment.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {assessment.subject?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(assessment.due_date).toLocaleDateString('pt-BR', { 
                            weekday: 'short' 
                          })}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para Adicionar Avaliação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Avaliação</DialogTitle>
                <DialogDescription>
                  Adicione uma prova, trabalho ou atividade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Matéria *</Label>
                    <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a matéria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exam">📝 Prova</SelectItem>
                        <SelectItem value="assignment">📄 Trabalho</SelectItem>
                        <SelectItem value="project">🎯 Projeto</SelectItem>
                        <SelectItem value="quiz">❓ Quiz</SelectItem>
                        <SelectItem value="presentation">🎤 Apresentação</SelectItem>
                        <SelectItem value="other">📋 Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: P1, Trabalho Final"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalhes sobre a avaliação..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Data *</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (%)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_grade">Nota Máxima</Label>
                    <Input
                      id="max_grade"
                      type="number"
                      step="0.01"
                      value={formData.max_grade}
                      onChange={(e) => setFormData({ ...formData, max_grade: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
