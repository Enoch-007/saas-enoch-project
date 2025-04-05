import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Upload, Download, FileText, FileImage, Film, Archive, File, Tag, LogIn, Plus, MessageSquare, CheckCircle, Filter, ChevronDown, ChevronUp, Puzzle, Building2, Languages, Star, Globe, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EXPERTISE_AREAS, MENTOR_EXPERIENCES, COMMON_LANGUAGES } from '../lib/supabase';

interface MentorSearchResult {
  id: string;
  full_name: string;
  headline: string;
  avatar_url: string;
  expertise_areas: string[];
  mentor_experience: string[];
  languages_spoken: string[];
  years_of_experience: number;
  session_rate: number;
  time_zone: string;
  average_rating: number;
  total_reviews: number;
  completed_sessions: number;
}

interface FilterSection {
  id: 'expertise' | 'experience' | 'languages';
  title: string;
  icon: React.ReactNode;
  items: string[];
  colorIndex: number;
}

const FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'expertise',
    title: 'Areas of Expertise',
    icon: <Puzzle className="h-4 w-4" />,
    items: EXPERTISE_AREAS,
    colorIndex: 0
  },
  {
    id: 'experience',
    title: 'Experience & Context',
    icon: <Building2 className="h-4 w-4" />,
    items: MENTOR_EXPERIENCES,
    colorIndex: 1
  },
  {
    id: 'languages',
    title: 'Languages',
    icon: <Languages className="h-4 w-4" />,
    items: COMMON_LANGUAGES,
    colorIndex: 2
  }
];

const FILTER_COLORS = {
  expertise: [
    'bg-blue-50 text-blue-700 hover:bg-blue-100',
    'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    'bg-amber-50 text-amber-700 hover:bg-amber-100',
    'bg-purple-50 text-purple-700 hover:bg-purple-100',
    'bg-rose-50 text-rose-700 hover:bg-rose-100'
  ],
  experience: [
    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    'bg-teal-50 text-teal-700 hover:bg-teal-100',
    'bg-orange-50 text-orange-700 hover:bg-orange-100',
    'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    'bg-lime-50 text-lime-700 hover:bg-lime-100'
  ],
  languages: [
    'bg-violet-50 text-violet-700 hover:bg-violet-100',
    'bg-pink-50 text-pink-700 hover:bg-pink-100',
    'bg-sky-50 text-sky-700 hover:bg-sky-100',
    'bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100',
    'bg-green-50 text-green-700 hover:bg-green-100'
  ]
};

