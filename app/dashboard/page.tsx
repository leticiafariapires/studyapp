'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, BookOpen, Dumbbell } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        // Fetch workspaces
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', session.user.id)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (workspacesError) {
          throw workspacesError;
        }

        setWorkspaces(workspacesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link href="/workspaces/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">No workspaces found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first workspace to get started</p>
          <Link href="/workspaces/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{workspace.name}</CardTitle>
                  <div className={getWorkspaceColor(workspace.type)}>
                    {getWorkspaceIcon(workspace.type)}
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {workspace.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Created on {new Date(workspace.created_at).toLocaleDateString()}</span>
                  <Link href={`/workspaces/${workspace.id}`} className="text-blue-600 hover:underline">
                    View details
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
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
