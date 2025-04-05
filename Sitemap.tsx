import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SitemapSection {
  title: string;
  links: {
    name: string;
    path: string;
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: 'Main Pages',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
      { name: 'Search Mentors', path: '/search' },
      { name: 'Masterclasses', path: '/masterclasses' }
    ]
  },
  {
    title: 'User Access',
    links: [
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Profile', path: '/profile' }
    ]
  },
  {
    title: 'Information',
    links: [
      { name: 'FAQ', path: '/faq' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Press Center', path: '/press' },
      { name: 'Site Map', path: '/sitemap' }
    ]
  },
  {
    title: 'Join Us',
    links: [
      { name: 'Become a Mentor', path: '/become-mentor' },
      { name: 'Partner with Us', path: '/partner' },
      { name: 'Careers', path: '/careers' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of Service', path: '/policies' },
      { name: 'Privacy Policy', path: '/policies' },
      { name: 'Cookie Policy', path: '/policies' }
    ]
  }
];

export function Sitemap() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Site Map</h1>
        <p className="text-xl text-gray-600">
          Find everything you need on LinkedLeaders
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {sitemapData.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {section.title}
            </h2>
            <ul className="space-y-2">
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link
                    to={link.path}
                    className="flex items-center text-gray-600 hover:text-purple-600"
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}