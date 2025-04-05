import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Upload, Download, FileText, FileImage, Film, Archive, File, Tag, LogIn, Plus, MessageSquare, CheckCircle } from 'lucide-react';
import { useAuth } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string;
  };
}

interface ResourceRequest {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
  requested_by: {
    full_name: string;
    avatar_url: string;
  };
  responses: ResourceResponse[];
}

interface ResourceResponse {
  id: string;
  comment: string;
  created_at: string;
  resource_id: string | null;
  responder: {
    full_name: string;
    avatar_url: string;
  };
  resource?: Resource;
}

const CATEGORIES = [
  'Curriculum',
  'Leadership',
  'Operations',
  'Professional Development',
  'School Culture',
  'Student Support',
  'Technology',
  'Assessment',
  'Parent Engagement',
  'Staff Development'
] as const;

const FILE_TYPE_ICONS = {
  pdf: <FileText className="h-6 w-6 text-red-500" />,
  doc: <FileText className="h-6 w-6 text-blue-500" />,
  docx: <FileText className="h-6 w-6 text-blue-500" />,
  xls: <FileText className="h-6 w-6 text-green-500" />,
  xlsx: <FileText className="h-6 w-6 text-green-500" />,
  ppt: <FileText className="h-6 w-6 text-orange-500" />,
  pptx: <FileText className="h-6 w-6 text-orange-500" />,
  jpg: <FileImage className="h-6 w-6 text-purple-500" />,
  jpeg: <FileImage className="h-6 w-6 text-purple-500" />,
  png: <FileImage className="h-6 w-6 text-purple-500" />,
  mp4: <Film className="h-6 w-6 text-indigo-500" />,
  zip: <Archive className="h-6 w-6 text-gray-500" />,
  default: <File className="h-6 w-6 text-gray-500" />
};

export function Vault() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    requestId: null as string | null
  });
  const [requestData, setRequestData] = useState({
    title: '',
    description: ''
  });
  const [responseData, setResponseData] = useState({
    comment: '',
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resources' | 'requests'>('resources');

  useEffect(() => {
    fetchResources();
    fetchRequests();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('vault_resources')
        .select(`
          *,
          author:profiles!uploaded_by (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .select(`
          *,
          requested_by:profiles!requested_by (
            full_name,
            avatar_url
          ),
          responses:resource_responses (
            *,
            responder:profiles!responder_id (
              full_name,
              avatar_url
            ),
            resource:vault_resources (
              *,
              author:profiles!uploaded_by (
                full_name,
                avatar_url
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests');
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/vault' } });
      return;
    }
    setShowUploadModal(true);
  };

  const handleRequestClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/vault' } });
      return;
    }
    setShowRequestModal(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file) return;

    setUploading(true);
    try {
      const fileExt = uploadData.file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `vault_resources/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault_resources')
        .upload(filePath, uploadData.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vault_resources')
        .getPublicUrl(filePath);

      const { data: resource, error: dbError } = await supabase
        .from('vault_resources')
        .insert({
          title: uploadData.title,
          description: uploadData.description,
          file_url: publicUrl,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (uploadData.requestId && resource) {
        const { error: responseError } = await supabase
          .from('resource_responses')
          .insert({
            request_id: uploadData.requestId,
            resource_id: resource.id,
            responder_id: user.id,
            comment: 'Resource uploaded in response to request'
          });

        if (responseError) throw responseError;

        await supabase
          .from('resource_requests')
          .update({ status: 'fulfilled' })
          .eq('id', uploadData.requestId);
      }

      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        file: null,
        requestId: null
      });
      fetchResources();
      fetchRequests();
    } catch (error) {
      console.error('Error uploading resource:', error);
      setError('Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('resource_requests')
        .insert({
          title: requestData.title,
          description: requestData.description,
          requested_by: user?.id
        });

      if (error) throw error;

      setShowRequestModal(false);
      setRequestData({ title: '', description: '' });
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      setError('Failed to create request');
    }
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      if (responseData.file) {
        // If a file is included, upload it first
        await handleFileUpload(e);
      } else {
        // Otherwise, just add a comment
        const { error } = await supabase
          .from('resource_responses')
          .insert({
            request_id: selectedRequest.id,
            responder_id: user?.id,
            comment: responseData.comment
          });

        if (error) throw error;
      }

      setShowResponseModal(false);
      setResponseData({ comment: '', file: null });
      fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
      setError('Failed to respond to request');
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      window.open(resource.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
      setError('Failed to download resource');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategories = selectedCategories.length === 0;
    return matchesSearch && matchesCategories;
  });

  const getFileIcon = (fileUrl: string) => {
    const fileType = fileUrl.split('.').pop()?.toLowerCase();
    return FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default;
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Resource Vault</h1>
        <p className="mt-2 text-gray-600">
          Access, share, and request valuable resources from the community
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
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRequestClick}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Request Resource
          </button>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
          >
            {user ? (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Resource
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Sign in to Upload
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Requests
          </button>
        </nav>
      </div>

      {activeTab === 'resources' ? (
        <div className="grid gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getFileIcon(resource.file_url)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Uploaded by {resource.author.full_name}
                    </p>
                    <p className="mt-2 text-gray-600">{resource.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <button
                    onClick={() => handleDownload(resource)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredResources.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
              <p className="text-gray-500">
                Try adjusting your search or upload a new resource
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'fulfilled'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested by {request.requested_by.full_name} • {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="mt-2 text-gray-600">{request.description}</p>
                </div>
                {request.status === 'open' && (
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowResponseModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Respond
                  </button>
                )}
              </div>

              {request.responses.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Responses</h4>
                  <div className="space-y-4">
                    {request.responses.map((response) => (
                      <div key={response.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {response.responder.full_name} • {format(new Date(response.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {response.comment && (
                          <p className="mt-2 text-gray-600">{response.comment}</p>
                        )}
                        {response.resource && (
                          <div className="mt-2 bg-white rounded p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFileIcon(response.resource.file_url)}
                              <span className="font-medium">{response.resource.title}</span>
                            </div>
                            <button
                              onClick={() => handleDownload(response.resource!)}
                              className="text-indigo-600 hover:text-indigo-700"
                            >
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No resource requests</h3>
              <p className="text-gray-500">
                Be the first to request a resource from the community
              </p>
            </div>
          )}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Resource
            </h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData({
                    ...uploadData,
                    file: e.target.files?.[0] || null
                  })}
                  className="mt-1 block w-full"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request a Resource
            </h2>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={requestData.title}
                  onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="What resource are you looking for?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={requestData.description}
                  onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Describe the resource you need and how it will help you..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Respond to Request
            </h2>
            <form onSubmit={handleResponseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Comment
                </label>
                <textarea
                  value={responseData.comment}
                  onChange={(e) => setResponseData({ ...responseData, comment: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Add a helpful comment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Resource (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setResponseData({
                    ...responseData,
                    file: e.target.files?.[0] || null
                  })}
                  className="mt-1 block w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}