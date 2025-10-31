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
import { ArrowLeft, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

const predefinedColors = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Lime', value: '#84cc16' },
];

export default function CategoriesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { showToast, ToastContainer } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    icon: ""
  });

  useEffect(() => {
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
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const categoryData = {
      workspace_id: workspaceId,
      name: formData.name,
      color: formData.color,
      icon: formData.icon || null
    };

    if (editingCategory) {
      await supabase
        .from('planner_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      showToast('Categoria atualizada com sucesso!', 'success');
    } else {
      await supabase
        .from('planner_categories')
        .insert(categoryData);
      showToast('Categoria criada com sucesso!', 'success');
    }

    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", color: "#3b82f6", icon: "" });
    loadCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? As tarefas não serão excluídas, apenas desvinculadas.")) return;

    const supabase = createClient();
    await supabase.from('planner_categories').delete().eq('id', id);
    showToast('Categoria excluída com sucesso!', 'success');
    loadCategories();
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/workspaces/${workspaceId}/planner`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Categorias</h1>
              <p className="text-muted-foreground text-sm">
                {categories.length} categorias
              </p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ name: "", color: "#3b82f6", icon: "" });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory ? "Atualize os detalhes da categoria" : "Crie uma nova categoria para organizar suas tarefas"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Trabalho, Pessoal, Estudos"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-full h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                            formData.color === color.value 
                              ? 'border-primary ring-2 ring-primary ring-offset-2' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <div className="mt-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Ícone (opcional)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="Ex: 💼, 🏠, 📚"
                      maxLength={2}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use um emoji para representar a categoria
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Salvar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhuma categoria criada ainda</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crie categorias para organizar melhor suas tarefas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.icon && (
                        <span className="text-xl">{category.icon}</span>
                      )}
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: category.color + '20',
                        color: category.color
                      }}
                    >
                      Cor: {category.color}
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
