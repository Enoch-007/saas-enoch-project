import React from 'react';
import { Lightbulb, Heart, Star, Award } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About LinkedLeaders</h1>
        <p className="text-xl text-gray-600">
          Empowering K-12 school leaders through meaningful connections and support
        </p>
      </div>

      <div className="prose prose-lg mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-10 w-10 text-purple-600 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-gray-900 ml-4">Our Story</h2>
          </div>
          <p className="text-gray-600 mb-6">
            LinkedLeaders was founded by Mike Caldwell in 2024 in response to seeing droves of school leaders burned out and leaving the profession. At its core, LinkedLeaders is about relationships and investing in professional connections. In a world that is centered on the advancement of technology and artificial intelligence, LinkedLeaders centers on Human Connection.
          </p>
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-gray-900 ml-3">Our Mission</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Our mission is to empower K-12 school leaders to create meaningful, lasting impacts in their schools and communities through personalized, peer-to-peer support.
          </p>
          <div className="flex items-center mb-4">
            <Star className="h-8 w-8 text-purple-600 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-gray-900 ml-3">Our Vision</h3>
          </div>
          <p className="text-gray-600">
            One could argue that there isn't a more complex, challenging and exhausting line of work than that of a school leader. LinkedLeaders is a lifeline of sorts for those leaders in the trenches today. Through our community, we offer more than just encouragement, support, mentoring and coaching, we offer hope in a job that can seem hopeless. We believe that through our efforts, great leaders will stay in the profession longer, good leaders will become great and new and inexperienced leaders will have the support they need to have a long and rewarding career in school leadership.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <Award className="h-10 w-10 text-purple-600 flex-shrink-0" />
            <h2 className="text-2xl font-bold text-gray-900 ml-4">About Our Founder</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <img
                src="https://qgwbmluufjxgkjnxfwqm.supabase.co/storage/v1/object/public/media-linkedleaders//BLU_0814%20(1)%20Medium.jpeg"
                alt="Mike Caldwell"
                className="rounded-lg shadow-md w-full"
              />
              <div className="mt-4 text-center">
                <h3 className="font-semibold text-gray-900">Mike Caldwell</h3>
                <p className="text-gray-600">Founder & CEO</p>
              </div>
            </div>
            <div className="md:w-2/3">
              <p className="text-gray-600 mb-6">
                With over 25 years in education, Mike Caldwell has served as a teacher, administrator and program director. In recent years, Mike served as the principal at Bishop Kelly High School in Boise, Idaho from 2014 to 2023. Prior to Bishop Kelly, Mike was a member of the executive team at the Idaho Digital Learning Alliance where he served as the Director of Development from 2008 to 2014 working with schools and districts all over Idaho implementing various technology based programs to provide equity and access in a very rural state.
              </p>
              <p className="text-gray-600 mb-6">
                Most recently, Mike has worked for a non-profit organization that supports charter school development and growth in his home state of Idaho. Over his tenure as an educator and education leader, Mike has established himself as a prominent and well-respected forward thinker, innovator, and problem solver.
              </p>
              <p className="text-gray-600">
                Mike grew up in a small rural town in Idaho and brings a passion for improving education specifically to the Gem State. Mike and his wife, Amy, have two daughters and one son and reside in the Treasure Valley.
              </p>
              <div className="mt-6">
                <a
                  href="https://www.jkaf.org/stories/mike-caldwell/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Read More: Beyond City Limits: How Mike Caldwell is Expanding Rural Education Opportunities in Idaho →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}