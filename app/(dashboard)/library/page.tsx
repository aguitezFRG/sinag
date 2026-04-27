'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  FileText,
  Download,
  Filter,
  File,
  FileSpreadsheet,
  Clock,
  TrendingUp,
  Tag,
  ChevronRight,
  Book,
  Scale,
  Shield,
  GraduationCap,
  ScrollText,
  FolderOpen,
  X
} from 'lucide-react';

// TypeScript Interface for Guidance Resource
interface GuidanceResource {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: 'pdf' | 'doc' | 'template' | 'xlsx';
  tags: string[];
  downloadCount: number;
  createdAt: string;
  fileUrl: string;
}

// Mock data for demonstration
const mockResources: GuidanceResource[] = [
  {
    _id: '1',
    title: 'SESAM Thesis Formatting Guidelines',
    description: 'Comprehensive formatting requirements for thesis and dissertation manuscripts including margins, fonts, spacing, and citation styles aligned with JESAM publication standards.',
    category: 'Thesis Guidelines',
    type: 'pdf',
    tags: ['formatting', 'thesis', 'manuscript', 'JESAM'],
    downloadCount: 1247,
    createdAt: '2026-04-20T10:00:00Z',
    fileUrl: '/files/thesis-formatting-guidelines.pdf'
  },
  {
    _id: '2',
    title: 'IRB Application Form',
    description: 'Institutional Review Board application form for research involving human subjects. Includes consent templates and protocol submission checklist.',
    category: 'IRB/Ethics Forms',
    type: 'doc',
    tags: ['IRB', 'ethics', 'human subjects', 'form'],
    downloadCount: 892,
    createdAt: '2026-04-18T14:30:00Z',
    fileUrl: '/files/irb-application-form.docx'
  },
  {
    _id: '3',
    title: 'JESAM Manuscript Template',
    description: 'Official Microsoft Word template for JESAM journal submissions with pre-formatted sections for abstract, keywords, methodology, and references.',
    category: 'Manuscript Templates',
    type: 'template',
    tags: ['JESAM', 'template', 'publication', 'journal'],
    downloadCount: 2103,
    createdAt: '2026-04-15T09:15:00Z',
    fileUrl: '/files/jesam-manuscript-template.docx'
  },
  {
    _id: '4',
    title: 'Defense Schedule Template',
    description: 'Excel template for planning thesis defense schedules including committee availability, room bookings, and timeline coordination.',
    category: 'Defense Preparation',
    type: 'xlsx',
    tags: ['defense', 'schedule', 'committee', 'planning'],
    downloadCount: 654,
    createdAt: '2026-04-12T11:20:00Z',
    fileUrl: '/files/defense-schedule-template.xlsx'
  },
  {
    _id: '5',
    title: 'JESAM Author Guidelines',
    description: 'Complete author guidelines for Journal of Environmental Science and Management including submission process, peer review criteria, and publication ethics.',
    category: 'JESAM Publication',
    type: 'pdf',
    tags: ['JESAM', 'author', 'guidelines', 'publication'],
    downloadCount: 1589,
    createdAt: '2026-04-10T16:45:00Z',
    fileUrl: '/files/jesam-author-guidelines.pdf'
  },
  {
    _id: '6',
    title: 'UPLB Graduate Student Handbook',
    description: 'Official UPLB handbook covering academic policies, enrollment procedures, graduation requirements, and student rights and responsibilities.',
    category: 'UPLB Policies',
    type: 'pdf',
    tags: ['UPLB', 'policy', 'handbook', 'graduate'],
    downloadCount: 3421,
    createdAt: '2026-03-28T08:00:00Z',
    fileUrl: '/files/uplb-graduate-handbook.pdf'
  },
  {
    _id: '7',
    title: 'Research Data Management Plan',
    description: 'Template for creating a comprehensive data management plan covering data collection, storage, sharing, and preservation for environmental research.',
    category: 'Thesis Guidelines',
    type: 'template',
    tags: ['data', 'management', 'research', 'DMP'],
    downloadCount: 423,
    createdAt: '2026-04-22T13:10:00Z',
    fileUrl: '/files/data-management-plan.docx'
  },
  {
    _id: '8',
    title: 'Informed Consent Template',
    description: 'Standardized informed consent form template for research participants with sections for study purpose, procedures, risks, and confidentiality.',
    category: 'IRB/Ethics Forms',
    type: 'template',
    tags: ['consent', 'IRB', 'ethics', 'participants'],
    downloadCount: 756,
    createdAt: '2026-04-19T10:30:00Z',
    fileUrl: '/files/informed-consent-template.docx'
  },
  {
    _id: '9',
    title: 'Defense Presentation Template',
    description: 'PowerPoint presentation template for thesis defense with SESAM branding, suggested slide layouts, and presentation tips.',
    category: 'Defense Preparation',
    type: 'template',
    tags: ['defense', 'presentation', 'slides', 'SESAM'],
    downloadCount: 1123,
    createdAt: '2026-04-08T15:20:00Z',
    fileUrl: '/files/defense-presentation-template.pptx'
  },
  {
    _id: '10',
    title: 'Literature Review Framework',
    description: 'Structured framework for conducting and writing literature reviews with evaluation criteria and synthesis methodology guidance.',
    category: 'Thesis Guidelines',
    type: 'pdf',
    tags: ['literature', 'review', 'research', 'framework'],
    downloadCount: 987,
    createdAt: '2026-04-05T11:00:00Z',
    fileUrl: '/files/literature-review-framework.pdf'
  },
  {
    _id: '11',
    title: 'Environmental Impact Assessment Checklist',
    description: 'Comprehensive checklist for conducting environmental impact assessments with regulatory requirements and best practices.',
    category: 'Thesis Guidelines',
    type: 'pdf',
    tags: ['EIA', 'environmental', 'assessment', 'checklist'],
    downloadCount: 534,
    createdAt: '2026-04-21T09:45:00Z',
    fileUrl: '/files/eia-checklist.pdf'
  },
  {
    _id: '12',
    title: 'Statistical Analysis Guidelines',
    description: 'Guidelines for selecting and reporting statistical analyses in environmental science research with software recommendations.',
    category: 'Thesis Guidelines',
    type: 'pdf',
    tags: ['statistics', 'analysis', 'methodology', 'research'],
    downloadCount: 1456,
    createdAt: '2026-03-15T14:00:00Z',
    fileUrl: '/files/statistical-analysis-guidelines.pdf'
  }
];

