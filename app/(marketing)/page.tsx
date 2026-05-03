'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LoginModal from '@/app/components/auth/LoginModal';
import RegisterModal from '@/app/components/auth/RegisterModal';
import {
  GraduationCap,
  Users,
  FileText,
  Brain,
  Clock,
  CheckCircle,
  Award,
  BookOpen,
  MessageSquare,
  Shield,
  Sparkles,
  ArrowRight,
  Building,
  Globe,
  Leaf,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  School,
  Target,
  Zap,
  BarChart,
  Heart,
  Star,
  CheckCircle2,
  Menu,
  Send,
  Minus,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'bot' | 'user'; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPulse, setShowPulse] = useState(true);


  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: '',
    password: '',
    confirmPassword: '',
  });

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chatbot functions
  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    if (message.includes('program') || message.includes('degree')) {
      return "SESAM offers three graduate programs:\n\n• MS Environmental Science\n• PhD Environmental Science\n• PhD by Research\n\nAll programs focus on environmental science with various areas of specialization. Would you like to know about our specializations?";
    }

    if (message.includes('specialization') || message.includes('area')) {
      return "SESAM offers specializations in:\n\n• Natural Resources Management\n• Environmental Chemistry\n• Environmental Planning and Management\n• Ecosystem Restoration\n• Environmental Biology\n• Community-Based Resource Management\n\nWhich area interests you most?";
    }

    if (message.includes('requirement') || message.includes('admission')) {
      return "Admission requirements vary by program, but generally include:\n\n• Bachelor's degree (for MS) or Master's degree (for PhD)\n• Transcripts of records\n• Letters of recommendation\n• Statement of purpose\n• GWA requirement\n\nApply through the UPLB Graduate School Online Admissions Portal. Need help with the application process?";
    }

    if (message.includes('deadline') || message.includes('when')) {
      return "Application deadlines:\n\n• January 31 - for 1st Semester (June intake)\n• June 30 - for 2nd Semester (November intake)\n\nI recommend applying early to ensure your application is processed on time!";
    }

    if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
      return "You can reach SESAM at:\n\n📧 sesam.uplb@up.edu.ph\n📞 +63 49 536 3080\n\nOur office hours are Monday-Friday, 8:00 AM - 5:00 PM. Feel free to reach out with any questions!";
    }

    if (message.includes('tuition') || message.includes('fee') || message.includes('cost')) {
      return "For detailed information about tuition and fees, please contact the SESAM office directly at sesam.uplb@up.edu.ph or call +63 49 536 3080.";
    }

    return "I'm focused on SESAM admissions. For that question, please email sesam.uplb@up.edu.ph.";
  };

  const handleChatOpen = () => {
    setIsChatOpen(true);
    setShowPulse(false);

    if (chatMessages.length === 0) {
      setChatMessages([{
        type: 'bot',
        text: "Hi! I'm SINAG, your SESAM admissions assistant. I can help you learn about our MS and PhD programs in Environmental Science, admission requirements, deadlines, and areas of specialization. What would you like to know?"
      }]);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickReply = (message: string) => {
    setChatMessages(prev => [...prev, { type: 'user', text: message }]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(message);
      setChatMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  const openLoginModal = () => {
    setShowSignUpModal(false);
    setShowLoginModal(true);
  };

  const openSignUpModal = () => {
    setShowLoginModal(false);
    setShowSignUpModal(true);
  };


  return (
    <div className="min-h-screen bg-white">
      {/* Top Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: '84px',
          backgroundColor: isScrolled ? '#0C0B5D' : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          boxShadow: isScrolled ? '0 2px 12px rgba(0,0,0,0.15)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 pt-4 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/favicon.png"
                alt="SINAG logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <div className="text-white font-bold text-xl leading-tight">SINAG</div>
                <div className="text-white/70 text-xs">UPLB SESAM</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-white text-[15px] font-medium transition-all relative group"
              style={{ opacity: 0.9 }}
            >
              Home
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#about"
              className="text-white text-[15px] font-medium transition-all relative group"
              style={{ opacity: 0.9 }}
            >
              About
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#features"
              className="text-white text-[15px] font-medium transition-all relative group"
              style={{ opacity: 0.9 }}
            >
              Features
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#programs"
              className="text-white text-[15px] font-medium transition-all relative group"
              style={{ opacity: 0.9 }}
            >
              Programs
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0.5 bg-[#10B981] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <button
              onClick={openLoginModal}
              className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-all border border-white/50 hover:border-white hover:bg-white/10"
            >
              Login
            </button>
            <button
              onClick={openSignUpModal}
              className="px-5 py-2 bg-white text-[#0C0B5D] text-sm font-semibold rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute top-0 right-0 h-full w-64 bg-[#0C0B5D] shadow-xl p-6 flex flex-col gap-6">
            <button
              className="self-end text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <a href="#home" className="text-white text-base font-medium">Home</a>
            <a href="#about" className="text-white text-base font-medium">About</a>
            <a href="#features" className="text-white text-base font-medium">Features</a>
            <a href="#programs" className="text-white text-base font-medium">Programs</a>
            <button
              onClick={() => { openLoginModal(); setIsMobileMenuOpen(false); }}
              className="px-5 py-2 text-white text-sm font-medium rounded-lg border-2 border-white/50"
            >
              Login
            </button>
            <button
              onClick={() => { openSignUpModal(); setIsMobileMenuOpen(false); }}
              className="px-5 py-2 bg-white text-[#0C0B5D] text-sm font-semibold rounded-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative bg-[#0C0B5D] text-white overflow-hidden min-h-screen">
        {/* Background: Official SESAM building photograph from sesam.uplb.edu.ph */}
        <div className="absolute inset-0">
          <Image
            src="https://sesam.uplb.edu.ph/wp-content/uploads/2024/04/SESAM-building.png"
            alt="UPLB School of Environmental Science and Management (SESAM) building"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            style={{ filter: 'brightness(0.55) saturate(0.9)' }}
          />
          {/* Primary brand veil — indigo dominant for strong, professional brand presence */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(12,11,93,0.96) 0%, rgba(12,11,93,0.88) 42%, rgba(12,11,93,0.62) 70%, rgba(12,11,93,0.48) 100%)',
            }}
          />
          {/* Soft indigo radial highlight to add depth without noise */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 75% 40%, rgba(63,61,180,0.35) 0%, transparent 65%)',
            }}
          />
          {/* Bottom fade to next section */}
          <div
            className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(12,11,93,0.85))' }}
          />
        </div>

        {/* Top gradient overlay for navbar */}
        {!isScrolled && (
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none transition-opacity duration-300"
            style={{
              height: '140px',
              background: 'linear-gradient(to bottom, rgba(12,11,93,0.75) 0%, rgba(12,11,93,0.40) 50%, transparent 100%)',
              zIndex: 10
            }}
          ></div>
        )}

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-24 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-5">
                {/* Academic eyebrow ribbon — explicit SESAM origin */}
                <div className="inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/95">
                    <Building className="w-3.5 h-3.5 text-[#0C0B5D]" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/95">
                    A SESAM Initiative · UPLB
                  </span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.45)' }}>
                  SINAG
                </h1>
                {/* Brand underline — clean white bar, single subtle accent */}
                <div className="flex items-center gap-2">
                  <div className="h-[3px] w-20 bg-white rounded-full"></div>
                  <div className="h-[3px] w-2 bg-white/40 rounded-full"></div>
                </div>
                {/* SESAM lockup beneath the wordmark */}
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70">
                  Built for the School of Environmental Science and Management
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-lg sm:text-xl font-bold text-white">
                  SESAM Intelligent Natural-language Advising Guide
                </p>
                <p className="text-base leading-relaxed max-w-[480px] text-white/90">
                  Shape the Future of Environmental Science. Your AI-powered companion for graduate advising at UPLB SESAM. Streamline your academic journey with intelligent milestone tracking, document management, and personalized AI consultation.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={openSignUpModal}
                  className="flex items-center gap-2 px-10 py-4 bg-white text-[#0C0B5D] rounded-xl font-bold text-lg border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </button>
                <a 
                  href="#about"
                  className="flex items-center gap-2 px-6 py-3 bg-transparent text-white rounded-lg hover:bg-white/10 transition-colors font-semibold text-base border border-white/30"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Trust Indicators & Stats - Glass Effect */}
              <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-4 pb-6">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-6 h-6 text-white" />
                    <span className="text-xs font-semibold text-center text-white">Secure & Private</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Brain className="w-6 h-6 text-white" />
                    <span className="text-xs font-semibold text-center text-white">AI-Powered</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Award className="w-6 h-6 text-white" />
                    <span className="text-xs font-semibold text-center text-white">UPLB Official</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mb-6 bg-white/20"></div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-[32px] font-bold text-white mb-1">500+</div>
                    <div className="text-xs uppercase tracking-wide text-white/75">Graduate Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-[32px] font-bold text-white mb-1">50+</div>
                    <div className="text-xs uppercase tracking-wide text-white/75">Faculty Advisers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-[32px] font-bold text-white mb-1">4</div>
                    <div className="text-xs uppercase tracking-wide text-white/75">Degree Programs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards - Glass Effect */}
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[14px]">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-[#0C0B5D]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-white mb-2">AI-Powered Consultation</h3>
                    <p className="text-sm leading-relaxed text-white/85">
                      Get instant answers to your academic questions 24/7 with our intelligent chatbot trained on SESAM graduate program policies and procedures.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[14px]">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-[#0C0B5D]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-white mb-2">Smart Milestone Tracking</h3>
                    <p className="text-sm leading-relaxed text-white/85">
                      Track your progress from enrollment to graduation with automated reminders for proposal defense, comprehensive exams, and final defense.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[14px]">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-[#0C0B5D]" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-white mb-2">Document Management</h3>
                    <p className="text-sm leading-relaxed text-white/85">
                      Organize thesis chapters, IRB applications, and progress reports with version control and real-time collaboration with your adviser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SINAG Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C0B5D]/10 rounded-full border-2 border-[#0C0B5D] mb-4">
              <Star className="w-5 h-5 text-[#0C0B5D]" />
              <span className="text-sm font-bold text-[#0C0B5D]">Why Choose SINAG?</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Transform Your Graduate Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of graduate advising with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-4 border-blue-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-blue-300">
                <Zap className="w-10 h-10 text-blue-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant answers to your academic questions. No more waiting days for email responses. SINAG AI responds in seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-4 border-[#0C0B5D]/30 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-[#0C0B5D]/10 rounded-2xl flex items-center justify-center mb-6 border-2 border-[#0C0B5D]/30">
                <Brain className="w-10 h-10 text-[#0C0B5D]" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Intelligent Guidance</h3>
              <p className="text-gray-600 leading-relaxed">
                Trained on SESAM policies and best practices. Get personalized recommendations for your research journey.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-4 border-purple-200 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 border-2 border-purple-300">
                <Heart className="w-10 h-10 text-purple-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Student-Centered</h3>
              <p className="text-gray-600 leading-relaxed">
                Designed with students in mind. Track progress, manage documents, and stay organized throughout your degree.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C0B5D]/10 rounded-full border-2 border-[#0C0B5D] mb-4">
              <Building className="w-5 h-5 text-[#0C0B5D]" />
              <span className="text-sm font-bold text-[#0C0B5D]">About SINAG</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">Revolutionizing Graduate Education</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering graduate education at UPLB SESAM through intelligent technology
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-200 transform hover:scale-105 transition-transform">
              <div className="aspect-video bg-gradient-to-br from-[#0C0B5D] to-[#0C0B5D] flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Building className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-2xl font-bold">SESAM Building</p>
                  <p className="text-white/70">School of Environmental Science and Management</p>
                </div>
              </div>
              <div className="absolute inset-0 border-4 border-white/20"></div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-5 p-6 bg-blue-50 rounded-2xl border-4 border-blue-200 shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">AI-Powered Consultation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Get instant answers to academic questions with our intelligent natural language assistant trained on SESAM policies and best practices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-[#0C0B5D]/5 rounded-2xl border-4 border-[#0C0B5D]/20 shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-14 h-14 bg-[#0C0B5D] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Milestone Tracking</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Track your progress through comprehensive milestone management, from proposal defense to final dissertation submission.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 p-6 bg-purple-50 rounded-2xl border-4 border-purple-200 shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Document Management</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Organize thesis chapters, IRB applications, and progress reports with version control and collaborative review features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for SESAM graduate programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="p-6 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <GraduationCap className="w-7 h-7 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Students</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Track milestones and deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Get AI-powered research guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Manage documents & versions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Communicate with advisers</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-[#0C0B5D]/30 hover:border-[#0C0B5D] transition-colors shadow-sm">
              <div className="w-14 h-14 bg-[#0C0B5D]/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-[#0C0B5D]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Advisers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Monitor advisee progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Review & approve documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Provide timely feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Track multiple advisees</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-colors shadow-sm">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Coordinators</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Program-wide analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Manage defense schedules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Student success tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#0C0B5D] flex-shrink-0 mt-0.5" />
                  <span>Accreditation reporting</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-colors shadow-sm">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-orange-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Consultation</h3>
              <p className="text-gray-600 mb-3">Natural language interface for instant academic guidance</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Research methodology advice</li>
                <li>• Statistical test selection</li>
                <li>• Academic policy queries</li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-colors shadow-sm">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-pink-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaboration</h3>
              <p className="text-gray-600 mb-3">Seamless communication between students and advisers</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Document comments</li>
                <li>• Meeting scheduling</li>
                <li>• Progress discussions</li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-colors shadow-sm">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Security</h3>
              <p className="text-gray-600 mb-3">Enterprise-grade security and privacy protection</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• SSO authentication</li>
                <li>• Encrypted data storage</li>
                <li>• Role-based access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">SESAM Graduate Programs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Supporting all UPLB SESAM degree programs with specialized workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl border-2 border-[#0C0B5D] shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0C0B5D] rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">M.S. in Environmental Science</h3>
                  <p className="text-gray-600 mb-3">
                    Comprehensive research training in environmental science with thesis or non-thesis options
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>2-3 years completion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-[#0C0B5D] shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0C0B5D] rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ph.D. in Environmental Science</h3>
                  <p className="text-gray-600 mb-3">
                    Advanced research degree preparing scholars for academic and research careers
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>3-5 years completion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ph.D. in Environmental Diplomacy and Negotiations</h3>
                  <p className="text-gray-600 mb-3">
                    Specialized program focusing on environmental policy and international relations
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>3-5 years completion</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-xl border-2 border-purple-500 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Masters in Tropical Marine Ecosystems Management (PM-TMEM)</h3>
                  <p className="text-gray-600 mb-3">
                    Professional degree for marine ecosystem conservation and management
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>2 years completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SESAM Building Showcase Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0C0B5D]/10 rounded-full border-2 border-[#0C0B5D] mb-4">
              <School className="w-5 h-5 text-[#0C0B5D]" />
              <span className="text-sm font-bold text-[#0C0B5D]">Our Campus</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">World-Class Facilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SESAM provides state-of-the-art facilities for environmental research and learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#0C0B5D] to-[#0C0B5D] flex items-center justify-center">
                <Building className="w-20 h-20 text-white/50" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white mb-1">SESAM Main Building</h3>
                <p className="text-white/80 text-sm">Home to cutting-edge research laboratories</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                <Leaf className="w-20 h-20 text-white/50" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white mb-1">Research Stations</h3>
                <p className="text-white/80 text-sm">Field research facilities across the Philippines</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center">
                <Globe className="w-20 h-20 text-white/50" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white mb-1">Collaboration Spaces</h3>
                <p className="text-white/80 text-sm">Modern spaces for interdisciplinary research</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 bg-[#0C0B5D] text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-gradient-to-br from-[#0C0B5D] via-[#0C0B5D] to-[#0C0B5D]"
            style={{ filter: 'brightness(0.65)' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)' }}>Ready to Transform Your Graduate Journey?</h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-8" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5), 0 3px 12px rgba(0,0,0,0.3)' }}>
            Join hundreds of SESAM students and faculty using SINAG to streamline academic advising
          </p>
          <button
            onClick={openSignUpModal}
            className="px-8 sm:px-10 py-4 bg-white text-[#0C0B5D] rounded-xl hover:bg-gray-100 transition-colors font-bold text-lg border-2 border-white inline-flex items-center gap-2 shadow-xl"
          >
            Access SINAG Platform
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/favicon.png"
                  alt="SINAG logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <div>
                  <div className="text-xl font-bold">SINAG</div>
                  <div className="text-xs text-gray-400">UPLB SESAM</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                School of Environmental Science and Management<br />
                University of the Philippines Los Baños<br />
                College, Los Baños, Laguna 4031
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://sesam.uplb.edu.ph/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SESAM Website</a></li>
                <li><a href="https://uplb.edu.ph/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">UPLB Homepage</a></li>
                <li><a href="#programs" className="hover:text-white transition-colors">Graduate Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  sesam.uplb@up.edu.ph
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (049) 536-2509
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mon-Fri, 8AM-5PM
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 SINAG - SESAM Intelligent Natural-language Advising Guide. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Sign Up Modal */}
      <RegisterModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} />

      {/* AI Chatbot */}
      {/* Chat Bubble Button */}
      <button
        onClick={handleChatOpen}
        className={`fixed bottom-6 right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-50 ${showPulse && !isChatOpen ? 'animate-pulse' : ''}`}
        style={{ display: isChatOpen ? 'none' : 'flex' }}
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[540px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between h-15 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">SINAG Assistant</div>
                <div className="text-white/70 text-xs">Ask me about applying to SESAM</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white min-h-0">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center mr-2 flex-shrink-0">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    msg.type === 'user'
                      ? 'bg-[#0F172A] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
                      : 'bg-[#F1F5F9] text-[#0F172A] rounded-tl-xl rounded-tr-xl rounded-br-xl'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center mr-2 flex-shrink-0">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#F1F5F9] px-4 py-2 rounded-tl-xl rounded-tr-xl rounded-br-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reply Chips */}
          {chatMessages.length === 1 && !isTyping && (
            <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => handleQuickReply("What programs does SESAM offer?")}
                className="px-3 py-1.5 bg-white text-[#0F172A] text-xs rounded-full border border-gray-300 hover:border-[#10B981] hover:bg-[#10B981]/10 transition-colors"
              >
                What programs?
              </button>
              <button
                onClick={() => handleQuickReply("Admission requirements")}
                className="px-3 py-1.5 bg-white text-[#0F172A] text-xs rounded-full border border-gray-300 hover:border-[#10B981] hover:bg-[#10B981]/10 transition-colors"
              >
                Requirements
              </button>
              <button
                onClick={() => handleQuickReply("Application deadlines")}
                className="px-3 py-1.5 bg-white text-[#0F172A] text-xs rounded-full border border-gray-300 hover:border-[#10B981] hover:bg-[#10B981]/10 transition-colors"
              >
                Deadlines
              </button>
              <button
                onClick={() => handleQuickReply("Contact SESAM")}
                className="px-3 py-1.5 bg-white text-[#0F172A] text-xs rounded-full border border-gray-300 hover:border-[#10B981] hover:bg-[#10B981]/10 transition-colors"
              >
                Contact
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about SESAM programs, admissions, or deadlines..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#10B981]"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 bg-[#10B981] text-white rounded-lg flex items-center justify-center hover:bg-[#0d9668] transition-colors flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
