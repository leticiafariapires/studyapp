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
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, BookOpen, Search, Star, Pencil, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Reading {
  id: string;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  cover_url: string | null;
  stars: number | null;
  review: string | null;
  date_published: string | null;
  read_date: string | null;
  status: string | null;
}

export default function ReadingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchingISBN, setSearchingISBN] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [viewingReading, setViewingReading] = useState<Reading | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string>("");
  
  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    cover_url: "",
    stars: 0,
    review: "",
    date_published: "",
    read_date: "",
    status: "quero_ler",
  });

  useEffect(() => {
    loadReadings();
  }, [workspaceId]);

  const loadReadings = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading readings:', error);
      // Check if error is about missing status column
      if (error.message?.includes('column') && error.message?.includes('status')) {
        alert('AVISO: A coluna "status" não existe no banco de dados.\n\nPor favor, execute a migração 002_add_reading_fields.sql no Supabase SQL Editor.');
      }
      setReadings([]);
    } else if (data) {
      // Use the actual saved status from database, only default if truly missing
      const readingsWithStatus = data.map(reading => {
        const status = reading.status ?? 'quero_ler'; // Only default if null/undefined
        console.log(`Loaded reading: ${reading.title} - Status: ${status} (original: ${reading.status})`);
        return {
          ...reading,
          status: status // Keep the saved status from database
        };
      });
      console.log('All loaded readings with status:', readingsWithStatus.map(r => ({ title: r.title, status: r.status })));
      setReadings(readingsWithStatus);
    }
    setLoading(false);
  };

  const searchISBN = async () => {
    if (!formData.isbn.trim()) return;
    
    setSearchingISBN(true);
    try {
      const response = await fetch(`/api/isbn/lookup?isbn=${formData.isbn}`);
      if (response.ok) {
        const bookData = await response.json();
        setFormData({
          ...formData,
          title: bookData.title || "",
          author: bookData.authors?.join(", ") || "",
          publisher: bookData.publisher || "",
          cover_url: bookData.image || "",
          date_published: bookData.date_published || "",
        });
      } else {
        alert("Livro não encontrado. Preencha manualmente.");
      }
    } catch (error) {
      alert("Erro ao buscar ISBN. Preencha manualmente.");
    }
    setSearchingISBN(false);
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchingISBN(true);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } else {
        alert("Erro ao buscar livros.");
      }
    } catch (error) {
      alert("Erro ao buscar livros.");
    }
    setSearchingISBN(false);
  };

  const selectBook = (book: any) => {
    setFormData({
      ...formData,
      isbn: book.isbn || "",
      title: book.title || "",
      author: book.authors?.join(", ") || "",
      publisher: book.publisher || "",
      cover_url: book.image || "",
      date_published: book.date_published || "",
    });
    setShowResults(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supabase = createClient();
    setFormError("");
    
    try {
      if (editingReading) {
        // Update - ensure status is always included
        const updateData: any = {
          isbn: formData.isbn || null,
          title: formData.title,
          author: formData.author || null,
          publisher: formData.publisher || null,
          cover_url: formData.cover_url || null,
          stars: formData.stars || null,
          review: formData.review || null,
          date_published: formData.date_published || null,
          read_date: formData.read_date || null,
          status: formData.status || "quero_ler", // Always include status
        };

        console.log('Updating reading with status:', updateData.status);
        const { error, data } = await supabase
          .from('readings')
          .update(updateData)
          .eq('id', editingReading.id)
          .select(); // Select to verify update

        if (error) {
          console.error('Update error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          // Retry without new fields if migration not applied
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes('column') && (msg.includes('status') || msg.includes('read_date'))) {
            // Remove status and read_date if columns don't exist
            delete updateData.status;
            delete updateData.read_date;
            
            const retry = await supabase
              .from('readings')
              .update(updateData)
              .eq('id', editingReading.id)
              .select();
            
            if (retry.error) {
              setFormError("Falha ao salvar a leitura: " + retry.error.message);
              console.error('Retry error:', retry.error);
              return;
            } else {
              setFormError("AVISO: A coluna 'status' não existe no banco. Execute a migração 002_add_reading_fields.sql no Supabase.");
            }
          } else {
            setFormError("Falha ao salvar a leitura: " + error.message);
            console.error('Update error:', error);
            return;
          }
        } else {
          console.log('Reading updated successfully:', data);
          console.log('Updated status:', data?.[0]?.status);
        }
      } else {
        // Insert
        const { error } = await supabase
          .from('readings')
          .insert({
            workspace_id: workspaceId,
            isbn: formData.isbn || null,
            title: formData.title,
            author: formData.author || null,
            publisher: formData.publisher || null,
            cover_url: formData.cover_url || null,
            stars: formData.stars || null,
            review: formData.review || null,
            date_published: formData.date_published || null,
            read_date: formData.read_date || null,
            status: formData.status,
          });

        if (error) {
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes('column') && (msg.includes('status') || msg.includes('read_date'))) {
            const retry = await supabase
              .from('readings')
              .insert({
                workspace_id: workspaceId,
                isbn: formData.isbn || null,
                title: formData.title,
                author: formData.author || null,
                publisher: formData.publisher || null,
                cover_url: formData.cover_url || null,
                stars: formData.stars || null,
                review: formData.review || null,
                date_published: formData.date_published || null,
              });
            if (retry.error) {
              setFormError("Falha ao adicionar a leitura: " + retry.error.message);
              return;
            }
          } else {
            setFormError("Falha ao adicionar a leitura: " + error.message);
            return;
          }
        }
      }
    } catch (err: any) {
      setFormError("Erro inesperado ao salvar.");
      return;
    }

    setDialogOpen(false);
    setEditingReading(null);
    setFormData({
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      cover_url: "",
      stars: 0,
      review: "",
      date_published: "",
      read_date: "",
      status: "quero_ler",
    });
    loadReadings();
  };

  const handleEdit = (reading: Reading) => {
    setEditingReading(reading);
    // Ensure status is loaded correctly - use the actual saved status
    const savedStatus = reading.status || "quero_ler";
    setFormData({
      isbn: reading.isbn || "",
      title: reading.title,
      author: reading.author || "",
      publisher: reading.publisher || "",
      cover_url: reading.cover_url || "",
      stars: reading.stars || 0,
      review: reading.review || "",
      date_published: reading.date_published || "",
      read_date: reading.read_date || "",
      status: savedStatus, // Use the actual saved status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta leitura?")) return;
    
    const supabase = createClient();
    await supabase.from('readings').delete().eq('id', id);
    loadReadings();
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
            <h1 className="text-3xl font-bold">Leituras</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingReading(null);
                setFormData({
                  isbn: "",
                  title: "",
                  author: "",
                  publisher: "",
                  cover_url: "",
                  stars: 0,
                  review: "",
                  date_published: "",
                  read_date: "",
                  status: "quero_ler",
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Leitura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingReading ? "Editar Leitura" : "Nova Leitura"}</DialogTitle>
                  <DialogDescription>
                    {editingReading ? "Atualize os dados da leitura" : "Busque por nome, autor ou ISBN"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
                      {formError}
                    </div>
                  )}
                  {/* Search by name/author */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar Livro</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Digite o nome do livro ou autor..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchBooks())}
                      />
                      <Button
                        type="button"
                        onClick={searchBooks}
                        disabled={searchingISBN || !searchQuery.trim()}
                      >
                        {searchingISBN ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Search Results */}
                  {showResults && searchResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                      {searchResults.map((book, index) => (
                        <div
                          key={index}
                          onClick={() => selectBook(book)}
                          className="flex gap-3 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                        >
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                            {book.authors.length > 0 && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {book.authors.join(", ")}
                              </p>
                            )}
                            {book.date_published && (
                              <p className="text-xs text-muted-foreground">{book.date_published}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showResults && searchResults.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Nenhum livro encontrado. Tente outro termo ou preencha manualmente.
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou busque por ISBN
                      </span>
                    </div>
                  </div>

                  {/* ISBN Search */}
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                        placeholder="978-0-123456-78-9"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={searchISBN}
                        disabled={searchingISBN || !formData.isbn}
                      >
                        {searchingISBN ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <><Search className="w-4 h-4 mr-2" /> Buscar</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou preencha manualmente
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Autor(es)</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publisher">Editora</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_published">Data de Publicação</Label>
                    <Input
                      id="date_published"
                      value={formData.date_published}
                      onChange={(e) => setFormData({ ...formData, date_published: e.target.value })}
                      placeholder="2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_url">URL da Capa (opcional)</Label>
                    <Input
                      id="cover_url"
                      value={formData.cover_url || ''}
                      onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                      placeholder="https://example.com/cover.jpg"
                      type="url"
                    />
                    <p className="text-xs text-gray-500">
                      Cole o link direto da imagem da capa do livro
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Avaliação</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, stars: star })}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => {
                        console.log('Status changed to:', value);
                        setFormData({ ...formData, status: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status">
                          {formData.status === 'lendo' ? '📖 Lendo' : 
                           formData.status === 'lido' ? '✅ Já Lido' : 
                           '📚 Quero Ler'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quero_ler">📚 Quero Ler</SelectItem>
                        <SelectItem value="lendo">📖 Lendo</SelectItem>
                        <SelectItem value="lido">✅ Já Lido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="read_date">Data de Leitura (opcional)</Label>
                    <Input
                      id="read_date"
                      type="date"
                      value={formData.read_date}
                      onChange={(e) => setFormData({ ...formData, read_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review">Resenha/Comentários</Label>
                    <Textarea
                      id="review"
                      value={formData.review}
                      onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingReading ? "Salvar Alterações" : "Adicionar Leitura"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {readings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nenhuma leitura registrada ainda
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Leitura
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Organize books by status - use actual saved status */}
            {['lendo', 'quero_ler', 'lido'].map((statusFilter) => {
              // Filter by actual saved status from database
              const filteredReadings = readings.filter(r => {
                const actualStatus = r.status ?? 'quero_ler'; // Use nullish coalescing
                return actualStatus === statusFilter;
              });
              
              if (filteredReadings.length === 0) return null;

              const getStatusLabel = (status: string) => {
                switch (status) {
                  case 'lendo':
                    return '📖 Lendo';
                  case 'lido':
                    return '✅ Já Lido';
                  default:
                    return '📚 Quero Ler';
                }
              };

              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'lendo':
                    return 'bg-blue-500';
                  case 'lido':
                    return 'bg-green-500';
                  default:
                    return 'bg-gray-400';
                }
              };

              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'lendo':
                    return '📖';
                  case 'lido':
                    return '✅';
                  default:
                    return '📚';
                }
              };

              return (
                <div key={statusFilter} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{getStatusLabel(statusFilter)}</h2>
                    <Badge variant="secondary" className="text-sm">
                      {filteredReadings.length} {filteredReadings.length === 1 ? 'livro' : 'livros'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {filteredReadings.map((reading) => {
                      const status = reading.status || 'quero_ler';

                      return (
                        <div key={reading.id} className="group relative">
                          {/* Book Cover */}
                          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                            {reading.cover_url ? (
                              <img
                                src={reading.cover_url}
                                alt={reading.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                                        <svg class="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 font-medium">${reading.title}</p>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                                <BookOpen className="w-16 h-16 text-gray-400 mb-2" />
                                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 font-medium">
                                  {reading.title}
                                </p>
                              </div>
                            )}
                            
                            {/* Status Badge - Always visible */}
                            <div className={`absolute top-2 left-2 z-10 ${getStatusColor(status)} rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg border-2 border-white dark:border-gray-800`}>
                              {getStatusIcon(status)}
                            </div>

                            {/* Stars Badge */}
                            {reading.stars && reading.stars > 0 && (
                              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-white font-semibold">{reading.stars}</span>
                              </div>
                            )}

                            {/* Hover Overlay with Actions */}
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                              <h3 className="text-white font-semibold text-sm text-center line-clamp-2 mb-2">
                                {reading.title}
                              </h3>
                              {reading.author && (
                                <p className="text-gray-300 text-xs text-center line-clamp-2 mb-2">
                                  {reading.author}
                                </p>
                              )}
                              {reading.read_date && (
                                <p className="text-gray-400 text-xs">
                                  📅 {new Date(reading.read_date).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              <div className="flex flex-col gap-2 mt-2 w-full">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => {
                                    setViewingReading(reading);
                                    setViewDialogOpen(true);
                                  }}
                                  className="h-8 w-full"
                                >
                                  Ver Detalhes
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleEdit(reading)}
                                    className="h-8 flex-1"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(reading.id)}
                                    className="h-8 flex-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Title below (always visible) */}
                          <div className="mt-2 px-1">
                            <p className="text-xs font-medium line-clamp-2 text-center">
                              {reading.title}
                            </p>
                            {reading.author && (
                              <p className="text-xs text-muted-foreground line-clamp-1 text-center mt-1">
                                {reading.author}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dialog de Visualização do Livro */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewingReading && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{viewingReading.title}</DialogTitle>
                  <DialogDescription>
                    {viewingReading.author && <span className="text-base">por {viewingReading.author}</span>}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6 py-4">
                  {/* Capa do Livro */}
                  <div className="md:col-span-1">
                    {viewingReading.cover_url ? (
                      <img
                        src={viewingReading.cover_url}
                        alt={viewingReading.title}
                        className="w-full rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    {/* Avaliação */}
                    {viewingReading.stars && viewingReading.stars > 0 && (
                      <div className="mt-4 flex items-center justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= viewingReading.stars!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Detalhes do Livro */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">Informações</h3>
                      <div className="space-y-2 text-sm">
                        {viewingReading.author && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Autor:</span>
                            <span className="font-medium">{viewingReading.author}</span>
                          </div>
                        )}
                        {viewingReading.publisher && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Editora:</span>
                            <span className="font-medium">{viewingReading.publisher}</span>
                          </div>
                        )}
                        {viewingReading.date_published && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Publicado em:</span>
                            <span className="font-medium">
                              {new Date(viewingReading.date_published).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {viewingReading.read_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lido em:</span>
                            <span className="font-medium">
                              {new Date(viewingReading.read_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {viewingReading.isbn && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">ISBN:</span>
                            <span className="font-medium font-mono text-xs">{viewingReading.isbn}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="secondary">
                            {(viewingReading.status || 'quero_ler') === 'lido' && '✅ Lido'}
                            {(viewingReading.status || 'quero_ler') === 'lendo' && '📖 Lendo'}
                            {(viewingReading.status || 'quero_ler') === 'quero_ler' && '📚 Quero Ler'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Resenha */}
                    {viewingReading.review && (
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-2">Minha Resenha</h3>
                        <div className="bg-muted/50 rounded-lg p-4 text-sm">
                          <p className="whitespace-pre-wrap">{viewingReading.review}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(viewingReading);
                  }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
