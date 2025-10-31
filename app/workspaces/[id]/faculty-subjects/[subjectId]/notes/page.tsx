"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, FileText, BookMarked } from "lucide-react";

interface Note {
  id: string;
  subject_id: string;
  title: string;
  content: string | null;
  class_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function FacultySubjectNotesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const subjectId = params.subjectId as string;

  const [subject, setSubject] = useState<{ id: string; name: string; color: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    class_date: "",
  });

  useEffect(() => {
    loadSubject();
    loadNotes();
  }, [subjectId]);

  const loadSubject = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, color")
      .eq("id", subjectId)
      .single();

    if (!error && data) {
      setSubject(data);
    } else {
      console.error("Error loading subject:", error);
    }
  };

  const loadNotes = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("faculty_notes")
      .select("*")
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    } else {
      console.error("Error loading notes:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    const noteData = {
      title: formData.title,
      content: formData.content || null,
      class_date: formData.class_date ? new Date(formData.class_date).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (editingNote) {
      await supabase
        .from("faculty_notes")
        .update(noteData)
        .eq("id", editingNote.id);
    } else {
      await supabase
        .from("faculty_notes")
        .insert({
          ...noteData,
          subject_id: subjectId,
        });
    }

    setDialogOpen(false);
    setEditingNote(null);
    setFormData({ title: "", content: "", class_date: "" });
    loadNotes();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      class_date: note.class_date ? note.class_date.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;

    const supabase = createClient();
    await supabase.from("faculty_notes").delete().eq("id", id);
    loadNotes();
  };

  if (loading || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                {subject.name} - Anotações
              </h1>
              <p className="text-muted-foreground text-sm">
                {notes.length} anotações registradas
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/workspaces/${workspaceId}/faculty-subjects/${subjectId}/topics`}>
              <Button variant="outline" size="sm">
                <BookMarked className="w-4 h-4 mr-2" />
                Tópicos
              </Button>
            </Link>
            <Link href={`/workspaces/${workspaceId}/faculty-subjects/${subjectId}/readings`}>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Leituras
              </Button>
            </Link>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  onClick={() => {
                    setEditingNote(null);
                    setFormData({ title: "", content: "", class_date: "" });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Anotação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingNote ? "Editar Anotação" : "Nova Anotação"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingNote
                        ? "Atualize os detalhes desta anotação"
                        : "Registre uma anotação sobre esta matéria"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título*</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Tema da aula ou assunto principal"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class_date">Data da aula (opcional)</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="class_date"
                          type="date"
                          value={formData.class_date}
                          onChange={(e) => setFormData({ ...formData, class_date: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Resumo / Anotações</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Adicione suas anotações principais, insights ou dúvidas..."
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingNote ? "Salvar" : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {notes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma anotação cadastrada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Anotação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {note.class_date
                          ? `Aula em ${new Date(note.class_date).toLocaleDateString("pt-BR")}`
                          : "Data não informada"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(note)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {note.content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {note.content}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum conteúdo registrado.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Criada em {new Date(note.created_at).toLocaleDateString("pt-BR")}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
