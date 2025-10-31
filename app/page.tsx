import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Dumbbell, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Study Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Gerencie seus estudos para concursos, faculdade e treinos TAF em um só lugar
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Target className="w-12 h-12 mb-4 mx-auto text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Concursos</h3>
              <p className="text-sm text-muted-foreground">
                Organize matérias, questões e acompanhe seu desempenho
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <BookOpen className="w-12 h-12 mb-4 mx-auto text-purple-600" />
              <h3 className="text-lg font-semibold mb-2">Faculdade</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie leituras, resenhas e avaliações por matéria
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <Dumbbell className="w-12 h-12 mb-4 mx-auto text-green-600" />
              <h3 className="text-lg font-semibold mb-2">TAF</h3>
              <p className="text-sm text-muted-foreground">
                Registre treinos e acompanhe sua evolução física
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto">
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
