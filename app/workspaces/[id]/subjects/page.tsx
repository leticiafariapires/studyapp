"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Pencil, Trash2, FolderOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export default function SubjectsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
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
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setSubjects(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    
    if (editingSubject) {
      // Update
      await supabase
        .from('subjects')
        .update({
          name: formData.name,
          color: formData.color,
        })
        .eq('id', editingSubject.id);
    } else {
      // Create
      await supabase
        .from('subjects')
        .insert({
          workspace_id: workspaceId,
          name: formData.name,
          color: formData.color,
          sort_order: subjects.length,
        });
    }

    setDialogOpen(false);
    setEditingSubject(null);
    setFormData({ name: "", color: "#3b82f6" });
    loadSubjects();
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      color: subject.color,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta matéria?")) return;
    
    const supabase = createClient();
    await supabase.from('subjects').delete().eq('id', id);
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
            <h1 className="text-3xl font-bold">Matérias</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSubject(null);
                setFormData({ name: "", color: "#3b82f6" });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingSubject ? "Editar Matéria" : "Nova Matéria"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados da matéria
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
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
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingSubject ? "Salvar" : "Criar"}
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
                Nenhuma matéria criada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Matéria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
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
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/workspaces/${workspaceId}/subjects/${subject.id}/topics`}>
                    <Button variant="outline" className="w-full">
                      Ver Tópicos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
