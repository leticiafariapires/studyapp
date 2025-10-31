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

// Search Google Books API with improved search for Brazilian publishers
async function searchGoogleBooks(query: string) {
  try {
    // Try multiple search strategies for better coverage
    const searchQueries = [
      // Standard search
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=30&printType=books`,
      // Search with inauthor (for academic books)
      `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(query)}&maxResults=20&printType=books`,
      // Search with inpublisher (for specific publishers like Manole)
      `https://www.googleapis.com/books/v1/volumes?q=inpublisher:"${encodeURIComponent(query)}"&maxResults=20&printType=books`,
      // Search for Brazilian publishers
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}+manole&maxResults=20&printType=books`,
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}+editora&maxResults=20&printType=books`,
    ];

    const results = await Promise.allSettled(
      searchQueries.map(url =>
        fetch(url, { next: { revalidate: 3600 } })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    );

    let allItems: any[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value?.items) {
        allItems = [...allItems, ...result.value.items];
      }
    }

    if (allItems.length === 0) return [];

    // Remove duplicates by ISBN
    const uniqueItems = allItems.filter((item: any, index: number, self: any[]) => {
      const book = item.volumeInfo;
      const isbn13 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
      const isbn = isbn13 || isbn10;
      
      if (!isbn) return true; // Keep items without ISBN
      
      return index === self.findIndex((i: any) => {
        const iBook = i.volumeInfo;
        const iIsbn13 = iBook.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
        const iIsbn10 = iBook.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
        const iIsbn = iIsbn13 || iIsbn10;
        return iIsbn === isbn;
      });
    });

    return uniqueItems.slice(0, 40).map((item: any) => {
      const book = item.volumeInfo;
      const isbn13 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = book.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
      const isbn = isbn13 || isbn10;
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
        source: 'Google Books',
      };
    });
  } catch (error) {
    console.error('Google Books search error:', error);
    return [];
  }
}

// Search Open Library API (complementary to ISBN lookup)
// Enhanced search for academic and old books
async function searchOpenLibrary(query: string) {
  try {
    // Try multiple search strategies for better coverage of academic and old books
    const searchQueries = [
      // Standard search
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=15&fields=title,author_name,isbn,first_publish_year,publisher,cover_i,edition_key`,
      // Search by author (for academic books)
      `https://openlibrary.org/search.json?author=${encodeURIComponent(query)}&limit=10&fields=title,author_name,isbn,first_publish_year,publisher,cover_i,edition_key`,
      // Search in title only (more precise)
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10&fields=title,author_name,isbn,first_publish_year,publisher,cover_i,edition_key`,
    ];

    const results = await Promise.allSettled(
      searchQueries.map(url => 
        fetch(url, { next: { revalidate: 3600 } })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
    );

    let allDocs: any[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value?.docs) {
        allDocs = [...allDocs, ...result.value.docs];
      }
    }

    if (allDocs.length === 0) return [];

    // Remove duplicates by title + author
    const uniqueDocs = allDocs.filter((doc: any, index: number, self: any[]) => {
      const title = (doc.title || '').toLowerCase().trim();
      const authors = (Array.isArray(doc.author_name) ? doc.author_name : (doc.author_name ? [doc.author_name] : [])).map((a: string) => a.toLowerCase().trim()).join(',');
      
      return index === self.findIndex((d: any) => {
        const dTitle = (d.title || '').toLowerCase().trim();
        const dAuthors = (Array.isArray(d.author_name) ? d.author_name : (d.author_name ? [d.author_name] : [])).map((a: string) => a.toLowerCase().trim()).join(',');
        return dTitle === title && dAuthors === authors;
      });
    });

    return uniqueDocs.slice(0, 20).map((doc: any) => {
      const isbn = Array.isArray(doc.isbn) ? (doc.isbn[0] || null) : (doc.isbn || null);
      const coverUrl = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null);
      
      return {
        isbn: isbn,
        title: doc.title || '',
        subtitle: null,
        authors: Array.isArray(doc.author_name) ? doc.author_name : (doc.author_name ? [doc.author_name] : []),
        publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : (doc.publisher || null),
        image: coverUrl,
        date_published: doc.first_publish_year?.toString() || null,
        description: null,
        pageCount: null,
        source: 'Open Library',
      };
    });
  } catch (error) {
    console.error('Open Library search error:', error);
    return [];
  }
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
    // Search multiple APIs in parallel for better coverage
    const [googleResults, openLibraryResults] = await Promise.all([
      searchGoogleBooks(query),
      searchOpenLibrary(query),
    ]);

    // Combine results from all sources
    let allResults = [...googleResults, ...openLibraryResults];

    // Remove duplicates by title and authors (case-insensitive)
    const uniqueResults = allResults.filter((book: any, index: number, self: any[]) => {
      const normalizedTitle = book.title?.toLowerCase().trim() || '';
      const normalizedAuthors = book.authors?.map((a: string) => a.toLowerCase().trim()).join(',') || '';
      
      return index === self.findIndex((b: any) => {
        const bTitle = b.title?.toLowerCase().trim() || '';
        const bAuthors = b.authors?.map((a: string) => a.toLowerCase().trim()).join(',') || '';
        return bTitle === normalizedTitle && bAuthors === normalizedAuthors;
      });
    });

    // Limit to 50 results total (increased for better coverage, especially Brazilian books)
    const limitedResults = uniqueResults.slice(0, 50);

    // Sort by relevance (prefer books with covers, ISBNs, and Brazilian publishers like Manole)
    limitedResults.sort((a: any, b: any) => {
      const publisherA = (a.publisher || '').toLowerCase();
      const publisherB = (b.publisher || '').toLowerCase();
      
      const aScore = (a.image ? 2 : 0) + 
                    (a.isbn ? 1 : 0) + 
                    (publisherA.includes('manole') ? 5 : 0) +
                    (publisherA.includes('editora') ? 2 : 0) +
                    (publisherA.includes('brasil') || publisherA.includes('brazil') ? 1 : 0);
      
      const bScore = (b.image ? 2 : 0) + 
                    (b.isbn ? 1 : 0) +
                    (publisherB.includes('manole') ? 5 : 0) +
                    (publisherB.includes('editora') ? 2 : 0) +
                    (publisherB.includes('brasil') || publisherB.includes('brazil') ? 1 : 0);
      
      return bScore - aScore;
    });

    return NextResponse.json({ results: limitedResults });
  } catch (error) {
    console.error('Book search error:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}
