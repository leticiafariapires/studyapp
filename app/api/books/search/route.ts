import { NextRequest, NextResponse } from 'next/server';

// Try to get cover from multiple sources
function getBestCover(book: any, isbn: string | null) {
  // Priority 1: Google Books with proper URL fixing
  if (book.imageLinks?.large) {
    return book.imageLinks.large.replace('http://', 'https://');
  }
  if (book.imageLinks?.medium) {
    return book.imageLinks.medium.replace('http://', 'https://');
  }
  if (book.imageLinks?.thumbnail) {
    // Remove zoom parameter and ensure https
    return book.imageLinks.thumbnail
      .replace('&zoom=1', '')
      .replace('zoom=1', '')
      .replace('http://', 'https://')
      .replace('&edge=curl', '');
  }
  if (book.imageLinks?.smallThumbnail) {
    return book.imageLinks.smallThumbnail.replace('http://', 'https://');
  }
  
  // Priority 2: Open Library by ISBN (direct URL, no check)
  if (isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }
  
  // Priority 3: Try with ISBN-10
  const isbn10 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
  if (isbn10) {
    return `https://covers.openlibrary.org/b/isbn/${isbn10}-L.jpg`;
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Google Books API search (removed language restriction for better results)
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=30&printType=books`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error('Google Books API error');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Format results with enhanced cover search (synchronous now)
    const results = data.items.slice(0, 10).map((item: any) => {
      const book = item.volumeInfo;
      const isbn13 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
      const isbn = isbn13 || isbn10;
      
      // Get best available cover
      const coverUrl = getBestCover(book, isbn);
      
      return {
        isbn: isbn || null,
        title: book.title || '',
        subtitle: book.subtitle || null,
        authors: book.authors || [],
        publisher: book.publisher || null,
        image: coverUrl,
        date_published: book.publishedDate || null,
        description: book.description || null,
        pageCount: book.pageCount || null,
      };
    });

    // Filter out duplicates by title
    const uniqueResults = results.filter((book: any, index: number, self: any[]) =>
      index === self.findIndex((b: any) => 
        b.title.toLowerCase() === book.title.toLowerCase() &&
        b.authors.join(',') === book.authors.join(',')
      )
    );

    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error('Book search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
