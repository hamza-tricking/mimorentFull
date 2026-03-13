'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: any;
}

const translations = {
  en: {
    navbar: {
      home: "Home",
      about: "About",
      service: "Service",
      price: "Price",
      promo: "Promo",
      login: "Login",
      language: "Language"
    },
    hero: {
      title: "Find Your Perfect Rental Space",
      subtitle: "Discover modern living spaces designed for comfort and style",
      phoneNumber: "Phone Number",
      contactUs: "Contact Us"
    },
    gallery: {
      title: "Discover Our Spaces",
      subtitle: "Explore our curated collection of modern living spaces, each designed with attention to detail and style",
      modernDesign: "Modern Design",
      modernDescription: "Contemporary living spaces with clean lines and minimalist aesthetics",
      luxuryLiving: "Luxury Living",
      luxuryDescription: "Premium spaces with high-end finishes and sophisticated design",
      minimalistLiving: "Minimalist Living",
      minimalistDescription: "Clean, uncluttered spaces that promote tranquility and style"
    },
    about: {
      title: "About MIMO RENT",
      subtitle: "Your trusted partner for premium rental spaces",
      description: "We specialize in providing high-quality rental properties that combine comfort, style, and functionality. Our carefully curated spaces are designed to meet the diverse needs of modern residents.",
      features: {
        quality: "Quality Properties",
        qualityDesc: "Each property is carefully selected and maintained to the highest standards.",
        service: "Excellent Service",
        serviceDesc: "Our dedicated team is committed to providing exceptional customer service.",
        location: "Prime Locations",
        locationDesc: "Strategically located properties in desirable neighborhoods."
      },
      values: {
        qualityTitle: "Quality Assurance",
        qualityDesc: "Every property meets our high standards for quality and comfort",
        customerTitle: "Customer Focus",
        customerDesc: "Your satisfaction is our top priority, every step of the way",
        serviceTitle: "Quick Service",
        serviceDesc: "Fast response times and efficient processes for your convenience"
      }
    },
    footer: {
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      description: "Your trusted partner for finding the perfect living space. Modern homes, exceptional service, and unbeatable prices in prime locations.",
      quickLinks: "Quick Links",
      getInTouch: "Get In Touch",
      phone: "Phone",
      email: "Email",
      address: "Address",
      businessHours: "Business Hours",
      aboutUs: "About Us",
      properties: "Properties",
      services: "Services",
      contact: "Contact"
    },
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account",
      username: "Username",
      usernamePlaceholder: "Enter your username",
      email: "Email Address",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signIn: "Sign In",
      signingIn: "Signing in...",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      errors: {
        usernameRequired: "Username is required",
        usernameMinLength: "Username must be at least 3 characters",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
        loginFailed: "Login failed. Please try again.",
        networkError: "Network error. Please check your connection and try again."
      }
    },
    dashboard: {
      title: "Admin Dashboard",
      welcome: "Welcome back",
      logout: "Logout",
      totalUsers: "Total Users",
      activeBookings: "Active Bookings",
      totalProperties: "Total Properties",
      revenue: "Revenue",
      recentActivity: "Recent Activity",
      noRecentActivity: "No recent activity to display.",
      startActivity: "Start managing your system from the sidebar."
    },
    admin: {
      adminPanel: "Admin Panel",
      overview: "Overview",
      properties: "Properties",
      offices: "Offices",
      users: "Users",
      bookings: "Bookings",
      reports: "Reports",
      pricing: "Pricing",
      wilayas: "Wilayas",
      settings: "Settings",
      logout: "Logout",
      dashboardOverview: "Dashboard Overview",
      totalProperties: "Total Properties",
      totalBookings: "Total Bookings",
      totalUsers: "Total Users",
      totalRevenue: "Total Revenue",
      recentBookings: "Recent Bookings",
      quickActions: "Quick Actions",
      addProperty: "Add Property",
      addUser: "Add User",
      viewReports: "View Reports",
      updatePricing: "Update Pricing",
      welcomeAdmin: "Welcome, Admin",
      sectionUnderDevelopment: "This section is under development",
      userManagement: "User Management",
      searchUsers: "Search users...",
      allRoles: "All Roles",
      admin: "Admin",
      sousAdmin: "Sous Admin",
      employee: "Employee",
      customer: "Customer",
      allStatuses: "All Statuses",
      active: "Active",
      inactive: "Inactive",
      usersFound: "users found",
      userInfo: "User Info",
      contact: "Contact",
      role: "Role",
      status: "Status",
      lastLogin: "Last Login",
      actions: "Actions",
      never: "Never",
      edit: "Edit",
      deactivate: "Deactivate",
      activate: "Activate",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this user?",
      noUsersFound: "No users found",
      editUser: "Edit User",
      modalComingSoon: "User form modal will be implemented here",
      cancel: "Cancel",
      success: "Success!",
      ok: "OK",
      title: "Title",
      enterTitle: "Enter property title",
      type: "Type",
      wilaya: "Wilaya", 
      enterWilaya: "Enter wilaya",
      description: "Description",
      enterDescription: "Enter property description",
      propertyManagement: "Property Management",
      searchProperties: "Search properties...",
      allTypes: "All Types",
      apartment: "Apartment",
      villa: "Villa",
      shop: "Shop",
      available: "Available",
      propertiesFound: "properties found",
      confirmDeleteProperty: "Are you sure you want to delete this property?",
      noPropertiesFound: "No properties found",
      editProperty: "Edit Property",
      propertyFormComingSoon: "Property form will be implemented here",
      officeManagement: "Office Management",
      searchOffices: "Search offices...",
      addOffice: "Add Office",
      editOffice: "Edit Office",
      officeName: "Office Name",
      selectOffice: "Select Office",
      manager: "Manager",
      selectManager: "Select Manager",
      address: "Address",
      street: "Street Address",
      city: "City",
      zipCode: "Zip Code",
      workingHours: "Working Hours",
      socialMedia: "Social Media",
      website: "Website",
      confirmDeleteOffice: "Are you sure you want to delete this office?",
      noOfficesFound: "No offices found",
      manageOffices: "Manage your real estate offices",
      activeRentals: "Active Rentals",
      userSatisfaction: "User Satisfaction",
      revenueOverview: "Revenue Overview",
      last7Days: "Last 7 days",
      last30Days: "Last 30 days",
      last3Months: "Last 3 months",
      newPropertyListed: "New property listed",
      rentalBookingConfirmed: "Rental booking confirmed",
      newUserRegistered: "New user registered",
      paymentReceived: "Payment received",
      propertyMaintenanceCompleted: "Property maintenance completed",
      hoursAgo: "hours ago",
      searchPlaceholder: "Search properties, users, bookings...",
      adminUser: "Admin User",
      welcomeBack: "Welcome back! Here's what's happening with your rental business today.",
      manageUsers: "إدارة المستخدمين",
      viewBookings: "عرض الحجوزات",
      generateReport: "إنشاء تقرير",
      officesWithUsers: "المكاتب مع المستخدمين",
      manageUsersHierarchy: "إدارة المستخدمين حسب التسلسل الهرمي",
      selectWilaya: "اختر ولاية",
      usersInOffice: "المستخدمون في المكتب",
      addUserToOffice: "إضافة مستخدم للمكتب",
      userName: "اسم المستخدم",
      enterUserName: "أدخل اسم المستخدم",
      userEmail: "البريد الإلكتروني",
      enterUserEmail: "أدخل البريد الإلكتروني",
      userRole: "دور المستخدم",
      selectUserRole: "اختر دور المستخدم",
      wilayaName: "Wilaya Name",
      enterWilayaName: "Enter wilaya name",
      imageUrlOptional: "Image URL (optional)",
      enterImageUrl: "Enter image URL",
      addWilaya: "Add Wilaya",
      phoneNumber: "Phone Number",
      enterPhone: "Enter office phone"
    }
  },
  ar: {
    navbar: {
      home: "الرئيسية",
      about: "من نحن",
      service: "الخدمات",
      price: "الأسعار",
      promo: "العروض",
      login: "تسجيل الدخول",
      language: "اللغة"
    },
    hero: {
      title: "اعثر على مساحة الإيجار المثالية لك",
      subtitle: "اكتشف مساحات معيشة حديثة مصممة للراحة والأناقة",
      phoneNumber:  "الهاتف ",
      contactUs: "تواصل معنا"
    },
    gallery: {
      title: "اكتشف مساحاتنا",
      subtitle: "استكشف مجموعتنا المختارة من مساحات المعيشة الحديثة، كل منها مصمم باهتمام بالتفاصيل والأسلوب",
      modernDesign: "تصميم حديث",
      modernDescription: "مساحات معيشة معاصرة بتصميم أنيق وبسيط",
      luxuryLiving: "معيشة فاخرة",
      luxuryDescription: "مساحات مميزة بلمسات راقية وتصميم متطور",
      minimalistLiving: "معيشة بسيطة",
      minimalistDescription: "مساحات نظيفة ومرتبة تعزز الهدوء والأناقة"
    },
    about: {
      title: "معلومات عن ميمو للإيجار",
      subtitle: "شريكك الموثوق لمساحات الإيجار المميزة",
      description: "نتخصص في توفير عقارات إيجار عالية الجودة تجمع بين الراحة والأناقة والوظائف. مساحاتنا المختارة بعناية مصممة لتلبية الاحتياجات المتنوعة للسكان الحديثين.",
      features: {
        quality: "عقارات عالية الجودة",
        qualityDesc: "كل عقار مختار وصيانته بأعلى المعايير.",
        service: "خدمة ممتازة",
        serviceDesc: "فريقنا المخصص ملتزم بتقديم خدمة عملاء استثنائية.",
        location: "مواقع رئيسية",
        locationDesc: "عقارات استراتيجية في أحياء مرغوبة."
      },
      values: {
        qualityTitle: "ضمان الجودة",
        qualityDesc: "كل عقار يلبي معاييرنا العالية للجودة والراحة",
        customerTitle: "التركيز على العميل",
        customerDesc: "رضاك هو أولويتنا القصوى، في كل خطوة على الطريق",
        serviceTitle: "خدمة سريعة",
        serviceDesc: "أوقات استجابة سريعة وعمليات فعالة لراحتك"
      }
    },
    footer: {
      rights: "جميع الحقوق محفوظة.",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      description: "شريكك الموثوق للعثور على مساحة المعيشة المثالية. منازل حديثة وخدمة استثنائية وأسعار لا تقبل المنافسة في مواقع رئيسية.",
      quickLinks: "روابط سريعة",
      getInTouch: "تواصل معنا",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      businessHours: "ساعات العمل",
      aboutUs: "من نحن",
      properties: "العقارات",
      services: "الخدمات",
      contact: "اتصل بنا"
    },
    login: {
      title: "مرحباً بعودتك",
      subtitle: "سجل الدخول إلى حسابك",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم المستخدم",
      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      rememberMe: "تذكرني",
      forgotPassword: "نسيت كلمة المرور؟",
      signIn: "تسجيل الدخول",
      signingIn: "جاري تسجيل الدخول...",
      noAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      errors: {
        usernameRequired: "اسم المستخدم مطلوب",
        usernameMinLength: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل",
        passwordRequired: "كلمة المرور مطلوبة",
        passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        loginFailed: "فشل تسجيل الدخول. حاول مرة أخرى.",
        networkError: "خطأ في الشبكة. تحقق من اتصالك وحاول مرة أخرى."
      }
    },
    dashboard: {
      title: "لوحة التحكم",
      welcome: "مرحباً بعودتك",
      logout: "تسجيل الخروج",
      totalUsers: "إجمالي المستخدمين",
      activeBookings: "الحجوزات النشطة",
      totalProperties: "إجمالي العقارات",
      revenue: "الإيرادات",
      recentActivity: "النشاط الأخير",
      noRecentActivity: "لا يوجد نشاط حديث لعرضه.",
      startActivity: "ابدأ في إدارة نظامك من الشريط الجانبي."
    },
    admin: {
      adminPanel: "لوحة التحكم",
      overview: "نظرة عامة",
      properties: "العقارات",
      offices: "المكاتب",
      users: "المستخدمون",
      bookings: "الحجوزات",
      reports: "التقارير",
      pricing: "التسعير",
      wilayas: "الولايات",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      dashboardOverview: "نظرة عامة على لوحة التحكم",
      totalProperties: "إجمالي العقارات",
      totalBookings: "إجمالي الحجوزات",
      totalUsers: "إجمالي المستخدمين",
      totalRevenue: "إجمالي الإيرادات",
      recentBookings: "الحجوزات الأخيرة",
      quickActions: "إجراءات سريعة",
      addProperty: "إضافة عقار",
      addUser: "إضافة مستخدم",
      viewReports: "عرض التقارير",
      updatePricing: "تحديث التسعير",
      welcomeAdmin: "مرحباً يا مدير",
      sectionUnderDevelopment: "هذا القسم قيد التطوير",
      userManagement: "إدارة المستخدمين",
      searchUsers: "البحث عن المستخدمين...",
      allRoles: "كل الأدوار",
      admin: "مدير",
      sousAdmin: "مدير مساعد",
      employee: "موظف",
      customer: "عميل",
      allStatuses: "كل الحالات",
      active: "نشط",
      inactive: "غير نشط",
      usersFound: "مستخدم تم العثور عليه",
      userInfo: "معلومات المستخدم",
      contact: "التواصل",
      role: "الدور",
      status: "الحالة",
      lastLogin: "آخر تسجيل دخول",
      actions: "الإجراءات",
      never: "أبداً",
      edit: "تعديل",
      deactivate: "إلغاء التنشيط",
      activate: "تنشيط",
      delete: "حذف",
      confirmDelete: "هل أنت متأكد من أنك تريد حذف هذا المستخدم؟",
      noUsersFound: "لم يتم العثور على مستخدمين",
      editUser: "تعديل المستخدم",
      modalComingSoon: "نموذج المستخدم سيتم تنفيذه هنا",
      cancel: "إلغاء",
      success: "نجاح!",
      ok: "موافق",
      title: "العنوان",
      enterTitle: "أدخل عنوان العقار",
      type: "النوع",
      wilaya: "الولاية", 
      enterWilaya: "أدخل الولاية",
      description: "الوصف",
      enterDescription: "أدخل وصف العقار",
      propertyManagement: "إدارة العقارات",
      searchProperties: "البحث عن العقارات...",
      allTypes: "كل الأنواع",
      apartment: "شقة",
      villa: "فيلا",
      shop: "محل",
      available: "متاح",
      propertiesFound: "عقارات تم العثور عليها",
      confirmDeleteProperty: "هل أنت متأكد من أنك تريد حذف هذا العقار؟",
      noPropertiesFound: "لم يتم العثور على عقارات",
      editProperty: "تعديل العقار",
      propertyFormComingSoon: "نموذج العقار سيتم تنفيذه هنا",
      officeManagement: "إدارة المكاتب",
      searchOffices: "البحث في المكاتب...",
      addOffice: "إضافة مكتب",
      addNewOffice: "إضافة مكتب جديد",
      addWilaya: "إضافة ولاية",
      updateWilaya: "تحديث الولاية",
      manageWilayas: "إدارة الولايات والمناطق",
      allWilayas: "جميع الولايات",
      addNewWilaya: "إضافة ولاية جديدة",
      image: "الصورة",
      wilayaName: "اسم الولاية",
      name: "الاسم",
      wilayaTableHeader: "اسم الولاية",
      enterWilayaName: "أدخل اسم الولاية",
      imageUrlOptional: "رابط الصورة (اختياري)",
      enterImageUrl: "أدخل رابط الصورة",
      editOffice: "تعديل المكتب",
      officeName: "اسم المكتب",
      enterOfficeName: "أدخل اسم المكتب",
      selectOffice: "اختر المكتب",
      manager: "المدير",
      selectManager: "اختيار المدير",
      address: "العنوان",
      enterAddress: "أدخل العنوان",
      phoneNumber: "رقم الهاتف",
      enterPhone: "أدخل رقم الهاتف",
      selectWilaya: "اختر ولاية",
      street: "عنوان الشارع",
      city: "المدينة",
      zipCode: "الرمز البريدي",
      workingHours: "ساعات العمل",
      socialMedia: "وسائل التواصل الاجتماعي",
      website: "الموقع الإلكتروني",
      confirmDeleteOffice: "هل أنت متأكد من أنك تريد حذف هذا المكتب؟",
      noOfficesFound: "لم يتم العثور على مكاتب",
      manageOffices: "إدارة المكاتب والمواقع",
      allOffices: "جميع المكاتب",
      noOfficesInWilaya: "لا توجد مكاتب في هذه الولاية",
      addFirstOffice: "أضف أول مكتب في",
      startAddingFirstOffice: "ابدأ بإضافة أول مكتب لإدارة مواقعك",
      activeRentals: "الإيجارات النشطة",
      userSatisfaction: "رضا المستخدم",
      revenueOverview: "نظرة عامة على الإيرادات",
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يوم",
      last3Months: "آخر 3 أشهر",
      newPropertyListed: "عقار جديد مدرج",
      rentalBookingConfirmed: "تم تأكيد حجز الإيجار",
      newUserRegistered: "مستخدم جديد مسجل",
      paymentReceived: "تم استلام الدفعة",
      propertyMaintenanceCompleted: "تم الانتهاء من صيانة العقار",
      hoursAgo: "ساعات مضت",
      searchPlaceholder: "البحث عن العقارات، المستخدمين، الحجوزات...",
      adminUser: "مستخدم : مدير",
      welcomeBack: "مرحباً بعودتك! إليك ما يحدث في عمل الإيجار اليوم.",
      manageUsers: "إدارة المستخدمين",
      viewBookings: "عرض الحجوزات",
      generateReport: "إنشاء تقرير"
    }
  },
  fr: {
    navbar: {
      home: "Accueil",
      about: "À propos",
      service: "Service",
      price: "Prix",
      promo: "Promo",
      login: "Connexion",
      language: "Langue"
    },
    hero: {
      title: "Trouvez Votre Espace de Location Parfait",
      subtitle: "Découvrez des espaces de vie modernes conçus pour le confort et le style",
      phoneNumber: "Numéro de Téléphone",
      contactUs: "Contactez-nous"
    },
    gallery: {
      title: "Découvrez Nos Espaces",
      subtitle: "Explorez notre collection sélectionnée d'espaces de vie modernes, chacun conçu avec attention aux détails et au style",
      modernDesign: "Design Moderne",
      modernDescription: "Espaces de vie contemporains avec des lignes épurées et une esthétique minimaliste",
      luxuryLiving: "Vie de Luxe",
      luxuryDescription: "Espaces premium avec des finitions haut de gamme et un design sophistiqué",
      minimalistLiving: "Vie Minimaliste",
      minimalistDescription: "Espaces propres et épurés qui favorisent la tranquillité et le style"
    },
    about: {
      title: "À propos de MIMO RENT",
      subtitle: "Votre partenaire de confiance pour les espaces de location premium",
      description: "Nous nous spécialisons dans la fourniture de propriétés de location de haute qualité qui combinent confort, style et fonctionnalité. Nos espaces soigneusement sélectionnés sont conçus pour répondre aux besoins diverses des résidents modernes.",
      features: {
        quality: "Propriétés de Qualité",
        qualityDesc: "Chaque propriété est soigneusement sélectionnée et entretenue selon les normes les plus élevées.",
        service: "Service Excellent",
        serviceDesc: "Notre équipe dédiée s'engage à fournir un service client exceptionnel.",
        location: "Emplacements de Choix",
        locationDesc: "Propriétés stratégiquement situées dans des quartiers recherchés."
      },
      values: {
        qualityTitle: "Assurance Qualité",
        qualityDesc: "Chaque propriété répond à nos normes élevées de qualité et de confort",
        customerTitle: "Focus Client",
        customerDesc: "Votre satisfaction est notre priorité absolue, à chaque étape",
        serviceTitle: "Service Rapide",
        serviceDesc: "Temps de réponse rapides et processus efficaces pour votre commodité"
      }
    },
    footer: {
      rights: "Tous droits réservés.",
      privacy: "Politique de Confidentialité",
      terms: "Conditions d'Utilisation",
      description: "Votre partenaire de confiance pour trouver l'espace de vie parfait. Maisons modernes, service exceptionnel et prix imbattables dans des emplacements de choix.",
      quickLinks: "Liens Rapides",
      getInTouch: "Contactez-nous",
      phone: "Téléphone",
      email: "Email",
      address: "Adresse",
      businessHours: "Heures d'Ouverture",
      aboutUs: "À propos",
      properties: "Propriétés",
      services: "Services",
      contact: "Contact"
    },
    login: {
      title: "Bon Retour",
      subtitle: "Connectez-vous à votre compte",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Entrez votre nom d'utilisateur",
      email: "Adresse Email",
      emailPlaceholder: "Entrez votre email",
      password: "Mot de Passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      rememberMe: "Se souvenir de moi",
      forgotPassword: "Mot de passe oublié?",
      signIn: "Se Connecter",
      signingIn: "Connexion en cours...",
      noAccount: "Pas de compte?",
      signUp: "S'inscrire",
      errors: {
        usernameRequired: "Nom d'utilisateur requis",
        usernameMinLength: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        passwordRequired: "Mot de passe requis",
        passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères",
        loginFailed: "Échec de la connexion. Veuillez réessayer.",
        networkError: "Erreur réseau. Vérifiez votre connexion et réessayez."
      }
    },
    dashboard: {
      title: "Tableau de Bord Admin",
      welcome: "Bon retour",
      logout: "Déconnexion",
      totalUsers: "Total Utilisateurs",
      activeBookings: "Réservations Actives",
      totalProperties: "Total Propriétés",
      revenue: "Revenus",
      recentActivity: "Activité Récente",
      noRecentActivity: "Aucune activité récente à afficher.",
      startActivity: "Commencez à gérer votre système depuis la barre latérale."
    },
    admin: {
      adminPanel: "Panneau d'Administration",
      overview: "Aperçu",
      properties: "Propriétés",
      offices: "Bureaux",
      users: "Utilisateurs",
      bookings: "Réservations",
      reports: "Rapports",
      pricing: "Tarification",
      wilayas: "Wilayas",
      settings: "Paramètres",
      logout: "Déconnexion",
      dashboardOverview: "Aperçu du Tableau de Bord",
      totalProperties: "Total des Propriétés",
      totalBookings: "Total des Réservations",
      totalUsers: "Total des Utilisateurs",
      totalRevenue: "Revenus Totaux",
      recentBookings: "Réservations Récentes",
      quickActions: "Actions Rapides",
      addProperty: "Ajouter une Propriété",
      addUser: "Ajouter un Utilisateur",
      viewReports: "Voir les Rapports",
      updatePricing: "Mettre à jour les Tarifs",
      welcomeAdmin: "Bienvenue, Admin",
      sectionUnderDevelopment: "Cette section est en développement",
      userManagement: "Gestion des Utilisateurs",
      searchUsers: "Rechercher des utilisateurs...",
      allRoles: "Tous les Rôles",
      admin: "Admin",
      sousAdmin: "Sous Admin",
      employee: "Employé",
      customer: "Client",
      allStatuses: "Tous les Statuts",
      active: "Actif",
      inactive: "Inactif",
      usersFound: "utilisateurs trouvés",
      userInfo: "Infos Utilisateur",
      contact: "Contact",
      role: "Rôle",
      status: "Statut",
      lastLogin: "Dernière Connexion",
      actions: "Actions",
      never: "Jamais",
      edit: "Modifier",
      deactivate: "Désactiver",
      activate: "Activer",
      delete: "Supprimer",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      noUsersFound: "Aucun utilisateur trouvé",
      editUser: "Modifier l'Utilisateur",
      modalComingSoon: "Le formulaire utilisateur sera implémenté ici",
      cancel: "Annuler",
      success: "Succès!",
      ok: "OK",
      title: "Titre",
      enterTitle: "Entrez le titre de la propriété",
      type: "Type",
      wilaya: "Wilaya", 
      enterWilaya: "Entrez la wilaya",
      description: "Description",
      enterDescription: "Entrez la description de la propriété",
      propertyManagement: "Gestion des Propriétés",
      searchProperties: "Rechercher des propriétés...",
      allTypes: "Tous les Types",
      apartment: "Appartement",
      villa: "Villa",
      shop: "Magasin",
      available: "Disponible",
      propertiesFound: "propriétés trouvées",
      confirmDeleteProperty: "Êtes-vous sûr de vouloir supprimer cette propriété ?",
      noPropertiesFound: "Aucune propriété trouvée",
      editProperty: "Modifier la Propriété",
      propertyFormComingSoon: "Le formulaire de propriété sera implémenté ici",
      officeManagement: "Gestion des Bureaux",
      searchOffices: "Rechercher des bureaux...",
      addOffice: "Ajouter un Bureau",
      editOffice: "Modifier le Bureau",
      officeName: "Nom du Bureau",
      selectOffice: "Sélectionner un Bureau",
      enterOfficeName: "Entrez le nom du bureau",
      manager: "Gestionnaire",
      selectManager: "Sélectionner un Gestionnaire",
      address: "Adresse",
      street: "Adresse de la rue",
      city: "Ville",
      zipCode: "Code Postal",
      workingHours: "Heures de Travail",
      socialMedia: "Médias Sociaux",
      website: "Site Web",
      confirmDeleteOffice: "Êtes-vous sûr de vouloir supprimer ce bureau ?",
      daily: "Quotidien",
      monthly: "Mensuel", 
      yearly: "Annuel",
      rooms: "Pièces",
      bathrooms: "Salles de bain",
      noOfficesFound: "Aucun bureau trouvé",
      manageOffices: "Gérez vos bureaux immobiliers",
      activeRentals: "Locations Actives",
      userSatisfaction: "Satisfaction Utilisateur",
      revenueOverview: "Aperçu des Revenus",
      last7Days: "Derniers 7 jours",
      last30Days: "Derniers 30 jours",
      last3Months: "Derniers 3 mois",
      newPropertyListed: "Nouvelle propriété listée",
      rentalBookingConfirmed: "Réservation de location confirmée",
      newUserRegistered: "Nouvel utilisateur enregistré",
      paymentReceived: "Paiement reçu",
      propertyMaintenanceCompleted: "Maintenance de propriété terminée",
      hoursAgo: "heures il y a",
      searchPlaceholder: "Rechercher des propriétés, utilisateurs, réservations...",
      adminUser: "Utilisateur Admin",
      welcomeBack: "Bon retour! Voici ce qui se passe avec votre entreprise de location aujourd'hui.",
      manageUsers: "Gérer les Utilisateurs",
      viewBookings: "Voir les Réservations",
      generateReport: "Générer un Rapport"
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = React.useState(false);

  // Set mounted state after hydration
  React.useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ar', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Apply document direction when language changes
  React.useEffect(() => {
    if (mounted) {
      const dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem('language', lang);
    }
    
    // Update document direction for RTL
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    
    // Force re-render by updating a timestamp
    localStorage.setItem('languageUpdated', Date.now().toString());
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
