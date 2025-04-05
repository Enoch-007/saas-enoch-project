import React from 'react';
import { FileText, Download, ExternalLink, Mail, Phone } from 'lucide-react';

const pressReleases = [
  {
    date: '2024-03-15',
    title: 'LinkedLeaders Launches Global Mentorship Platform for K-12 Education Leaders',
    summary: 'Revolutionary platform connects school administrators with experienced mentors worldwide.',
    link: '#'
  },
  {
    date: '2024-02-28',
    title: 'Education Technology Leader Joins LinkedLeaders Advisory Board',
    summary: 'Former superintendent brings decades of experience to growing mentorship platform.',
    link: '#'
  },
  {
    date: '2024-01-15',
    title: 'LinkedLeaders Announces Partnership with Leading Education Organizations',
    summary: 'Strategic collaboration aims to enhance professional development opportunities.',
    link: '#'
  }
];

const mediaKit = [
  {
    title: 'Brand Guidelines',
    description: 'Official logos, color palette, and usage guidelines',
    fileSize: '2.5 MB',
    format: 'PDF'
  },
  {
    title: 'Press Kit',
    description: 'Company background, leadership bios, and high-res images',
    fileSize: '15 MB',
    format: 'ZIP'
  },
  {
    title: 'Impact Report 2024',
    description: "Detailed analysis of our platform's impact on education",
    fileSize: '5 MB',
    format: 'PDF'
  }
];

export function Press() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Press Center</h1>
        <p className="text-xl text-gray-600">
          Latest news, updates, and resources from LinkedLeaders
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Press Releases</h2>
        <div className="space-y-6">
          {pressReleases.map((release, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-500 mb-2">{release.date}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {release.title}
              </h3>
              <p className="text-gray-600 mb-4">{release.summary}</p>
              <a
                href={release.link}
                className="inline-flex items-center text-purple-600 hover:text-purple-700"
              >
                Read More
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Kit</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {mediaKit.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start">
                <FileText className="h-8 w-8 text-purple-600 mt-1" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {item.fileSize} • {item.format}
                    </span>
                    <button className="inline-flex items-center text-purple-600 hover:text-purple-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Inquiries</h2>
        <p className="text-gray-600 mb-6">
          For press inquiries, please contact our media relations team:
        </p>
        <div className="space-y-2">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-purple-600 mr-2" />
            <a href="mailto:press@linkedleaders.com" className="text-purple-600 hover:text-purple-700">
              press@linkedleaders.com
            </a>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-purple-600 mr-2" />
            <span>+1 (555) 123-4567</span>
          </div>
        </div>
      </div>
    </div>
  );
}