export const healthcareTemplate = {
  settings: {
    fontFamily: 'Inter',
    borderRadius: '1rem',
    navbar: {
      items: [
        { text: 'Services', link: '#services' },
        { text: 'Doctors', link: '#doctors' },
        { text: 'Contact', link: '#contact' }
      ],
      ctaText: 'Book Appointment',
      ctaLink: '#contact',
      ctaColor: '#0ea5e9',
      transparent: false,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'Modern Medical Care You Can Trust',
        subheadline: 'Providing comprehensive healthcare services with a team of experienced professionals dedicated to your well-being.',
        ctaText: 'Schedule a Visit',
        ctaLink: '#contact',
        darkText: true,
        backgroundType: 'gradient', // gradient, image, solid
        backgroundColor: '#f0f9ff',
        showDoctorImage: true,
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
      }
    },
    {
      id: 'services-1',
      type: 'services',
      active: true,
      content: {
        title: 'Our Medical Services',
        subtitle: 'We offer a wide range of specialized treatments to meet all your healthcare needs.',
        layout: 'grid',
        items: [
          { name: 'General Consultation', description: 'Comprehensive health assessments and personalized treatment plans for adults and children.', icon: 'Stethoscope' },
          { name: 'Pediatrics', description: 'Specialized healthcare for infants, children, and adolescents in a friendly environment.', icon: 'Baby' },
          { name: 'Laboratory Tests', description: 'Advanced diagnostic testing and fast, accurate results to monitor your health.', icon: 'FlaskConical' }
        ]
      }
    },
    {
      id: 'doctors-1',
      type: 'doctors',
      active: true,
      content: {
        title: 'Meet Our Specialists',
        subtitle: 'Our team of board-certified doctors is here to provide you with the best medical care.',
        items: [
          { name: 'Dr. Sarah Wilson', designation: 'Senior Cardiologist', experience: '15+ Years', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400' },
          { name: 'Dr. Michael Chen', designation: 'Pediatric Surgeon', experience: '12+ Years', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Book Your Appointment',
        subtitle: 'Select a time that works for you and our team will confirm your visit.',
        formId: '', // To be selected from existing forms
        buttonText: 'Submit Inquiry',
        backgroundColor: '#ffffff'
      }
    }
  ]
};

export const educationTemplate = {
  settings: {
    fontFamily: 'Inter',
    borderRadius: '1.5rem',
    navbar: {
      items: [
        { text: 'Programs', link: '#courses' },
        { text: 'About Us', link: '#about' },
        { text: 'Faculty', link: '#faculty' },
        { text: 'Testimonials', link: '#testimonials' }
      ],
      ctaText: 'Apply Now',
      ctaLink: '#contact',
      ctaColor: '#4f46e5',
      transparent: false,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'Empowering Minds For A Brighter Future',
        subheadline: 'Join our world-class academic programs designed to unlock your potential and prepare you for global success.',
        ctaText: 'Explore Programs',
        ctaLink: '#courses',
        darkText: true,
        backgroundType: 'gradient',
        backgroundColor: '#f8fafc',
        showDoctorImage: true,
        image: 'https://images.unsplash.com/photo-1523050335192-ce1dee71a01f?auto=format&fit=crop&q=80&w=800'
      }
    },
    {
      id: 'courses-1',
      type: 'courses',
      active: true,
      content: {
        title: 'Our Featured Programs',
        subtitle: 'Comprehensive courses tailored to industry standards and academic excellence.',
        items: [
          { name: 'Computer Science', duration: '4 Years', description: 'Advanced studies in algorithms, software engineering, and artificial intelligence.', icon: 'Laptop' },
          { name: 'Business Management', duration: '3 Years', description: 'Mastering leadership, finance, and marketing strategies for the modern world.', icon: 'BarChart' },
          { name: 'Digital Arts', duration: '2 Years', description: 'Unleashing creativity through modern design tools and visual storytelling.', icon: 'Palette' }
        ]
      }
    },
    {
      id: 'features-1',
      type: 'features',
      active: true,
      content: {
        title: 'Why Choose Our Institute?',
        items: [
          { title: 'Expert Faculty', description: 'Learn from industry veterans and PhD holders with years of academic experience.', icon: 'Star' },
          { title: 'Infrastructure', description: 'Modern classrooms, high-tech labs, and a vibrant campus life for rounded growth.', icon: 'Shield' },
          { title: 'Proven Results', description: 'Over 95% placement rate and alumni working in top global companies.', icon: 'Target' }
        ]
      }
    },
    {
      id: 'faculty-1',
      type: 'faculty',
      active: true,
      content: {
        title: 'Meet Our Distinguished Faculty',
        subtitle: 'Our mentors bring academic rigor and practical insights to the classroom.',
        items: [
          { name: 'Prof. John Doe', designation: 'Head of AI Dept', experience: '20+ Years', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', subject: 'Artificial Intelligence' },
          { name: 'Dr. Emily Smith', designation: 'Senior Lecturer', experience: '15+ Years', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', subject: 'Quantum Physics' }
        ]
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      active: true,
      content: {
        title: 'Student Success Stories',
        subtitle: 'Hear from our alumni who are making an impact across the globe.',
        items: [
          { name: 'Alex Johnson', text: 'This institute gave me the foundation I needed to excel in my career at Google.', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
          { name: 'Sarah Miller', text: 'The hands-on projects and faculty support were instrumental in my growth.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Apply For Admission',
        subtitle: 'Fill out the form below to start your journey with us today.',
        formId: '',
        buttonText: 'Submit Application',
        backgroundColor: '#ffffff'
      }
    }
  ]
};

export const realEstateTemplate = {
  settings: {
    fontFamily: 'Outfit',
    borderRadius: '0.25rem',
    navbar: {
      items: [
        { text: 'Projects', link: '#projects' },
        { text: 'Amenities', link: '#amenities' },
        { text: 'Location', link: '#location' },
        { text: 'Gallery', link: '#gallery' }
      ],
      ctaText: 'Enquire Now',
      ctaLink: '#contact',
      ctaColor: '#1a1a1a',
      transparent: true,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'Discover Luxury Living At Its Finest',
        subheadline: 'A curated collection of bespoke residences designed for the discerning few. Experience architectural excellence and unparalleled comfort.',
        ctaText: 'View Residences',
        ctaLink: '#projects',
        backgroundType: 'image',
        backgroundImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000',
        showDoctorImage: false,
        image: ''
      }
    },
    {
      id: 'projects-1',
      type: 'projects',
      active: true,
      content: {
        title: 'Our Signature Projects',
        subtitle: 'Explore our portfolio of premium developments across prime locations.',
        items: [
          { name: 'Azure Heights', location: 'Downtown Central', price: 'Starting $2.5M', status: 'Ready to Move', photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
          { name: 'Botanica Residences', location: 'Green Valley', price: 'Starting $1.8M', status: 'New Launch', photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
          { name: 'The Onyx Tower', location: 'Marina District', price: 'Starting $3.2M', status: 'Upcoming', photo: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    },
    {
      id: 'highlights-1',
      type: 'features',
      active: true,
      content: {
        title: 'Unmatched Lifestyle Amenities',
        items: [
          { title: 'Infinity Pool', description: 'Temperature-controlled pool with panoramic city views.', icon: 'Waves' },
          { title: 'Private Cinema', description: 'State-of-the-art screening room for exclusive entertainment.', icon: 'Film' },
          { title: 'Concierge 24/7', description: 'Personalized assistance for your every need, anytime.', icon: 'UserCheck' }
        ]
      }
    },
    {
      id: 'gallery-1',
      type: 'gallery',
      active: true,
      content: {
        title: 'Visual Journey',
        subtitle: 'Take a closer look at the craftsmanship and detail in every corner.',
        items: [
          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&q=80&w=800'
        ]
      }
    },
    {
      id: 'location-1',
      type: 'map',
      active: true,
      content: {
        title: 'The Perfect Location',
        address: 'Prime District 1, Luxury Street, Metro City',
        mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1672300000000!5m2!1sen!2sin',
        nearby: [
          { name: 'International Airport', distance: '15 Mins' },
          { name: 'Business Hub', distance: '10 Mins' },
          { name: 'Top Schools', distance: '5 Mins' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Interest Registration',
        subtitle: 'Our luxury consultants will get in touch for a private viewing.',
        formId: '',
        buttonText: 'Request Brochure',
        backgroundColor: '#1a1a1a'
      }
    }
  ]
};

export const professionalServicesTemplate = {
  settings: {
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    navbar: {
      items: [
        { text: 'Services', link: '#services' },
        { text: 'Expertise', link: '#expertise' },
        { text: 'Team', link: '#team' },
        { text: 'Reviews', link: '#testimonials' }
      ],
      ctaText: 'Book Consultation',
      ctaLink: '#contact',
      ctaColor: '#1e293b',
      transparent: false,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'Strategic Guidance For Your Business Growth',
        subheadline: 'We help organizations navigate complex challenges with data-driven insights and professional expertise.',
        ctaText: 'Get Started',
        ctaLink: '#contact',
        secondaryCtaText: 'Our Expertise',
        secondaryCtaLink: '#expertise',
        tagline: '• Expert Advisory',
        darkText: true,
        backgroundType: 'gradient',
        backgroundColor: '#f8fafc',
        showDoctorImage: false
      }
    },
    {
      id: 'services-1',
      type: 'services',
      active: true,
      content: {
        title: 'Our Specialist Services',
        items: [
          { name: 'Business Strategy', description: 'Developing long-term roadmaps for sustainable growth and competitive advantage.', icon: 'Briefcase' },
          { name: 'Financial Advisory', description: 'Optimizing fiscal health with expert accounting and tax planning services.', icon: 'BarChart3' },
          { name: 'Legal Consulting', description: 'Comprehensive legal support for corporate compliance and risk management.', icon: 'Scale' }
        ]
      }
    },
    {
      id: 'expertise-1',
      type: 'features',
      active: true,
      content: {
        title: 'Our Pillar of Expertise',
        items: [
          { title: 'Industry Experience', description: 'Over 20 years of collective experience across diverse sectors.', icon: 'GraduationCap' },
          { title: 'Global Network', description: 'Access to international markets and strategic partnerships.', icon: 'Globe' },
          { title: 'Client First', description: 'Tailored solutions that prioritize your unique business objectives.', icon: 'Heart' }
        ]
      }
    },
    {
      id: 'team-1',
      type: 'faculty',
      active: true,
      content: {
        title: 'Meet Our Advisors',
        items: [
          { name: 'Robert Vance', designation: 'Managing Partner', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
          { name: 'Sarah Jenkins', designation: 'Financial Director', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      active: true,
      content: {
        title: 'Client Success Stories',
        subtitle: 'Hear from the leaders we have partnered with to drive impact.',
        items: [
          { name: 'James Wilson', text: 'Their strategic insights transformed our operational efficiency within months.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Strategic Consultation',
        subtitle: 'Request a preliminary meeting to discuss your business goals.',
        formId: '',
        buttonText: 'Book Now'
      }
    }
  ]
};

export const localServicesTemplate = {
  settings: {
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    navbar: {
      items: [
        { text: 'Services', link: '#services' },
        { text: 'Process', link: '#process' },
        { text: 'Area', link: '#area' },
        { text: 'Reviews', link: '#reviews' }
      ],
      ctaText: 'Call Now',
      ctaLink: 'tel:+1234567890',
      ctaColor: '#dc2626',
      transparent: false,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'Reliable Repair Services In Your Neighborhood',
        subheadline: 'Expert technicians available 24/7 for all your home and office maintenance needs.',
        ctaText: 'Schedule Service',
        ctaLink: '#contact',
        secondaryCtaText: 'Call Now',
        secondaryCtaLink: 'tel:+1234567890',
        tagline: '• 24/7 Support',
        darkText: true,
        backgroundType: 'gradient',
        backgroundColor: '#fffbeb',
        showDoctorImage: false
      }
    },
    {
      id: 'services-1',
      type: 'services',
      active: true,
      content: {
        title: 'Expert Solutions',
        items: [
          { name: 'Emergency Repairs', description: 'Fast response for urgent issues that need immediate attention.', icon: 'Zap' },
          { name: 'Scheduled Maintenance', description: 'Regular check-ups to keep your systems running efficiently.', icon: 'Clock' },
          { name: 'Installations', description: 'Professional setup of new equipment with quality guarantee.', icon: 'Wrench' }
        ]
      }
    },
    {
      id: 'area-1',
      type: 'map',
      active: true,
      content: {
        title: 'We Serve Your Area',
        address: 'Covering Downtown, West Side, and surrounding suburbs.',
        mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1672300000000!5m2!1sen!2sin',
        nearby: [
          { name: 'Downtown Core', distance: '15 Min Response' },
          { name: 'North Suburbs', distance: '30 Min Response' }
        ]
      }
    },
    {
      id: 'trust-1',
      type: 'features',
      active: true,
      content: {
        title: 'Why Neighbors Trust Us',
        items: [
          { title: 'Licensed & Insured', description: 'Fully certified professionals you can rely on.', icon: 'ShieldCheck' },
          { title: 'Fast Response', description: 'Were always nearby and ready to help.', icon: 'Zap' },
          { title: 'Fair Pricing', description: 'Transparent quotes with no hidden costs.', icon: 'Tag' }
        ]
      }
    },
    {
      id: 'reviews-1',
      type: 'testimonials',
      active: true,
      content: {
        title: 'Customer Reviews',
        subtitle: 'See what your neighbors are saying about our work.',
        items: [
          { name: 'Linda K.', text: 'Fast, professional, and very reasonably priced. Highly recommended!', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Get A Free Quote',
        subtitle: 'Tell us about your project and we will get back to you immediately.',
        formId: '',
        buttonText: 'Get Quote'
      }
    }
  ]
};

export const eventTemplate = {
  settings: {
    fontFamily: 'Outfit',
    borderRadius: '2rem',
    navbar: {
      items: [
        { text: 'Speakers', link: '#speakers' },
        { text: 'Agenda', link: '#agenda' },
        { text: 'Venue', link: '#venue' }
      ],
      ctaText: 'Register Now',
      ctaLink: '#contact',
      ctaColor: '#8b5cf6',
      transparent: true,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'The Annual Tech Innovation Summit',
        subheadline: 'Join 500+ leaders and pioneers for a day of transformative ideas and networking. October 15-16, City Hall.',
        ctaText: 'Claim Your Seat',
        ctaLink: '#contact',
        secondaryCtaText: 'View Agenda',
        secondaryCtaLink: '#agenda',
        tagline: '• Oct 15-16',
        backgroundType: 'image',
        backgroundImage: 'https://images.unsplash.com/photo-1540575861501-7ad0582373f2?auto=format&fit=crop&q=80&w=2000',
        showDoctorImage: false
      }
    },
    {
      id: 'speakers-1',
      type: 'faculty',
      active: true,
      content: {
        title: 'Featured Speakers',
        items: [
          { name: 'Dr. Jane Foster', designation: 'CTO, TechCorp', photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400' },
          { name: 'Mark Stevens', designation: 'Futurist & Author', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' }
        ]
      }
    },
    {
      id: 'agenda-1',
      type: 'agenda',
      active: true,
      content: {
        title: 'Event Agenda',
        subtitle: 'A full day of learning, sharing, and innovation.',
        items: [
          { time: '09:00 AM', title: 'Opening Keynote', description: 'Future of Technology in the Modern Age by Dr. Jane Foster.' },
          { time: '11:30 AM', title: 'Panel Discussion', description: 'Adapting to AI-driven markets with industry leaders.' },
          { time: '02:00 PM', title: 'Workshop Sessions', description: 'Hands-on training in strategic brand positioning.' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Secure Your Pass',
        subtitle: 'Final few seats available. Register today for early-bird pricing.',
        formId: '',
        buttonText: 'Register Now'
      }
    }
  ]
};

export const agencyTemplate = {
  settings: {
    fontFamily: 'Outfit',
    borderRadius: '0',
    navbar: {
      items: [
        { text: 'Work', link: '#portfolio' },
        { text: 'Services', link: '#services' },
        { text: 'About', link: '#about' }
      ],
      ctaText: 'Get Proposal',
      ctaLink: '#contact',
      ctaColor: '#000000',
      transparent: true,
      sticky: true
    }
  },
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      active: true,
      content: {
        headline: 'We Build Brands That Demand Attention',
        subheadline: 'A creative agency focusing on high-end design, digital experiences, and strategic growth.',
        ctaText: 'Get Proposal',
        ctaLink: '#contact',
        secondaryCtaText: 'Our Services',
        secondaryCtaLink: '#services',
        tagline: '• Award Winning',
        backgroundType: 'image',
        backgroundImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000',
        showDoctorImage: false
      }
    },
    {
      id: 'portfolio-1',
      type: 'projects',
      active: true,
      content: {
        title: 'Selected Works',
        items: [
          { name: 'Nike Vision', location: 'Brand Identity', price: '2023', photo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800' },
          { name: 'Apple Ecosystem', location: 'UI/UX Design', price: '2023', photo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    },
    {
      id: 'stats-1',
      type: 'results',
      active: true,
      content: {
        items: [
          { label: 'Revenue Growth', value: '450%' },
          { label: 'Clients Served', value: '120+' },
          { label: 'Awards Won', value: '15' },
          { label: 'Campaigns Run', value: '2k' }
        ]
      }
    },
    {
      id: 'testimonials-1',
      type: 'testimonials',
      active: true,
      content: {
        title: 'Partners in Success',
        subtitle: 'Innovative brands we have helped scale.',
        items: [
          { name: 'Michael Ross', text: 'Their creative approach redefined our brand identity for the better.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
        ]
      }
    },
    {
      id: 'form-1',
      type: 'form',
      active: true,
      content: {
        title: 'Start Your Growth Journey',
        subtitle: 'Tell us about your brand and let us build something amazing together.',
        formId: '',
        buttonText: 'Book Discovery Call'
      }
    }
  ]
};

export const defaultContent = {
  Healthcare: healthcareTemplate,
  Education: educationTemplate,
  'Real Estate': realEstateTemplate,
  'Professional Services': professionalServicesTemplate,
  'Local Services': localServicesTemplate,
  Events: eventTemplate,
  Agencies: agencyTemplate
};
