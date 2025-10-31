import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string; subjectId: string };
}) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href={`/workspaces/${params.id}/faculty-subjects`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para matérias
          </Button>
        </Link>
        
        <nav className="flex space-x-4 border-b mb-6">
          <Link 
            href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}`}
            className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary text-muted-foreground hover:text-foreground"
          >
            Visão Geral
          </Link>
          <Link 
            href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/topics`}
            className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary text-muted-foreground hover:text-foreground"
          >
            Tópicos
          </Link>
          <Link 
            href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/readings`}
            className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary text-muted-foreground hover:text-foreground"
          >
            Leituras
          </Link>
          <Link 
            href={`/workspaces/${params.id}/faculty-subjects/${params.subjectId}/notes`}
            className="px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-primary text-muted-foreground hover:text-foreground"
          >
            Anotações
          </Link>
        </nav>
      </div>
      
      {children}
    </div>
  );
}
