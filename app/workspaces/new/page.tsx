"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, BookOpen, Dumbbell, Sparkles, CalendarDays } from "lucide-react";
import { ProfileFixer } from "./fix-profile";

const workspaceTypes = [
  {
    id: 'concurso',
    name: 'Concurso',
    description: 'Questões, matérias e simulados para concursos públicos',
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'faculdade',
    name: 'Faculdade',
    description: 'Leituras, livros e gestão de matérias acadêmicas',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'taf',
    name: 'TAF',
    description: 'Treinos físicos, corrida e preparação para teste de aptidão física',
    icon: Dumbbell,
    color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  },
  {
    id: 'planner',
    name: 'Planner',
    description: 'Organize tarefas, eventos e notas do dia a dia',
    icon: CalendarDays,
    color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30',
  },
];

export default function NewWorkspacePage() {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileChecked, setProfileChecked] = useState(false);
  const router = useRouter();

  // Check and create profile if missing
  useEffect(() => {
    const ensureProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Check if profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (!profile) {
        await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'Usuário',
            prefs: {},
          });
      }

      setProfileChecked(true);
    };

    ensureProfile();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Nome do workspace é obrigatório");
      return;
    }

    if (!selectedType) {
      setError("Selecione um tipo de workspace");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        owner_id: user.id,
        name: name.trim(),
        type: selectedType,
        active: true,
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Workspace creation error:', workspaceError);
      setError("Erro ao criar workspace: " + workspaceError.message);
      setLoading(false);
      return;
    }

    // Redirect to workspace
    router.push(`/workspaces/${workspace.id}`);
    router.refresh();
  };

  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ProfileFixer />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Criar Novo Workspace</CardTitle>
            <CardDescription>
              Escolha um tipo de workspace e dê um nome para começar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Workspace</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Concurso INSS 2024"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Tipo de Workspace</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {workspaceTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all
                          ${isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${type.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{type.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/dashboard">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !selectedType}>
                {loading ? "Criando..." : "Criar Workspace"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
