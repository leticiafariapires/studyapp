"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Target, 
  BookOpen, 
  Dumbbell, 
  CalendarDays, 
  Sparkles,
  Plus,
  Check
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  type: string;
}

export function WorkspaceSwitcher() {
  const router = useRouter();
  const params = useParams();
  const currentWorkspaceId = params.id as string;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, [currentWorkspaceId]);

  const loadWorkspaces = async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('workspaces')
      .select('id, name, type')
      .eq('owner_id', user.id)
      .eq('active', true)
      .order('name');

    if (data) {
      setWorkspaces(data);
      const current = data.find(w => w.id === currentWorkspaceId);
      setCurrentWorkspace(current || null);
    }
    
    setLoading(false);
  };

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'concurso':
        return <Target className="w-4 h-4" />;
      case 'faculdade':
        return <BookOpen className="w-4 h-4" />;
      case 'taf':
        return <Dumbbell className="w-4 h-4" />;
      case 'planner':
        return <CalendarDays className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
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
      case 'planner':
        return 'text-cyan-600 dark:text-cyan-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const createNewWorkspace = () => {
    router.push('/workspaces/new');
  };

  if (loading || !currentWorkspace) {
    return (
      <Button variant="outline" disabled size="sm">
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={getWorkspaceColor(currentWorkspace.type)}>
              {getWorkspaceIcon(currentWorkspace.type)}
            </span>
            <span className="truncate font-medium">
              {currentWorkspace.name}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
          Meus Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => switchWorkspace(workspace.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className={getWorkspaceColor(workspace.type)}>
              {getWorkspaceIcon(workspace.type)}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.id === currentWorkspaceId && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={createNewWorkspace}
          className="flex items-center gap-2 cursor-pointer text-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
