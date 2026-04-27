'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Star, 
  Users, 
  BookOpen, 
  Target, 
  Award, 
  Download, 
  Eye, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  ExternalLink, 
  Megaphone,
  ChevronLeft
} from 'lucide-react';

export default function StudentDashboard() {
  const upcomingDeadlines = [
    { id: 1, title: 'Data Collection Phase', date: 'May 15, 2026', daysLeft: 7, priority: 'high', status: 'In Progress' },
    { id: 2, title: 'Chapter 2 Revision', date: 'April 15, 2026', daysLeft: 3, priority: 'high', status: 'Pending' },
    { id: 3, title: 'Progress Report Submission', date: 'April 30, 2026', daysLeft: 22, priority: 'medium', status: 'Not Started' },
  ];

  const recentActivity = [
    { id: 1, type: 'comment', text: 'Dr. Ramon Santos commented on Literature Review Chapter', time: '3 hours ago', icon: MessageSquare, color: 'text-purple-600' },
    { id: 2, type: 'approval', text: 'Survey Instrument v2.1 approved', time: '5 hours ago', icon: CheckCircle, color: 'text-blue-600' },
    { id: 3, type: 'announcement', text: 'SESAM Research Colloquium on April 12', time: '1 day ago', icon: Megaphone, color: 'text-blue-600' },
    { id: 4, type: 'milestone', text: 'Ethics Clearance milestone completed', time: '3 days ago', icon: Star, color: 'text-yellow-600' },
  ];

  const announcements = [
    { id: 1, title: 'UPLB SESAM Research Colloquium - April 12, 2026', category: 'Event', date: 'Posted April 5, 2026', urgent: false },
    { id: 2, title: 'Thesis Defense Schedule - May 2026 Released', category: 'Academic', date: 'Posted April 3, 2026', urgent: true },
    { id: 3, title: 'Library Workshop: Zotero Reference Management', category: 'Workshop', date: 'Posted April 1, 2026', urgent: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome back, Maria! 👋</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600">M.S. in Environmental Science • Year 2</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Student ID: 2024-12345</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/ai-chat"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0C0B5D] text-white rounded-xl hover:bg-opacity-90 transition-colors font-semibold border-2 border-[#0C0B5D] text-sm sm:text-base w-full sm:w-auto"
            >
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Ask SINAG AI</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-3xl font-bold text-blue-700">65%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Overall Progress</h3>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-700 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">5 of 8 milestones completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-3xl font-bold text-blue-700">5</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Completed Milestones</h3>
            <p className="text-xs text-gray-600">Latest: Ethics Clearance & IRB</p>
            <p className="text-xs text-blue-700 font-semibold mt-1">On Track ✓</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
              <span className="text-3xl font-bold text-orange-700">3</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Pending Tasks</h3>
            <p className="text-xs text-gray-600">Next: Data Collection Phase</p>
            <p className="text-xs text-orange-700 font-semibold mt-1">Due in 7 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-700" />
              </div>
              <span className="text-3xl font-bold text-purple-700">24</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">AI Consultations</h3>
            <p className="text-xs text-gray-600">Last session: Yesterday</p>
            <p className="text-xs text-purple-700 font-semibold mt-1">18 total messages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Column - 2 columns wide */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Advising Plan Summary */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#0C0B5D]" />
                Advising Plan Summary
              </h2>
              <Link
                href="/student/workflow"
                className="flex items-center gap-1 text-[#0C0B5D] hover:opacity-80 font-semibold text-sm transition-opacity"
              >
                View Full Plan
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200 mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Research Topic</p>
              <p className="text-gray-900 font-medium leading-relaxed">Impact of AI-Assisted Learning on Student Metacognition in Environmental Science Education</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Primary Adviser</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#0C0B5D] rounded-full flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Dr. Ramon Santos</p>
                    <p className="text-xs text-gray-600">Associate Professor</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Expected Graduation</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0C0B5D]" />
                  <div>
                    <p className="text-gray-900 font-medium">Spring 2026</p>
                    <p className="text-xs text-gray-600">8 months remaining</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Overall Progress</p>
                <p className="text-sm font-bold text-gray-900">65% Complete</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-gray-300">
                <div className="bg-[#0C0B5D] h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Current Milestone</p>
                <p className="text-gray-900 font-medium">Data Collection Phase</p>
                <p className="text-xs text-gray-600 mt-1">Progress: 78/120 respondents</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700 mb-1">Due Date</p>
                <p className="text-orange-700 font-bold">May 15, 2026</p>
                <p className="text-xs text-orange-600 mt-1">7 days left</p>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#0C0B5D]" />
                Upcoming Deadlines
              </h2>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className={`p-4 rounded-xl border-2 ${
                    deadline.priority === 'high'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">{deadline.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            deadline.priority === 'high'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {deadline.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {deadline.date}
                        </span>
                        <span className={`font-semibold ${
                          deadline.daysLeft <= 7 ? 'text-red-700' : 'text-orange-700'
                        }`}>
                          {deadline.daysLeft} days left
                        </span>
                        <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold border border-gray-300">
                          {deadline.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent AI Consultations */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="w-6 h-6 text-[#0C0B5D]" />
                Recent AI Consultations
              </h2>
              <Link
                href="/student/ai-chat"
                className="flex items-center gap-1 text-[#0C0B5D] hover:opacity-80 font-semibold text-sm transition-opacity"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { id: 1, title: 'Statistical Analysis Selection', messages: 18, date: 'Yesterday, 3:45 PM', preview: 'Thank you! The ANOVA explanation with examples was very helpful.' },
                { id: 2, title: 'Literature Review Structure', messages: 12, date: 'Apr 3, 2026', preview: 'Can you suggest more recent sources on mangrove restoration?' },
                { id: 3, title: 'IRB Ethics Approval Process', messages: 15, date: 'Apr 2, 2026', preview: 'What documents do I need for the submission?' },
                { id: 4, title: 'Mixed Methods Integration', messages: 20, date: 'Apr 1, 2026', preview: 'How do I present QUAN and QUAL findings together?' },
                { id: 5, title: 'Thesis Timeline Planning', messages: 9, date: 'Mar 28, 2026', preview: 'Is 6 months realistic for data collection?' }
              ].map((consultation) => (
                <Link
                  key={consultation.id}
                  href="/student/ai-chat"
                  className="block p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{consultation.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{consultation.preview}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {consultation.messages} messages
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {consultation.date}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1 column wide */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0C0B5D]" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/student/ai-chat"
                className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all group"
              >
                <Brain className="w-5 h-5 text-blue-700" />
                <span className="font-semibold text-gray-900 text-sm group-hover:text-blue-700">Ask AI a Question</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-700" />
              </Link>
              <Link
                href="/student/workflow"
                className="flex items-center gap-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition-all group"
              >
                <Target className="w-5 h-5 text-purple-700" />
                <span className="font-semibold text-gray-900 text-sm group-hover:text-purple-700">View Full Plan</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-purple-700" />
              </Link>
              <button className="w-full flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all group">
                <MessageSquare className="w-5 h-5 text-orange-700" />
                <span className="font-semibold text-gray-900 text-sm group-hover:text-orange-700">Message Adviser</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-orange-700" />
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#0C0B5D]" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Icon className={`w-5 h-5 ${activity.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium leading-relaxed">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/notifications"
              className="flex items-center justify-center gap-1 mt-4 text-[#0C0B5D] hover:opacity-80 font-semibold text-sm transition-opacity"
            >
              View All Notifications
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0C0B5D]" />
              SESAM Announcements
            </h2>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-3 rounded-lg border-2 ${
                    announcement.urgent
                      ? 'bg-red-50 border-red-300'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {announcement.urgent && (
                    <span className="inline-block px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full mb-2">
                      URGENT
                    </span>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-0.5 bg-white rounded-full font-semibold">
                      {announcement.category}
                    </span>
                    <span>•</span>
                    <span>{announcement.date}</span>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://sesam.uplb.edu.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 mt-4 text-[#0C0B5D] hover:opacity-80 font-semibold text-sm transition-opacity"
            >
              Visit SESAM Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Academic Resources */}
          <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0C0B5D]" />
              Resources
            </h2>
            <div className="space-y-2">
              <a
                href="#"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-sm text-gray-700 font-medium group-hover:text-[#0C0B5D]">SESAM Handbook</span>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0C0B5D]" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-sm text-gray-700 font-medium group-hover:text-[#0C0B5D]">Thesis Guidelines</span>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0C0B5D]" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-sm text-gray-700 font-medium group-hover:text-[#0C0B5D]">IRB Forms</span>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0C0B5D]" />
              </a>
              <a
                href="#"
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-sm text-gray-700 font-medium group-hover:text-[#0C0B5D]">Defense Templates</span>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[#0C0B5D]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
