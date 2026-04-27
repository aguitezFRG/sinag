'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  X,
  Clock,
  FileText,
  BookOpen,
  Workflow,
  Users,
  Calendar,
  ChevronDown,
  TrendingUp,
  History,
  Lightbulb,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  User,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

// =============================================================================
// TypeScript Interfaces
// =============================================================================

export interface SearchResult {
  _id: string;
  title: string;
  type: 'document' | 'guidance' | 'workflow' | 'user';
  excerpt: string;
  date: string;
  url: string;
  metadata: {
    category?: string;
    author?: string;
    fileType?: string;
    fileSize?: string;
    program?: string;
    status?: string;
    role?: string;
    department?: string;
    relevanceScore?: number;
    [key: string]: string | number | undefined;
  };
}

export interface SearchFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  category: string;
  author: string;
  sortBy: 'relevance' | 'date-newest' | 'date-oldest' | 'alphabetical';
}

// =============================================================================
// Mock Data
// =============================================================================

const mockSearchResults: SearchResult[] = [
  {
    _id: '1',
    title: 'Thesis Proposal Template - SESAM Format 2025',
    type: 'document',
    excerpt: 'Official thesis proposal template following SESAM guidelines. Includes sections for introduction, literature review, methodology, and expected outcomes. This template ensures compliance with UPLB graduate school requirements.',
    date: '2025-03-15',
    url: '/documents/thesis-proposal-template',
    metadata: {
      category: 'Templates',
      author: 'SESAM Graduate School',
      fileType: 'DOCX',
      fileSize: '245 KB',
      relevanceScore: 0.95,
    },
  },
  {
    _id: '2',
    title: 'IRB Ethics Review Application Guidelines',
    type: 'guidance',
    excerpt: 'Comprehensive guide for preparing your Institutional Review Board (IRB) ethics clearance application. Covers informed consent forms, risk assessment, and data protection protocols required for research involving human subjects.',
    date: '2025-02-20',
    url: '/guidance/irb-ethics-guidelines',
    metadata: {
      category: 'Research Ethics',
      author: 'UPLB Ethics Review Committee',
      program: 'All Programs',
      relevanceScore: 0.92,
    },
  },
  {
    _id: '3',
    title: 'M.S. Environmental Science Advising Workflow',
    type: 'workflow',
    excerpt: 'Complete workflow for M.S. in Environmental Science students from topic approval to final defense. Includes milestones for proposal defense, colloquium presentation, and manuscript preparation.',
    date: '2025-01-10',
    url: '/workflows/ms-environmental-science',
    metadata: {
      category: 'Program Workflows',
      program: 'M.S. Environmental Science',
      status: 'Active',
      relevanceScore: 0.88,
    },
  },
  {
    _id: '4',
    title: 'Dr. Maria Elena Rodriguez',
    type: 'user',
    excerpt: 'Associate Professor specializing in Climate Change Adaptation and Environmental Policy. Currently advising 5 graduate students. Research interests include sustainable development and community-based natural resource management.',
    date: '2024-12-05',
    url: '/advisers/maria-elena-rodriguez',
    metadata: {
      role: 'Associate Professor',
      department: 'Environmental Science',
      program: 'M.S. & Ph.D.',
      relevanceScore: 0.85,
    },
  },
  {
    _id: '5',
    title: 'Statistical Analysis Guide for Environmental Research',
    type: 'guidance',
    excerpt: 'Practical guide to statistical methods commonly used in environmental science research. Covers ANOVA, regression analysis, spatial statistics, and multivariate analysis with examples using R and SPSS.',
    date: '2025-03-01',
    url: '/guidance/statistical-analysis-guide',
    metadata: {
      category: 'Methodology',
      author: 'Dr. Jose Santos',
      program: 'All Programs',
      relevanceScore: 0.83,
    },
  },
  {
    _id: '6',
    title: 'Research Data Management Plan Template',
    type: 'document',
    excerpt: 'Template for creating a comprehensive data management plan for your thesis or dissertation. Includes sections on data collection, storage, sharing, and preservation following FAIR principles.',
    date: '2025-02-15',
    url: '/documents/data-management-template',
    metadata: {
      category: 'Templates',
      author: 'SESAM Library',
      fileType: 'PDF',
      fileSize: '128 KB',
      relevanceScore: 0.81,
    },
  },
  {
    _id: '7',
    title: 'Ph.D. Dissertation Defense Schedule - Spring 2026',
    type: 'workflow',
    excerpt: 'Schedule and requirements for Ph.D. dissertation defense. Includes deadlines for manuscript submission, committee formation, and public presentation requirements.',
    date: '2025-04-01',
    url: '/workflows/phd-defense-spring-2026',
    metadata: {
      category: 'Defense Preparation',
      program: 'Ph.D. Environmental Science',
      status: 'Active',
      relevanceScore: 0.78,
    },
  },
  {
    _id: '8',
    title: 'Dr. Ramon P. Santos',
    type: 'user',
    excerpt: 'Full Professor and Program Coordinator for M.S. Environmental Science. Expert in Biodiversity Conservation and Protected Area Management. Committee member for over 50 completed theses.',
    date: '2024-11-20',
    url: '/advisers/ramon-santos',
    metadata: {
      role: 'Full Professor',
      department: 'Environmental Science',
      program: 'M.S. & Ph.D.',
      relevanceScore: 0.76,
    },
  },
  {
    _id: '9',
    title: 'Literature Review Best Practices',
    type: 'guidance',
    excerpt: 'Guidelines for conducting a comprehensive literature review for environmental science research. Covers systematic review methodology, citation management with Zotero, and synthesis techniques.',
    date: '2025-01-25',
    url: '/guidance/literature-review-guide',
    metadata: {
      category: 'Research Writing',
      author: 'SESAM Writing Center',
      program: 'All Programs',
      relevanceScore: 0.74,
    },
  },
  {
    _id: '10',
    title: 'Conference Presentation Guidelines for SESAM Students',
    type: 'document',
    excerpt: 'Guidelines for presenting research at academic conferences. Includes poster design templates, oral presentation tips, and funding application procedures for conference travel.',
    date: '2025-03-10',
    url: '/documents/conference-presentation-guide',
    metadata: {
      category: 'Professional Development',
      author: 'SESAM Student Council',
      fileType: 'PDF',
      fileSize: '3.2 MB',
      relevanceScore: 0.72,
    },
  },
  {
    _id: '11',
    title: 'M.S. Thesis Defense Checklist',
    type: 'workflow',
    excerpt: 'Step-by-step checklist for preparing for your M.S. thesis defense. Covers administrative requirements, document submissions, committee coordination, and post-defense revisions.',
    date: '2025-02-28',
    url: '/workflows/thesis-defense-checklist',
    metadata: {
      category: 'Defense Preparation',
      program: 'M.S. Environmental Science',
      status: 'Active',
      relevanceScore: 0.70,
    },
  },
  {
    _id: '12',
    title: 'Maria Clara Dela Cruz',
    type: 'user',
    excerpt: 'M.S. Environmental Science student specializing in Coastal Resource Management. Currently in data collection phase with research on mangrove restoration in Batangas Province.',
    date: '2025-04-15',
    url: '/students/maria-clara-dela-cruz',
    metadata: {
      role: 'Graduate Student',
      department: 'Environmental Science',
      program: 'M.S. Environmental Science',
      status: 'Active Student',
      relevanceScore: 0.68,
    },
  },
];

