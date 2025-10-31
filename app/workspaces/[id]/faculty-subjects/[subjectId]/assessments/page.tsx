"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Pencil, Trash2, ClipboardCheck, Calendar, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assessment {
  id: string;
  subject_id: string;
  title: string;
  type: 'exam' | 'assignment' | 'project' | 'quiz' | 'presentation' | 'other';
  description: string | null;
  due_date: string | null;
  weight: number | null;
  grade: number | null;
  max_grade: number;
  status: 'pending' | 'completed' | 'graded';
  notes: string | null;
  created_at: string;
}

export default function AssessmentsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const subjectId = params.subjectId as string;
  const { showToast, ToastContainer } = useToast();

  const [subject, setSubject] = useState<{ id: string; name: string; color: string } | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "exam" as Assessment['type'],
    description: "",
    due_date: "",
    weight: "",
    grade: "",
    max_grade: "10",
    status: "pending" as Assessment['status'],
    notes: ""
  });

  useEffect(() => {
    loadSubject();
    loadAssessments();
  }, [subjectId]);

  const loadSubject = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('id', subjectId)
      .single();

    if (data) setSubject(data);
  };

  const loadAssessments = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('faculty_assessments')
      .select('*')
      .eq('subject_id', subjectId)
      .order('due_date', { ascending: true });

    if (data) setAssessments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const assessmentData = {
      subject_id: subjectId,
      title: formData.title,
      type: formData.type,
      description: formData.description || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      grade: formData.grade ? parseFloat(formData.grade) : null,
      max_grade: parseFloat(formData.max_grade),
      status: formData.status,
      notes: formData.notes || null,
      updated_at: new Date().toISOString()
    };

    if (editingAssessment) {
      await supabase
        .from('faculty_assessments')
        .update(assessmentData)
        .eq('id', editingAssessment.id);
      showToast('Avaliação atualizada!', 'success');
    } else {
      await supabase
        .from('faculty_assessments')
        .insert(assessmentData);
      showToast('Avaliação criada!', 'success');
    }

    setDialogOpen(false);
    setEditingAssessment(null);
    resetForm();
    loadAssessments();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "exam",
      description: "",
      due_date: "",
      weight: "",
      grade: "",
      max_grade: "10",
      status: "pending",
      notes: ""
    });
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setFormData({
      title: assessment.title,
      type: assessment.type,
      description: assessment.description || "",
      due_date: assessment.due_date ? assessment.due_date.split('T')[0] : "",
      weight: assessment.weight?.toString() || "",
      grade: assessment.grade?.toString() || "",
      max_grade: assessment.max_grade.toString(),
      status: assessment.status,
      notes: assessment.notes || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    const supabase = createClient();
    await supabase.from('faculty_assessments').delete().eq('id', id);
    showToast('Avaliação excluída!', 'success');
    loadAssessments();
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      exam: 'Prova',
      assignment: 'Trabalho',
      project: 'Projeto',
      quiz: 'Quiz',
      presentation: 'Apresentação',
      other: 'Outro'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return '📝';
      case 'assignment': return '📄';
      case 'project': return '🎯';
      case 'quiz': return '❓';
      case 'presentation': return '🎤';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAverage = () => {
    const graded = assessments.filter(a => a.grade !== null && a.weight !== null);
    if (graded.length === 0) return null;

    const totalWeight = graded.reduce((sum, a) => sum + (a.weight || 0), 0);
    if (totalWeight === 0) return null;

    const weightedSum = graded.reduce((sum, a) => {
      const normalizedGrade = (a.grade || 0) / a.max_grade * 10;
      return sum + normalizedGrade * (a.weight || 0);
    }, 0);

    return (weightedSum / totalWeight).toFixed(2);
  };

  if (loading || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const average = calculateAverage();
  const pending = assessments.filter(a => a.status === 'pending').length;
  const graded = assessments.filter(a => a.status === 'graded').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/faculty-subjects/${subjectId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></span>
                {subject.name} - Avaliações
              </h1>
              <p className="text-muted-foreground text-sm">
                {assessments.length} avaliações • {pending} pendentes • {graded} avaliadas
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { setEditingAssessment(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingAssessment ? "Editar Avaliação" : "Nova Avaliação"}</DialogTitle>
                  <DialogDescription>
                    Adicione informações sobre provas, trabalhos e atividades
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Prova P1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select value={formData.type} onValueChange={(value: Assessment['type']) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exam">Prova</SelectItem>
                          <SelectItem value="assignment">Trabalho</SelectItem>
                          <SelectItem value="project">Projeto</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="presentation">Apresentação</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="due_date">Data</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: Assessment['status']) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="graded">Avaliada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Nota Obtida</Label>
                      <Input
                        id="grade"
                        type="number"
                        step="0.01"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="8.5"
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

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Anotações sobre a avaliação..."
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingAssessment ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {average ? average : '-'}
              </div>
              <p className="text-xs text-muted-foreground">Média ponderada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assessments.length}</div>
              <p className="text-xs text-muted-foreground">Avaliações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pending}</div>
              <p className="text-xs text-muted-foreground">A realizar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{graded}</div>
              <p className="text-xs text-muted-foreground">Com nota</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhuma avaliação cadastrada</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Avaliação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assessments.map(assessment => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(assessment.type)}</span>
                        <h3 className="font-semibold text-lg">{assessment.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(assessment.status)}`}>
                          {assessment.status === 'pending' && 'Pendente'}
                          {assessment.status === 'completed' && 'Concluída'}
                          {assessment.status === 'graded' && 'Avaliada'}
                        </span>
                      </div>

                      {assessment.description && (
                        <p className="text-sm text-muted-foreground mb-2">{assessment.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {getTypeLabel(assessment.type)}
                        </span>
                        {assessment.due_date && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {assessment.weight && (
                          <span className="text-muted-foreground">
                            Peso: {assessment.weight}%
                          </span>
                        )}
                        {assessment.grade !== null && (
                          <span className="font-semibold text-primary">
                            Nota: {assessment.grade}/{assessment.max_grade}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(assessment)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
