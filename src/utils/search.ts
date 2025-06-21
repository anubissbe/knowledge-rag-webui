/**
 * Highlights search terms in text by wrapping them in <mark> tags
 */
export function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create a regex that matches the query case-insensitively
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // Replace matches with highlighted version
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 text-inherit">$1</mark>');
}

/**
 * Extracts a snippet from text around the first match of the query
 */
export function extractSnippet(text: string, query: string, maxLength: number = 200): string {
  if (!query) return text.substring(0, maxLength) + '...';
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);
  
  if (matchIndex === -1) {
    return text.substring(0, maxLength) + '...';
  }
  
  // Calculate snippet boundaries
  const snippetStart = Math.max(0, matchIndex - 50);
  const snippetEnd = Math.min(text.length, matchIndex + query.length + 150);
  
  let snippet = text.substring(snippetStart, snippetEnd);
  
  // Add ellipsis if needed
  if (snippetStart > 0) snippet = '...' + snippet;
  if (snippetEnd < text.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Ranks search results based on relevance
 */
interface SearchableItem {
  title: string;
  content: string;
  tags: string[];
}

export function rankResults<T extends SearchableItem>(results: T[], query: string): (T & { score: number })[] {
  if (!query) return results.map(result => ({ ...result, score: 0 }));
  
  const lowerQuery = query.toLowerCase();
  
  return results.map(result => {
    let score = 0;
    
    // Title match (highest weight)
    if (result.title.toLowerCase().includes(lowerQuery)) {
      score += 10;
      if (result.title.toLowerCase().startsWith(lowerQuery)) {
        score += 5;
      }
    }
    
    // Content match
    if (result.content.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }
    
    // Tag match
    if (result.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) {
      score += 3;
    }
    
    return { ...result, score };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Parses advanced search syntax
 */
export function parseSearchQuery(query: string): {
  terms: string[];
  tags: string[];
  excludeTerms: string[];
  dateRange?: { from: Date; to: Date };
} {
  const result = {
    terms: [] as string[],
    tags: [] as string[],
    excludeTerms: [] as string[],
  };
  
  // Extract tags (e.g., tag:javascript)
  const tagRegex = /tag:(\S+)/g;
  let match;
  while ((match = tagRegex.exec(query)) !== null) {
    result.tags.push(match[1]);
  }
  
  // Extract excluded terms (e.g., -typescript)
  const excludeRegex = /-(\S+)/g;
  while ((match = excludeRegex.exec(query)) !== null) {
    result.excludeTerms.push(match[1]);
  }
  
  // Remove special syntax from query to get regular terms
  const cleanQuery = query
    .replace(tagRegex, '')
    .replace(excludeRegex, '')
    .trim();
  
  if (cleanQuery) {
    result.terms = cleanQuery.split(/\s+/);
  }
  
  return result;
}