const popularSearches = [
  'thesis proposal format',
  'IRB ethics clearance',
  'statistical analysis',
  'literature review',
  'defense preparation',
  'data collection methods',
  'graduation requirements',
  'adviser assignment',
];

const categories = [
  'All Categories',
  'Templates',
  'Research Ethics',
  'Methodology',
  'Research Writing',
  'Defense Preparation',
  'Professional Development',
  'Program Workflows',
];

const authors = [
  'All Authors',
  'SESAM Graduate School',
  'UPLB Ethics Review Committee',
  'Dr. Maria Elena Rodriguez',
  'Dr. Jose Santos',
  'SESAM Library',
  'SESAM Writing Center',
  'SESAM Student Council',
];

// =============================================================================
// Helper Components
// =============================================================================

function TypeIcon({ type }: { type: SearchResult['type'] }) {
  const icons = {
    document: <FileText className="w-4 h-4" />,
    guidance: <BookOpen className="w-4 h-4" />,
    workflow: <Workflow className="w-4 h-4" />,
    user: <User className="w-4 h-4" />,
  };

  const colors = {
    document: 'bg-blue-100 text-blue-700 border-blue-200',
    guidance: 'bg-purple-100 text-purple-700 border-purple-200',
    workflow: 'bg-green-100 text-green-700 border-green-200',
    user: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const labels = {
    document: 'Document',
    guidance: 'Guidance',
    workflow: 'Workflow',
    user: 'User',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[type]}`}>
      {icons[type]}
      {labels[type]}
    </span>
  );
}

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// =============================================================================
// Main Component
// =============================================================================

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'document' | 'guidance' | 'workflow' | 'user'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    category: 'All Categories',
    author: 'All Authors',
    sortBy: 'relevance',
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sinag_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches((prev) => {
      const updated = [searchQuery, ...prev.filter((s) => s !== searchQuery)].slice(0, 8);
      localStorage.setItem('sinag_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Filter mock results based on query
    const filtered = mockSearchResults.filter(
      (result) =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.metadata.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.metadata.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
    setIsLoading(false);
    saveRecentSearch(searchQuery);
  }, [saveRecentSearch]);

  // Initial search if query is in URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Update URL
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    router.push(`/search?${params.toString()}`, { scroll: false });
    
    performSearch(query);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    router.push('/search', { scroll: false });
  };

  // Apply filters to results
  const filteredResults = results.filter((result) => {
    // Type filter
    if (activeTab !== 'all' && result.type !== activeTab) return false;

    // Category filter
    if (filters.category !== 'All Categories' && result.metadata.category !== filters.category) {
      return false;
    }

    // Author filter
    if (filters.author !== 'All Authors' && result.metadata.author !== filters.author) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const resultDate = new Date(result.date);
      const now = new Date();
      const diffTime = now.getTime() - resultDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
        case 'year':
          if (diffDays > 365) return false;
          break;
      }
    }

    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (filters.sortBy) {
      case 'relevance':
        return (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0);
      case 'date-newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Tab counts
  const tabCounts = {
    all: results.length,
    document: results.filter((r) => r.type === 'document').length,
    guidance: results.filter((r) => r.type === 'guidance').length,
    workflow: results.filter((r) => r.type === 'workflow').length,
    user: results.filter((r) => r.type === 'user').length,
  };

  // Filtered counts
  const filteredTabCounts = {
    all: filteredResults.length,
    document: filteredResults.filter((r) => r.type === 'document').length,
    guidance: filteredResults.filter((r) => r.type === 'guidance').length,
    workflow: filteredResults.filter((r) => r.type === 'workflow').length,
    user: filteredResults.filter((r) => r.type === 'user').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Search across documents, guidance, and workflows
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for documents, guidance, workflows, or people..."
                className="w-full pl-12 pr-24 py-4 text-base sm:text-lg bg-white border-2 border-gray-300 rounded-xl focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20 outline-none transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-24 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 px-6 py-2.5 bg-[#0C0B5D] text-white font-semibold rounded-lg hover:bg-[#0a0a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Filter Tabs */}
          {hasSearched && results.length > 0 && (
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
              {(
                [
                  { id: 'all', label: 'All', icon: Sparkles },
                  { id: 'document', label: 'Documents', icon: FileText },
                  { id: 'guidance', label: 'Guidance', icon: BookOpen },
                  { id: 'workflow', label: 'Workflows', icon: Workflow },
                  { id: 'user', label: 'Users', icon: Users },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#0C0B5D] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {tabCounts[tab.id]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {hasSearched && results.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-32">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  <button
                    onClick={() =>
                      setFilters({
                        dateRange: 'all',
                        category: 'All Categories',
                        author: 'All Authors',
                        sortBy: 'relevance',
                      })
                    }
                    className="text-xs text-[#0C0B5D] hover:underline"
                  >
                    Reset
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="relative">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date-newest">Date (Newest)</option>
                      <option value="date-oldest">Date (Oldest)</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Date Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Time' },
                      { value: 'today', label: 'Today' },
                      { value: 'week', label: 'This Week' },
                      { value: 'month', label: 'This Month' },
                      { value: 'year', label: 'This Year' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="dateRange"
                          value={option.value}
                          checked={filters.dateRange === option.value}
                          onChange={(e) =>
                            setFilters({ ...filters, dateRange: e.target.value as SearchFilters['dateRange'] })
                          }
                          className="w-4 h-4 text-[#0C0B5D] border-gray-300 focus:ring-[#0C0B5D]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Author Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author
                  </label>
                  <select
                    value={filters.author}
                    onChange={(e) =>
                      setFilters({ ...filters, author: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#0C0B5D] focus:ring-2 focus:ring-[#0C0B5D]/20 outline-none"
                  >
                    {authors.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </aside>
          )}

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            {hasSearched && results.length > 0 && (
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filters & Sort
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Filters Panel */}
                {showFilters && (
                  <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="date-newest">Date (Newest)</option>
                        <option value="date-oldest">Date (Oldest)</option>
                        <option value="alphabetical">Alphabetical</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={filters.category}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <select
                          value={filters.dateRange}
                          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as SearchFilters['dateRange'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="all">All Time</option>
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="year">This Year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Count */}
            {hasSearched && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {isLoading ? (
                    'Searching...'
                  ) : (
                    <>
                      Showing <span className="font-semibold text-gray-900">{sortedResults.length}</span> results
                      {query && (
                        <>
                          {' '}for <span className="font-semibold text-gray-900">&ldquo;{query}&rdquo;</span>
                        </>
                      )}
                    </>
                  )}
                </p>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => setActiveTab('all')}
                    className="text-sm text-[#0C0B5D] hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}

            {/* Results List */}
            {isLoading ? (
              // Loading State
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearched && sortedResults.length > 0 ? (
              // Results Found
              <div className="space-y-4">
                {sortedResults.map((result) => (
                  <Link
                    key={result._id}
                    href={result.url}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0C0B5D]/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className="flex-shrink-0">
                        <TypeIcon type={result.type} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0C0B5D] transition-colors line-clamp-1">
                            {result.title}
                          </h3>
                          <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {result.excerpt}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {getRelativeDate(result.date)}
                          </span>
                          
                          {result.metadata.author && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              {result.metadata.author}
                            </span>
                          )}
                          
                          {result.metadata.category && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                {result.metadata.category}
                              </span>
                            </span>
                          )}

                          {result.metadata.fileType && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              {result.metadata.fileType} • {result.metadata.fileSize}
                            </span>
                          )}

                          {result.metadata.role && (
                            <span className="flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full" />
                              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                {result.metadata.role}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : hasSearched && sortedResults.length === 0 ? (
              // No Results State
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try adjusting your search terms or filters.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setFilters({
                        dateRange: 'all',
                        category: 'All Categories',
                        author: 'All Authors',
                        sortBy: 'relevance',
                      });
                      setActiveTab('all');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[#0C0B5D] border border-[#0C0B5D] rounded-lg hover:bg-[#0C0B5D]/5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear filters
                  </button>
                  <button
                    onClick={clearSearch}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg hover:bg-[#0a0a4a] transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    New search
                  </button>
                </div>

                {/* Suggestions */}
                <div className="mt-8 text-left max-w-md mx-auto">
                  <p className="text-sm font-medium text-gray-700 mb-3">Try searching for:</p>
                  <div className="flex flex-wrap gap-2">
                    {['thesis template', 'IRB forms', 'adviser list', 'defense schedule', 'research methods'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion);
                          performSearch(suggestion);
                          router.push(`/search?q=${encodeURIComponent(suggestion)}`, { scroll: false });
                        }}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Initial State - Recent & Popular Searches
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-[#0C0B5D]" />
                      Recent Searches
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search);
                            performSearch(search);
                            router.push(`/search?q=${encodeURIComponent(search)}`, { scroll: false });
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="flex-1 text-gray-700 group-hover:text-gray-900">{search}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('sinag_recent_searches');
                      }}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear history
                    </button>
                  </div>
                )}

                {/* Popular Searches */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#0C0B5D]" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => {
                          setQuery(search);
                          performSearch(search);
                          router.push(`/search?q=${encodeURIComponent(search)}`, { scroll: false });
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-[#0C0B5D]/10 hover:text-[#0C0B5D] transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Access Categories */}
                <div className="md:col-span-2 bg-gradient-to-r from-[#0C0B5D]/5 to-[#0C0B5D]/10 rounded-xl border border-[#0C0B5D]/20 p-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-[#0C0B5D]" />
                    Quick Access
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Templates', icon: FileText, color: 'bg-blue-100 text-blue-700', href: '#' },
                      { label: 'Guidance Library', icon: BookOpen, color: 'bg-purple-100 text-purple-700', href: '#' },
                      { label: 'Active Workflows', icon: Workflow, color: 'bg-green-100 text-green-700', href: '#' },
                      { label: 'Adviser Directory', icon: Users, color: 'bg-orange-100 text-orange-700', href: '#' },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#0C0B5D]/30 transition-all group"
                      >
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#0C0B5D]">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
