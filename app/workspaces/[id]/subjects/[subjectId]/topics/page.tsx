"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, BookOpen, CheckCircle, Circle, ListChecks } from "lucide-react";
import { SimpleSwitch } from "@/components/ui/SimpleSwitch";

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function SubjectTopicsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const subjectId = params.subjectId as string;
  
  const [subject, setSubject] = useState<{ id: string; name: string; color: string } | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_completed: false,
  });

  useEffect(() => {
    loadSubject();
    loadTopics();
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

  const loadTopics = async () => {
    const supabase = createClient();
    console.log('🔍 Loading topics for subject:', subjectId);
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true });

    console.log('📊 Topics loaded:', data?.length || 0);
    if (error) {
      console.error("❌ Error loading topics:", error);
      alert(`Erro ao carregar tópicos: ${error.message}`);
    }
    if (data) {
      console.log('📋 Topics data:', data);
      setTopics(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    console.log('💾 Saving topic:', formData);
    
    if (editingTopic) {
      // Update
      const { error } = await supabase
        .from('topics')
        .update({
          name: formData.title,
          completed: formData.is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTopic.id);
      
      if (error) {
        console.error('❌ Error updating topic:', error);
        alert(`Erro ao atualizar: ${error.message}`);
        return;
      }
      console.log('✅ Topic updated successfully');
    } else {
      // Create
      const { data, error } = await supabase
        .from('topics')
        .insert({
          subject_id: subjectId,
          name: formData.title,
          completed: formData.is_completed,
        })
        .select();
      
      if (error) {
        console.error('❌ Error creating topic:', error);
        alert(`Erro ao criar tópico: ${error.message}`);
        return;
      }
      console.log('✅ Topic created:', data);
    }

    setDialogOpen(false);
    setEditingTopic(null);
    setFormData({ title: "", description: "", is_completed: false });
    loadTopics();
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      title: topic.name,
      description: "",
      is_completed: topic.completed,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este tópico?")) return;
    
    const supabase = createClient();
    await supabase.from('topics').delete().eq('id', id);
    loadTopics();
  };

  const toggleComplete = async (topic: Topic) => {
    const supabase = createClient();
    await supabase
      .from('topics')
      .update({ 
        completed: !topic.completed,
        completed_at: !topic.completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', topic.id);
    
    loadTopics();
  };

  if (loading || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedCount = topics.filter(t => t.completed).length;
  const progress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/subjects`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></span>
                {subject.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {topics.length} tópicos • {completedCount} concluídos • {progress}% completo
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  onClick={() => {
                    setEditingTopic(null);
                    setFormData({ title: "", description: "", is_completed: false });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Tópico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTopic ? "Editar Tópico" : "Novo Tópico"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTopic 
                        ? "Atualize os detalhes do tópico" 
                        : "Adicione um novo tópico para esta matéria"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título do Tópico</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Introdução à Programação"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (Opcional)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Adicione detalhes sobre este tópico..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <SimpleSwitch
                        id="is_completed"
                        checked={formData.is_completed}
                        onCheckedChange={(checked: boolean) => 
                          setFormData({ ...formData, is_completed: checked })
                        }
                      />
                      <Label htmlFor="is_completed" className="cursor-pointer">
                        {formData.is_completed ? 'Concluído' : 'Marcar como concluído'}
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingTopic ? "Salvar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {topics.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhum tópico criado ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Tópico
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card 
                key={topic.id} 
                className={`transition-all hover:shadow-md ${
                  topic.completed ? 'opacity-80' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => toggleComplete(topic)}
                        className="mt-1"
                        aria-label={topic.completed ? "Marcar como não concluído" : "Marcar como concluído"}
                      >
                        {topic.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </button>
                      <div>
                        <CardTitle className={`text-lg ${topic.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {topic.name}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(topic)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(topic.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    Atualizado em {new Date(topic.updated_at).toLocaleDateString('pt-BR')}
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
