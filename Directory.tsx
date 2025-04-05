import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, Globe, Tag, Flag, LogIn } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  website_url: string;
  description: string;
  ai_description: string;
  tags: string[];
  average_rating: number;
  total_ratings: number;
  created_at: string;
  submitted_by: {
    full_name: string;
    avatar_url: string;
  };
}

const PRODUCT_CATEGORIES = [
  'Learning Management',
  'Student Information',
  'Assessment',
  'Communication',
  'Special Education',
  'Professional Development',
  'Classroom Management',
  'Data Analytics',
  'Parent Engagement',
  'Financial Management'
] as const;

export function Directory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitData, setSubmitData] = useState({
    name: '',
    website_url: '',
    tags: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_directory')
        .select(`
          *,
          submitted_by:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch ratings for each product
      const productsWithRatings = await Promise.all(
        (data || []).map(async (product) => {
          const { data: ratingData } = await supabase.rpc(
            'get_product_rating',
            { p_product_id: product.id }
          );
          return {
            ...product,
            average_rating: ratingData?.[0]?.average_rating || 0,
            total_ratings: ratingData?.[0]?.total_ratings || 0
          };
        })
      );

      setProducts(productsWithRatings);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/directory' } });
      return;
    }
    setShowSubmitModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Submit product
      const { error } = await supabase
        .from('product_directory')
        .insert({
          name: submitData.name,
          website_url: submitData.website_url,
          tags: submitData.tags,
          submitted_by: user?.id
        });

      if (error) throw error;

      setShowSubmitModal(false);
      setSubmitData({ name: '', website_url: '', tags: [] });
      fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      setError('Failed to submit product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async (productId: string, rating: number) => {
    if (!user) {
      navigate('/login', { state: { from: '/directory' } });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_ratings')
        .upsert({
          product_id: productId,
          user_id: user.id,
          rating
        });

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error rating product:', error);
      setError('Failed to submit rating');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       product.tags.some(tag => selectedTags.includes(tag));
    return matchesSearch && matchesTags;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Education Product Directory</h1>
        <p className="mt-2 text-gray-600">
          Discover and review tools and services for education leaders
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSubmitClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
        >
          {user ? (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Submit Product
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Sign in to Submit
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="space-y-2">
              {PRODUCT_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(category)}
                    onChange={(e) => {
                      setSelectedTags(
                        e.target.checked
                          ? [...selectedTags, category]
                          : selectedTags.filter(t => t !== category)
                      );
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="grid gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <a
                      href={product.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mt-1"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Visit Website
                    </a>
                    <p className="mt-2 text-gray-600">{product.ai_description || product.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{product.average_rating}</span>
                      <span className="ml-1 text-gray-500">
                        ({product.total_ratings} reviews)
                      </span>
                    </div>
                    {user && (
                      <button
                        onClick={() => handleRate(product.id, 4)}
                        className="mt-2 text-indigo-600 hover:text-indigo-700"
                      >
                        Rate this product
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submit a Product
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <input
                  type="text"
                  value={submitData.name}
                  onChange={(e) => setSubmitData({ ...submitData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="url"
                  value={submitData.website_url}
                  onChange={(e) => setSubmitData({ ...submitData, website_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categories
                </label>
                <select
                  multiple
                  value={submitData.tags}
                  onChange={(e) => setSubmitData({
                    ...submitData,
                    tags: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}