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
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, CheckCircle, Circle, ExternalLink } from "lucide-react";
import { SimpleSwitch } from "@/components/ui/SimpleSwitch";

export interface Reading {
  id: string;
  subject_id: string;
  title: string;
  author: string | null;
  url: string | null;
  is_required: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function SubjectReadingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const subjectId = params.subjectId as string;
  
  const [subject, setSubject] = useState<{ id: string; name: string; color: string } | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    url: "",
    is_required: true,
    is_completed: false,
  });

  useEffect(() => {
    loadSubject();
    loadReadings();
  }, [subjectId]);

  const loadSubject = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, color')
      .eq('id', subjectId)
      .single();

    if (!error && data) {
      setSubject(data);
    } else {
      console.error("Error loading subject:", error);
    }
  };

  const loadReadings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('faculty_readings')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReadings(data);
    } else {
      console.error("Error loading readings:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    
    const readingData = {
      title: formData.title,
      author: formData.author || null,
      url: formData.url || null,
      is_required: formData.is_required,
      is_completed: formData.is_completed,
      subject_id: subjectId,
      updated_at: new Date().toISOString(),
    };
    
    if (editingReading) {
      // Update
      await supabase
        .from('faculty_readings')
        .update(readingData)
        .eq('id', editingReading.id);
    } else {
      // Create
      await supabase
        .from('faculty_readings')
        .insert(readingData);
    }

    setDialogOpen(false);
    setEditingReading(null);
    setFormData({ 
      title: "", 
      author: "", 
      url: "", 
      is_required: true,
      is_completed: false,
    });
    loadReadings();
  };

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    setFormData({
      title: reading.title,
      author: reading.author || "",
      url: reading.url || "",
      is_required: reading.is_required,
      is_completed: reading.is_completed,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta leitura?")) return;
    
    const supabase = createClient();
    await supabase.from('faculty_readings').delete().eq('id', id);
    loadReadings();
  };

  const toggleComplete = async (reading: Reading) => {
    const supabase = createClient();
    await supabase
      .from('faculty_readings')
      .update({ 
        is_completed: !reading.is_completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', reading.id);
    
    loadReadings();
  };

  const toggleRequired = async (reading: Reading) => {
    const supabase = createClient();
    await supabase
      .from('faculty_readings')
      .update({ 
        is_required: !reading.is_required,
        updated_at: new Date().toISOString()
      })
      .eq('id', reading.id);
    
    loadReadings();
  };

  if (loading || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedCount = readings.filter(r => r.is_completed).length;
  const requiredCount = readings.filter(r => r.is_required).length;
  const progress = readings.length > 0 ? Math.round((completedCount / readings.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/faculty-subjects`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></span>
                {subject.name} - Leituras
              </h1>
              <p className="text-muted-foreground text-sm">
                {readings.length} leituras • {completedCount} concluídas • {requiredCount} obrigatórias
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                onClick={() => {
                  setEditingReading(null);
                  setFormData({ 
                    title: "", 
                    author: "", 
                    url: "", 
                    is_required: true,
                    is_completed: false,
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Leitura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingReading ? "Editar Leitura" : "Nova Leitura"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingReading 
                      ? "Atualize os detalhes da leitura" 
                      : "Adicione uma nova leitura para esta matéria"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Título do livro, artigo, etc."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Autor (Opcional)</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Nome do autor"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url">Link (Opcional)</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://exemplo.com/artigo"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <SimpleSwitch
                      id="is_required"
                      checked={formData.is_required}
                      onCheckedChange={(checked: boolean) => 
                        setFormData({ ...formData, is_required: checked })
                      }
                    />
                    <Label htmlFor="is_required" className="cursor-pointer">
                      Leitura obrigatória
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SimpleSwitch
                      id="is_completed"
                      checked={formData.is_completed}
                      onCheckedChange={(checked: boolean) => 
                        setFormData({ ...formData, is_completed: checked })
                      }
                    />
                    <Label htmlFor="is_completed" className="cursor-pointer">
                      {formData.is_completed ? 'Concluída' : 'Marcar como concluída'}
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingReading ? "Salvar" : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progresso de leituras</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {readings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma leitura adicionada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Leitura
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {readings.map((reading) => (
              <Card 
                key={reading.id} 
                className={`transition-all hover:shadow-md ${
                  reading.is_completed ? 'opacity-80' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => toggleComplete(reading)}
                        className="mt-1"
                        aria-label={reading.is_completed ? "Marcar como não lida" : "Marcar como lida"}
                      >
                        {reading.is_completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      <div>
                        <h3 className={`text-lg font-medium ${reading.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                          {reading.title}
                        </h3>
                        {reading.author && (
                          <p className="text-sm text-muted-foreground">
                            {reading.author}
                          </p>
                        )}
                        {reading.url && (
                          <a 
                            href={reading.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Abrir link
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reading)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <SimpleSwitch
                        id={`required-${reading.id}`}
                        checked={reading.is_required}
                        onCheckedChange={() => toggleRequired(reading)}
                        className="mr-2"
                      />
                      <Label 
                        htmlFor={`required-${reading.id}`} 
                        className={`text-sm cursor-pointer ${
                          reading.is_required ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        }`}
                      >
                        {reading.is_required ? 'Obrigatória' : 'Opcional'}
                      </Label>
                    </div>
                    
                    <span className="text-muted-foreground">
                      Adicionada em {new Date(reading.created_at).toLocaleDateString('pt-BR')}
                    </span>
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