// Categories configuration with icons
const categories = [
  { id: 'all', name: 'All Categories', icon: FolderOpen },
  { id: 'Thesis Guidelines', name: 'Thesis Guidelines', icon: Book },
  { id: 'IRB/Ethics Forms', name: 'IRB/Ethics Forms', icon: Shield },
  { id: 'Manuscript Templates', name: 'Manuscript Templates', icon: FileText },
  { id: 'Defense Preparation', name: 'Defense Preparation', icon: GraduationCap },
  { id: 'JESAM Publication', name: 'JESAM Publication', icon: ScrollText },
  { id: 'UPLB Policies', name: 'UPLB Policies', icon: Scale }
];

// File type filters
const fileTypeFilters = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDF' },
  { id: 'doc', label: 'Word' },
  { id: 'template', label: 'Templates' }
];

// Get file type icon and color
const getFileTypeConfig = (type: string) => {
  switch (type) {
    case 'pdf':
      return { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    case 'doc':
    case 'template':
      return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    case 'xlsx':
      return { icon: FileSpreadsheet, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    default:
      return { icon: File, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  }
};

// Format download count
const formatDownloadCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function GuidanceLibraryPage() {
  const [resources, setResources] = useState<GuidanceResource[]>(mockResources);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch resources from API (simulated with mock data for now)
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        // In production, this would fetch from the actual API
        // const response = await fetch('/api/guidance');
        // const data = await response.json();
        // setResources(data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setResources(mockResources);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching guidance resources:', error);
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filter resources based on search, category, and file type
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

      // File type filter
      const matchesFileType = selectedFileType === 'all' || 
        (selectedFileType === 'template' ? resource.type === 'template' : resource.type === selectedFileType);

      return matchesSearch && matchesCategory && matchesFileType;
    });
  }, [resources, searchQuery, selectedCategory, selectedFileType]);

  // Recently added (top 5 newest)
  const recentlyAdded = useMemo(() => {
    return [...resources]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [resources]);

  // Most downloaded (top 5)
  const mostDownloaded = useMemo(() => {
    return [...resources]
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 5);
  }, [resources]);

  // Handle download
  const handleDownload = (resource: GuidanceResource) => {
    // In production, this would trigger actual file download
    console.log(`Downloading: ${resource.title}`);
    // Could track download analytics here
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFileType('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedFileType !== 'all';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C0B5D] mb-2">Guidance Library</h1>
            <p className="text-sm sm:text-base text-gray-600">SESAM templates, guidelines, and resources</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BookOpen className="w-5 h-5" />
            <span>{resources.length} resources available</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search guidelines, templates, forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-[#0C0B5D] focus:ring-1 focus:ring-[#0C0B5D] transition-colors text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#0C0B5D]" />
              Categories
            </h2>
            <nav className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#0C0B5D] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="flex-1 text-left">{category.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>

            {/* File Type Filters */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Filter by Type</h3>
              <div className="flex flex-wrap gap-2">
                {fileTypeFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFileType(filter.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedFileType === filter.id
                        ? 'bg-[#0C0B5D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-[#0C0B5D] bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recently Added Section (only show when no search/filter) */}
          {!hasActiveFilters && (
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0C0B5D]" />
                  Recently Added
                </h2>
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyAdded.map((resource) => {
                  const fileConfig = getFileTypeConfig(resource.type);
                  const FileIcon = fileConfig.icon;
                  return (
                    <div
                      key={`recent-${resource._id}`}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 ${fileConfig.bgColor} ${fileConfig.borderColor} border rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <FileIcon className={`w-5 h-5 ${fileConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#0C0B5D] transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(resource.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Download className="w-3 h-3" />
                          <span>{formatDownloadCount(resource.downloadCount)}</span>
                        </div>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="text-xs font-semibold text-[#0C0B5D] hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Most Downloaded Section (only show when no search/filter) */}
          {!hasActiveFilters && (
            <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0C0B5D]" />
                  Most Downloaded
                </h2>
                <span className="text-xs text-gray-500">Top 5 resources</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mostDownloaded.map((resource) => {
                  const fileConfig = getFileTypeConfig(resource.type);
                  const FileIcon = fileConfig.icon;
                  return (
                    <div
                      key={`popular-${resource._id}`}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 ${fileConfig.bgColor} ${fileConfig.borderColor} border rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <FileIcon className={`w-5 h-5 ${fileConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-[#0C0B5D] transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{resource.category}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-purple-700 font-semibold">
                          <Download className="w-3 h-3" />
                          <span>{resource.downloadCount.toLocaleString()} downloads</span>
                        </div>
                        <button
                          onClick={() => handleDownload(resource)}
                          className="text-xs font-semibold text-[#0C0B5D] hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Resources Grid */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0C0B5D]" />
                {hasActiveFilters ? `Search Results (${filteredResources.length})` : 'All Resources'}
              </h2>
              {hasActiveFilters && (
                <span className="text-xs text-gray-500">
                  {selectedCategory !== 'all' && `Category: ${selectedCategory}`}
                  {selectedCategory !== 'all' && selectedFileType !== 'all' && ' • '}
                  {selectedFileType !== 'all' && `Type: ${selectedFileType.toUpperCase()}`}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0C0B5D]"></div>
              </div>
            ) : filteredResources.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
                <p className="text-sm text-gray-600 max-w-md mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'No resources are currently available in the library.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0C0B5D] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredResources.map((resource) => {
                  const fileConfig = getFileTypeConfig(resource.type);
                  const FileIcon = fileConfig.icon;
                  return (
                    <div
                      key={resource._id}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-[#0C0B5D] hover:shadow-lg transition-all group bg-white"
                    >
                      {/* Header with Icon and Type */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 ${fileConfig.bgColor} ${fileConfig.borderColor} border-2 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <FileIcon className={`w-6 h-6 ${fileConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${fileConfig.bgColor} ${fileConfig.color} border ${fileConfig.borderColor}`}>
                            {resource.type === 'template' ? 'TEMPLATE' : resource.type.toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{resource.category}</p>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0C0B5D] transition-colors">
                        {resource.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {resource.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer with Stats and Download */}
                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {formatDownloadCount(resource.downloadCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(resource.createdAt)}
                          </span>
                        </div>
                        <Link
                          href={resource.fileUrl}
                          onClick={() => handleDownload(resource)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#0C0B5D] text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
