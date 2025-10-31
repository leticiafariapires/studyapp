"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, FolderOpen, BookOpen, User, Calendar as CalendarIcon, BookMarked, BookText, GraduationCap } from "lucide-react";
import { SimpleSwitch } from "@/components/ui/SimpleSwitch";

interface Period {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  sort_order: number;
}

interface FacultySubject {
  id: string;
  name: string;
  description: string | null;
  professor: string | null;
  schedule: string | null;
  color: string;
  period_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  topic_count?: number;
  reading_count?: number;
  note_count?: number;
}

export default function FacultySubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<FacultySubject | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    professor: "",
    schedule: "",
    color: "#3b82f6",
    is_active: true,
  });

  const colors = [
    { name: "Azul", value: "#3b82f6" },
    { name: "Roxo", value: "#8b5cf6" },
    { name: "Verde", value: "#10b981" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Amarelo", value: "#f59e0b" },
    { name: "Rosa", value: "#ec4899" },
  ];

  useEffect(() => {
    loadSubjects();
  }, [workspaceId]);

  const loadSubjects = async () => {
    const supabase = createClient();
    
    // Buscar matérias com contagem de tópicos, leituras e anotações
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        *,
        topics:faculty_topics(count),
        readings:faculty_readings(count),
        notes:faculty_notes(count)
      `)
      .eq('workspace_id', workspaceId)
      .order('name', { ascending: true });

    if (!subjectsError && subjectsData) {
      const formattedSubjects = subjectsData.map(subject => ({
        ...subject,
        topic_count: (subject.topics as unknown as any[])?.[0]?.count || 0,
        reading_count: (subject.readings as unknown as any[])?.[0]?.count || 0,
        note_count: (subject.notes as unknown as any[])?.[0]?.count || 0,
      }));
      
      setSubjects(formattedSubjects);
    } else {
      console.error("Error loading subjects:", subjectsError);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    
    const subjectData = {
      name: formData.name,
      description: formData.description || null,
      professor: formData.professor || null,
      schedule: formData.schedule || null,
      color: formData.color,
      is_active: formData.is_active,
      updated_at: new Date().toISOString(),
    };
    
    if (editingSubject) {
      // Update
      await supabase
        .from('subjects')
        .update(subjectData)
        .eq('id', editingSubject.id);
    } else {
      // Create
      await supabase
        .from('subjects')
        .insert({
          ...subjectData,
          workspace_id: workspaceId,
        });
    }

    setDialogOpen(false);
    setEditingSubject(null);
    setFormData({ 
      name: "", 
      description: "", 
      professor: "", 
      schedule: "", 
      color: "#3b82f6",
      is_active: true,
    });
    loadSubjects();
  };

  const handleEdit = (subject: FacultySubject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || "",
      professor: subject.professor || "",
      schedule: subject.schedule || "",
      color: subject.color,
      is_active: subject.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria? Todas as informações relacionadas (tópicos, leituras e anotações) também serão removidas.")) return;
    
    const supabase = createClient();
    await supabase.from('subjects').delete().eq('id', id);
    loadSubjects();
  };

  const toggleActive = async (subject: FacultySubject) => {
    const supabase = createClient();
    await supabase
      .from('subjects')
      .update({ 
        is_active: !subject.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', subject.id);
    
    loadSubjects();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Matérias da Faculdade</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSubject(null);
                setFormData({ 
                  name: "", 
                  description: "", 
                  professor: "", 
                  schedule: "", 
                  color: "#3b82f6",
                  is_active: true,
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingSubject ? "Editar Matéria" : "Nova Matéria"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSubject 
                      ? "Atualize os detalhes da matéria" 
                      : "Adicione uma nova matéria à sua grade curricular"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Matéria*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Cálculo I"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (Opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione uma breve descrição sobre a matéria..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="professor">Professor(a)</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="professor"
                          value={formData.professor}
                          onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                          placeholder="Nome do(a) professor(a)"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Horário</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="schedule"
                          value={formData.schedule}
                          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                          placeholder="Ex: Segunda 14h-16h"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cor de Identificação</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className={`h-10 rounded-md border-2 ${
                            formData.color === color.value ? 'border-black dark:border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <SimpleSwitch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked: boolean) => 
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {formData.is_active ? 'Ativa' : 'Inativa'}
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingSubject ? "Salvar Alterações" : "Criar Matéria"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma matéria cadastrada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Matéria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card 
                key={subject.id} 
                className={`transition-all hover:shadow-lg ${
                  !subject.is_active ? 'opacity-70' : ''
                }`}
              >
                <div 
                  className="h-2 w-full rounded-t-lg"
                  style={{ backgroundColor: subject.color }}
                ></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      {subject.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {subject.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subject.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {subject.professor && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2" />
                        <span>{subject.professor}</span>
                      </div>
                    )}
                    {subject.schedule && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{subject.schedule}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardFooter className="border-t pt-4">
                  <div className="w-full">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <Link 
                        href={`/workspaces/${workspaceId}/faculty-subjects/${subject.id}/topics`}
                        className="group"
                      >
                        <div className="flex flex-col items-center">
                          <BookMarked className="w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{subject.topic_count || 0}</span>
                          <span className="text-xs text-muted-foreground">Tópicos</span>
                        </div>
                      </Link>
                      <Link 
                        href={`/workspaces/${workspaceId}/faculty-subjects/${subject.id}/readings`}
                        className="group"
                      >
                        <div className="flex flex-col items-center">
                          <BookOpen className="w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{subject.reading_count || 0}</span>
                          <span className="text-xs text-muted-foreground">Leituras</span>
                        </div>
                      </Link>
                      <Link 
                        href={`/workspaces/${workspaceId}/faculty-subjects/${subject.id}/notes`}
                        className="group"
                      >
                        <div className="flex flex-col items-center">
                          <BookText className="w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm font-medium">{subject.note_count || 0}</span>
                          <span className="text-xs text-muted-foreground">Anotações</span>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <SimpleSwitch
                          checked={subject.is_active}
                          onCheckedChange={() => toggleActive(subject)}
                          className="mr-2"
                        />
                        <span className="text-sm text-muted-foreground">
                          {subject.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                      <Link 
                        href={`/workspaces/${workspaceId}/faculty-subjects/${subject.id}/topics`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