const FilterButton = memo(({ 
  item, 
  isSelected, 
  colorClass, 
  onToggle 
}: { 
  item: string;
  isSelected: boolean;
  colorClass: string;
  onToggle: (item: string) => void;
}) => (
  <button
    onClick={() => onToggle(item)}
    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
      isSelected
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
        : colorClass
    }`}
  >
    <span className="truncate max-w-[120px] inline-block">
      {item}
    </span>
  </button>
));

FilterButton.displayName = 'FilterButton';

const FilterSection = memo(({ 
  section,
  isExpanded,
  selectedFilters,
  onToggleExpand,
  onToggleFilter,
  getFilterColor
}: {
  section: FilterSection;
  isExpanded: boolean;
  selectedFilters: string[];
  onToggleExpand: () => void;
  onToggleFilter: (value: string) => void;
  getFilterColor: (type: FilterSection['id'], index: number) => string;
}) => (
  <div className="rounded-lg bg-gray-50">
    <button
      onClick={onToggleExpand}
      className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center">
        {section.icon}
        <span className="ml-2">{section.title}</span>
        {selectedFilters.length > 0 && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
            {selectedFilters.length}
          </span>
        )}
      </div>
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 text-gray-500" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-500" />
      )}
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-3 flex flex-wrap gap-1.5">
            {section.items.map((item, index) => (
              <FilterButton
                key={item}
                item={item}
                isSelected={selectedFilters.includes(item)}
                colorClass={getFilterColor(section.id, index)}
                onToggle={() => onToggleFilter(item)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

FilterSection.displayName = 'FilterSection';

const FilterSidebar = memo(({ 
  expertise,
  experience,
  languages,
  maxRate,
  searchQuery,
  expandedSection,
  onSearchChange,
  onResetFilters,
  onToggleExpand,
  onToggleFilter,
  onMaxRateChange,
  getFilterColor
}: {
  expertise: string[];
  experience: string[];
  languages: string[];
  maxRate: number;
  searchQuery: string;
  expandedSection: FilterSection['id'] | null;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onToggleExpand: (sectionId: FilterSection['id']) => void;
  onToggleFilter: (type: FilterSection['id'], value: string) => void;
  onMaxRateChange: (value: number) => void;
  getFilterColor: (type: FilterSection['id'], index: number) => string;
}) => {
  const hasActiveFilters = expertise.length > 0 || 
                          experience.length > 0 || 
                          languages.length > 0 || 
                          searchQuery.length > 0;

  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search mentors..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="mt-3 w-full flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {FILTER_SECTIONS.map((section) => (
          <FilterSection
            key={section.id}
            section={section}
            isExpanded={expandedSection === section.id}
            selectedFilters={
              section.id === 'expertise' 
                ? expertise 
                : section.id === 'experience' 
                ? experience 
                : languages
            }
            onToggleExpand={() => onToggleExpand(section.id)}
            onToggleFilter={(value) => onToggleFilter(section.id, value)}
            getFilterColor={getFilterColor}
          />
        ))}

        <div className="mt-4 px-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900">
              Max Credits per Hour
            </label>
            <span className="text-sm font-medium text-indigo-600">
              {maxRate}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={maxRate}
            onChange={(e) => onMaxRateChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>4</span>
          </div>
        </div>
      </div>
    </div>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export function MentorSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState(4);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<FilterSection['id'] | null>(null);

  useEffect(() => {
    fetchMentors();
  }, [expertise, experience, languages, maxRate, searchQuery]);

  const fetchMentors = async () => {
    try {
      let query = supabase
        .from('mentor_search')
        .select('*');

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,headline.ilike.%${searchQuery}%`);
      }

      if (expertise.length > 0) {
        query = query.overlaps('expertise_areas', expertise);
      }

      if (experience.length > 0) {
        query = query.overlaps('mentor_experience', experience);
      }

      if (languages.length > 0) {
        query = query.overlaps('languages_spoken', languages);
      }

      const maxRateInt = Math.round(maxRate);
      if (maxRateInt > 0) {
        query = query.lte('session_rate', maxRateInt);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error searching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = useCallback(() => {
    setExpertise([]);
    setExperience([]);
    setLanguages([]);
    setMaxRate(4);
    setSearchQuery('');
  }, []);

  const toggleFilter = useCallback((type: FilterSection['id'], value: string) => {
    const updater = (prev: string[]) =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];

    if (type === 'expertise') setExpertise(updater);
    else if (type === 'experience') setExperience(updater);
    else if (type === 'languages') setLanguages(updater);
  }, []);

  const getFilterColor = useCallback((type: FilterSection['id'], index: number) => {
    return FILTER_COLORS[type][index % FILTER_COLORS[type].length];
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleToggleExpand = useCallback((sectionId: FilterSection['id']) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  }, []);

  const handleMaxRateChange = useCallback((value: number) => {
    setMaxRate(value);
  }, []);

  const memoizedSidebar = useMemo(() => (
    <FilterSidebar
      expertise={expertise}
      experience={experience}
      languages={languages}
      maxRate={maxRate}
      searchQuery={searchQuery}
      expandedSection={expandedSection}
      onSearchChange={handleSearchChange}
      onResetFilters={resetFilters}
      onToggleExpand={handleToggleExpand}
      onToggleFilter={toggleFilter}
      onMaxRateChange={handleMaxRateChange}
      getFilterColor={getFilterColor}
    />
  ), [
    expertise,
    experience,
    languages,
    maxRate,
    searchQuery,
    expandedSection,
    handleSearchChange,
    resetFilters,
    handleToggleExpand,
    toggleFilter,
    handleMaxRateChange,
    getFilterColor
  ]);

  return (
    <div className="h-[calc(100vh-4rem)]">
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 bg-white rounded-lg shadow-md flex items-center gap-2 text-gray-700"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Filters</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {memoizedSidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[18%] min-w-[240px] border-r border-gray-200">
          {memoizedSidebar}
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                {loading ? 'Searching mentors...' : `${mentors.length} Mentors Found`}
              </h1>
            </div>

            <AnimatePresence>
              <motion.div
                layout
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              >
                {mentors.map((mentor) => (
                  <motion.div
                    key={mentor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={`/mentors/${mentor.id}`}
                      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-4 lg:p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={mentor.avatar_url || 'https://via.placeholder.com/100'}
                            alt={mentor.full_name}
                            className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {mentor.full_name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {mentor.headline}
                            </p>
                            <div className="flex items-center mt-2">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className="ml-1 text-sm font-medium">
                                {mentor.average_rating.toFixed(1)}
                              </span>
                              <span className="ml-1 text-sm text-gray-500">
                                ({mentor.total_reviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1">
                            {mentor.expertise_areas?.slice(0, 3).map((area, index) => (
                              <span
                                key={area}
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFilterColor('expertise', index)}`}
                              >
                                {area}
                              </span>
                            ))}
                            {mentor.expertise_areas?.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{mentor.expertise_areas.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Globe className="h-4 w-4 mr-1" />
                            {mentor.time_zone}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                              {mentor.session_rate}
                            </span>
                            <span className="text-gray-500">credits/hour</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {mentors.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-white rounded-lg shadow-md"
              >
                <p className="text-gray-500">No mentors found matching your criteria.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Reset filters and try again
                </button>
              </motion.div>
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}