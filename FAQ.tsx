import React from 'react';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "What is LinkedLeader?",
    answer: "LinkedLeader is an online, subscription-based platform designed for school leaders. Our platform connects school leaders with experienced mentors, coaches, and peers, providing access to mentorship, coaching, and masterclasses tailored to the unique challenges of educational leadership."
  },
  {
    question: "Who is LinkedLeaders for?",
    answer: "LinkedLeaders is designed for K-12 school leaders, including principals, assistant principals, charter school leaders, district administrators, and aspiring school leaders seeking professional growth, support, and guidance."
  },
  {
    question: "What does a subscription include?",
    answer: (
      <div>
        <p className="mb-2">A subscription to LinkedLeaders grants you:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access to a diverse community of experienced school leaders</li>
          <li>Personalized one-on-one coaching sessions</li>
          <li>Various masterclasses on key leadership topics</li>
          <li>Peer networking opportunities</li>
          <li>Exclusive resources, tools, and templates for school leadership</li>
        </ul>
      </div>
    )
  },
  {
    question: "How does mentoring work on LinkedLeaders?",
    answer: "Our mentors are seasoned school leaders who understand the complexities of educational leadership. After subscribing, you can browse mentor profiles, select a mentor whose expertise aligns with your goals, and book sessions at times that work for you."
  },
  {
    question: "What are the masterclasses?",
    answer: "Masterclasses are in-depth, interactive sessions led by expert school leaders and educators. These sessions cover topics like instructional leadership, building school culture, strategic planning, and more. Masterclasses are held live and are also recorded for on-demand access."
  },
  {
    question: "How much does a subscription cost?",
    answer: "We offer flexible pricing for individuals and teams. Pricing details can be found on our Subscription Plans page."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "If you decide you no longer want to use your credits, you can walk away anytime. Subscriptions are built around credits for maximum flexiblity."
  },
  {
    question: "How do I get started?",
    answer: (
      <div>
        <p className="mb-2">Getting started is easy! Simply:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visit LinkedLeaders.com and click sign in to go to the platform</li>
          <li>Choose a subscription plan that fits your needs</li>
          <li>Set up your profile and start exploring mentors, resources, and masterclasses</li>
        </ul>
      </div>
    )
  },
  {
    question: "What kind of support does LinkedLeaders offer?",
    answer: "We provide personalized customer support to ensure you have the best experience. If you have questions or encounter any issues, our support team is available to assist you."
  },
  {
    question: "Are the coaching sessions confidential?",
    answer: "Absolutely. All coaching sessions are confidential, creating a safe and supportive space for you to discuss challenges and seek advice."
  },
  {
    question: "How are mentors selected for the platform?",
    answer: "Our mentors are carefully vetted based on their experience, expertise, and ability to provide valuable guidance to other school leaders. Many have decades of leadership experience and are passionate about helping others succeed."
  },
  {
    question: "Can I switch mentors?",
    answer: "Yes, you can switch mentors at any time to ensure you're getting the support that best meets your needs."
  },
  {
    question: "Do you offer group coaching?",
    answer: "While it's certainly possible that any of our mentors can offer group coaching, our primary model is built around a 1:1, highly personalized approach to mentoring and coaching."
  },
  {
    question: "Is LinkedLeaders only for U.S.-based school leaders?",
    answer: "No, LinkedLeaders.com is accessible to school leaders worldwide. While some content may be tailored to U.S. education systems, many resources and sessions focus on universal leadership challenges and solutions."
  },
  {
    question: "How do I participate in a masterclass?",
    answer: "Once you're subscribed, you can go to our masterclasses page and see all upcoming live masterclasses as well as on-demand courses that you can access anytime. As a subscriber, you can reserve a seat for any of our live masterclasses or access recordings in our Masterclass Library at your convenience."
  },
  {
    question: "Can I contribute as a mentor or masterclass leader?",
    answer: "We're always looking for experienced school leaders to join our community as mentors or masterclass leaders. If you're interested, visit our Become a Mentor page for more information."
  },
  {
    question: "What makes LinkedLeaders unique?",
    answer: "LinkedLeaders is the only platform exclusively dedicated to school leadership mentorship and coaching. We offer personalized support, practical resources, and a community that understands the complexities of leading schools."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = React.useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600">
          Find answers to common questions about LinkedLeaders
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
              {openItems.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {openItems.includes(index) && (
              <div className="px-6 py-4 bg-gray-50">
                <div className="text-gray-600 prose prose-sm max-w-none">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-purple-50 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Have more questions?</h2>
        <div className="flex items-center justify-center space-x-2 text-purple-600">
          <Mail className="h-5 w-5" />
          <a href="mailto:mike@linkedleaders.com" className="hover:text-purple-700">
            mike@linkedleaders.com
          </a>
        </div>
      </div>
    </div>
  );
}