import { NextRequest, NextResponse } from 'next/server';

// Normalize ISBN (remove hyphens and spaces)
function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

// Get Open Library cover URL directly
function getOpenLibraryCover(isbn: string) {
  if (!isbn) return null;
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

// Try Google Books API (FREE, no limit, good coverage)
async function tryGoogleBooks(isbn: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    const book = data.items[0].volumeInfo;
    
    // Try to get best quality image
    let image = book.imageLinks?.large?.replace('http://', 'https://') || 
                book.imageLinks?.medium?.replace('http://', 'https://') || 
                book.imageLinks?.thumbnail?.replace('&zoom=1', '').replace('http://', 'https://').replace('&edge=curl', '') ||
                book.imageLinks?.smallThumbnail?.replace('http://', 'https://');
    
    // If no image from Google, try Open Library
    if (!image) {
      image = getOpenLibraryCover(isbn);
    }
    
    return {
      isbn: isbn,
      title: book.title,
      authors: book.authors || [],
      publisher: book.publisher || null,
      image,
      date_published: book.publishedDate || null,
      source: 'Google Books',
    };
  } catch (error) {
    console.error('Google Books error:', error);
    return null;
  }
}

// Try Open Library API (FREE, no limit, good for older books)
async function tryOpenLibrary(isbn: string) {
  try {
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const bookKey = `ISBN:${isbn}`;
    
    if (!data[bookKey]) return null;

    const book = data[bookKey];
    
    // Try to get cover from multiple sources
    let image = book.cover?.large || book.cover?.medium || book.cover?.small;
    
    // If no image, try direct Open Library covers API
    if (!image) {
      image = getOpenLibraryCover(isbn);
    }
    
    return {
      isbn: isbn,
      title: book.title,
      authors: book.authors?.map((a: any) => a.name) || [],
      publisher: book.publishers?.[0]?.name || null,
      image,
      date_published: book.publish_date || null,
      source: 'Open Library',
    };
  } catch (error) {
    console.error('Open Library error:', error);
    return null;
  }
}

// Try ISBNdb API (if configured - backup option)
async function tryISBNdb(isbn: string) {
  const apiKey = process.env.ISBNDB_API_KEY;
  if (!apiKey || apiKey === 'SUA-API-KEY-AQUI') return null;

  try {
    const response = await fetch(`https://api2.isbndb.com/book/${isbn}`, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const book = data.book;

    return {
      isbn: book.isbn13 || book.isbn,
      title: book.title,
      authors: book.authors || [],
      publisher: book.publisher,
      image: book.image,
      date_published: book.date_published,
      source: 'ISBNdb',
    };
  } catch (error) {
    console.error('ISBNdb error:', error);
    return null;
  }
}

// Main API route
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return NextResponse.json(
      { error: 'ISBN parameter is required' },
      { status: 400 }
    );
  }

  const normalizedISBN = normalizeISBN(isbn);

  // Try multiple sources in order
  // Google Books first (best free API)
  let bookData = await tryGoogleBooks(normalizedISBN);
  
  // If not found, try Open Library
  if (!bookData) {
    bookData = await tryOpenLibrary(normalizedISBN);
  }

  // If still not found and ISBNdb is configured, try it
  if (!bookData) {
    bookData = await tryISBNdb(normalizedISBN);
  }

  // If no source found the book
  if (!bookData) {
    return NextResponse.json(
      { error: 'Book not found in any source' },
      { status: 404 }
    );
  }

  return NextResponse.json(bookData);
}
