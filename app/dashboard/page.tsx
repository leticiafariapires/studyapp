import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, BookOpen, Dumbbell } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false });

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'concurso':
        return <Target className="w-8 h-8" />;
      case 'faculdade':
        return <BookOpen className="w-8 h-8" />;
      case 'taf':
        return <Dumbbell className="w-8 h-8" />;
      default:
        return <Target className="w-8 h-8" />;
    }
  };

  const getWorkspaceColor = (type: string) => {
    switch (type) {
      case 'concurso':
        return 'text-blue-600 dark:text-blue-400';
      case 'faculdade':
        return 'text-purple-600 dark:text-purple-400';
      case 'taf':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Workspaces</h1>
            <p className="text-muted-foreground">
              Gerencie seus estudos e treinos em diferentes ambientes
            </p>
          </div>
          <Link href="/workspaces/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Workspace
            </Button>
          </Link>
        </div>

        {!workspaces || workspaces.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>Nenhum workspace criado</CardTitle>
              <CardDescription>
                Comece criando seu primeiro workspace para organizar seus estudos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/workspaces/new">
                <Button size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Workspace
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`mb-4 ${getWorkspaceColor(workspace.type)}`}>
                      {getWorkspaceIcon(workspace.type)}
                    </div>
                    <CardTitle>{workspace.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {workspace.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Criado em {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
