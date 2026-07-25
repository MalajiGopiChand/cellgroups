import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.members': 'Members',
    'nav.attendance': 'Attendance',
    'nav.birthdays': 'Birthdays',
    'nav.logs': 'Attendance Records',
    'nav.prayerRequests': 'Prayer Requests',
    'nav.reportCards': 'Report Cards',
    'nav.meetingPlaces': 'Meeting Places',
    'nav.announcements': 'Announcements',
    'nav.leaderAttendance': 'Leader Attendance',
    'nav.approvals': 'Approvals',
    'nav.logout': 'Logout',
    
    // Descriptions
    'desc.overview': 'Overview & Alerts',
    'desc.manage': 'Manage group',
    'desc.mark': 'Mark daily',
    'desc.birthdays': 'Member birthdays',
    'desc.past': 'Past attendance',
    'desc.viewRequests': 'View requests',
    'desc.submitRequests': 'Submit requests',
    'desc.viewReports': 'View reports',
    'desc.submitReport': 'Submit report',
    'desc.viewLocations': 'View locations',
    'desc.setLocation': 'Set location',
    'desc.sendAlerts': 'Send alerts',
    'desc.leaderAtt': 'Leader attendance',
    'desc.pendingReq': 'Pending requests',

    // Home & Dashboard
    'dash.overview': 'Quick Overview',
    'dash.groupMembers': 'Group Members',
    'dash.todayAtt': "Today's Attendance",
    'dash.quickActions': 'Quick Actions',
    'dash.active': 'Active',
    'dash.notMarked': 'Not marked',
    'dash.present': 'Present',
    
    // Add Member Page
    'add.title': 'Add Member / Family',
    'add.primaryDetails': 'Primary Member Details',
    'add.name': 'Name of Member',
    'add.dob': 'Date of Birth (Optional)',
    'add.phone': 'Mobile Number (Optional)',
    'add.addFamily': 'Add Family Members (Optional)',
    'add.familyMembers': 'Family Members',
    'add.addMemberBtn': 'Add Member',
    'add.relation': 'Relationship',
    'add.saveBtn': 'Save',
    'add.myMembers': 'My Members',
    'add.noMembers': 'No members found. Add one above.',
    'add.edit': 'Edit',

    // Attendance
    'att.title': 'Take Attendance',
    'att.date': 'Date',
    'att.download': 'Download',
    'att.saveBtn': 'Save Attendance',
    'att.addFirst': 'Please add members before taking attendance.',
    'att.presentBtn': 'Present',
    'att.absentBtn': 'Absent',
    'att.savedAlert': 'Attendance Submitted',
    'att.notMarked': 'Not Marked',

    // Birthdays
    'bday.title': 'Birthdays',
    'bday.today': "Today's Birthdays",
    'bday.upcoming': 'Upcoming Birthdays',
    'bday.noBirthdays': 'No birthdays to show right now.',
    'bday.todayLabel': 'Today 🎉',
    'bday.in': 'In',
    'bday.days': 'days',
    'bday.day': 'day',
    'bday.thisWeek': 'This week (Sunday to Saturday)',
    'bday.noBirthdaysThisWeek': 'No upcoming birthdays this week.',
    'bday.viewAll': 'View All Birthdays',
    'bday.ago': 'ago',
    
    // Reports & Prayer Requests
    'report.title': 'Meeting Report',
    'report.meetingDate': 'Meeting Date',
    'report.presentFamilies': 'Total Families Present',
    'report.absentFamilies': 'Total Families Absent',
    'report.newVisitor': 'New Visitor',
    'report.newVisitorName': 'New Visitor Name',
    'report.yes': 'Yes',
    'report.no': 'No',
    'report.msgShared': 'Message Shared',
    'report.msgTitle': 'Message Title',
    'report.msgDesc': 'Message Description',
    'report.discussion': 'Discussion',
    'report.discConducted': 'Discussion Conducted?',
    'report.discTopic': 'Discussion Topic',
    'report.discDetails': 'Discussion Details',
    'report.testimony': 'Testimony',
    'report.testShared': 'Testimony Shared?',
    'report.testDetails': 'Testimony Details',
    'report.submittedBy': 'Submitted By',
    'report.success': 'Report Submitted Successfully',
    
    'prayer.title': 'Prayer Request',
    'prayer.personName': 'Person Name',
    'prayer.desc': 'Prayer Request Description',
    'prayer.success': 'Prayer Request Submitted Successfully',

    'common.loading': 'Loading...',
    'common.noData': 'No Data Found',

    // Logs
    'logs.title': 'Attendance Records',
    'logs.selectDate': 'Select Date',
    'logs.noLogs': 'No attendance records found for this date.',
    'logs.presentCount': 'Present',

    // General
    'gen.submit': 'Submit',
    'gen.cancel': 'Cancel',
    'gen.save': 'Save',
    'gen.delete': 'Delete',
    'gen.edit': 'Edit',
    'gen.view': 'View',
    'gen.search': 'Search',
    'gen.close': 'Close',
    'gen.back': 'Back',
    'gen.next': 'Next',
    'gen.today': 'Today',
    'gen.thisWeek': 'This Week',
    'gen.thisMonth': 'This Month'
  },
  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.members': 'సభ్యులు',
    'nav.attendance': 'హాజరు',
    'nav.birthdays': 'పుట్టినరోజులు',
    'nav.logs': 'హాజరు రికార్డులు',
    'nav.prayerRequests': 'ప్రార్థన మనవులు',
    'nav.reportCards': 'సమావేశ నివేదిక',
    'nav.meetingPlaces': 'సమావేశ స్థలం',
    'nav.announcements': 'ప్రకటనలు',
    'nav.leaderAttendance': 'నాయకుల హాజరు',
    'nav.approvals': 'ఆమోదాలు',
    'nav.logout': 'లాగ్ అవుట్',
    
    // Descriptions
    'desc.overview': 'సంక్షిప్త వివరాలు',
    'desc.manage': 'సమూహాన్ని నిర్వహించండి',
    'desc.mark': 'హాజరు నమోదు చేయండి',
    'desc.birthdays': 'సభ్యుల పుట్టినరోజులు',
    'desc.past': 'గత హాజరు',
    'desc.viewRequests': 'మనవులు చూడండి',
    'desc.submitRequests': 'మనవులు సమర్పించండి',
    'desc.viewReports': 'రిపోర్టులు చూడండి',
    'desc.submitReport': 'రిపోర్ట్ సమర్పించండి',
    'desc.viewLocations': 'ప్రదేశాలు చూడండి',
    'desc.setLocation': 'ప్రదేశం నిర్ణయించండి',
    'desc.sendAlerts': 'ప్రకటనలు పంపండి',
    'desc.leaderAtt': 'నాయకుల హాజరు',
    'desc.pendingReq': 'పెండింగ్లో ఉన్న మనవులు',

    // Home & Dashboard
    'dash.overview': 'సంక్షిప్త వివరాలు',
    'dash.groupMembers': 'సెల్ సభ్యులు',
    'dash.todayAtt': "ఈ రోజు హాజరు",
    'dash.quickActions': 'త్వరిత చర్యలు',
    'dash.active': 'సక్రియంగా ఉంది',
    'dash.notMarked': 'ఇంకా నమోదు చేయలేదు',
    'dash.present': 'హాజరు',
    
    // Add Member Page
    'add.title': 'సభ్యుడు / కుటుంబాన్ని చేర్చండి',
    'add.primaryDetails': 'ప్రధాన సభ్యుని వివరాలు',
    'add.name': 'సభ్యుని పేరు',
    'add.dob': 'జన్మ తేదీ (ఐచ్చికం)',
    'add.phone': 'మొబైల్ నంబర్ (ఐచ్చికం)',
    'add.addFamily': 'కుటుంబ సభ్యులను జోడించండి (ఐచ్చికం)',
    'add.familyMembers': 'కుటుంబ సభ్యులు',
    'add.addMemberBtn': 'సభ్యుడిని చేర్చండి',
    'add.relation': 'సంబంధం',
    'add.saveBtn': 'భద్రపరచండి',
    'add.myMembers': 'నా సభ్యులు',
    'add.noMembers': 'సభ్యులు లేరు. పై ఫారమ్ ద్వారా సభ్యుడిని చేర్చండి.',
    'add.edit': 'సవరించండి',

    // Attendance
    'att.title': 'హాజరు నమోదు చేయండి',
    'att.date': 'తేదీ',
    'att.download': 'డౌన్లోడ్ చేయండి',
    'att.saveBtn': 'భద్రపరచండి',
    'att.addFirst': 'హాజరు నమోదు చేయడానికి ముందు సభ్యులను చేర్చండి.',
    'att.presentBtn': 'హాజరు',
    'att.absentBtn': 'గైర్హాజరు',
    'att.savedAlert': 'హాజరు విజయవంతంగా నమోదు చేయబడింది',
    'att.notMarked': 'ఇంకా నమోదు చేయలేదు',

    // Birthdays
    'bday.title': 'పుట్టినరోజులు',
    'bday.today': "ఈ రోజు పుట్టినరోజులు",
    'bday.upcoming': 'రాబోయే పుట్టినరోజులు',
    'bday.noBirthdays': 'ఈ రోజు పుట్టినరోజులు లేవు.',
    'bday.todayLabel': 'ఈ రోజు 🎉',
    'bday.in': 'ఇంకా',
    'bday.days': 'రోజుల్లో',
    'bday.day': 'రోజులో',
    'bday.thisWeek': 'ఈ వారం (ఆదివారం నుండి శనివారం వరకు)',
    'bday.noBirthdaysThisWeek': 'ఈ వారం పుట్టినరోజులు లేవు.',
    'bday.viewAll': 'అన్ని పుట్టినరోజులు చూడండి',
    'bday.ago': 'క్రితం',
    
    // Reports & Prayer Requests
    'report.title': 'సమావేశ నివేదిక',
    'report.meetingDate': 'సమావేశ తేదీ',
    'report.presentFamilies': 'హాజరైన కుటుంబాల సంఖ్య',
    'report.absentFamilies': 'గైర్హాజరైన కుటుంబాల సంఖ్య',
    'report.newVisitor': 'కొత్త సందర్శకుడు',
    'report.newVisitorName': 'కొత్త సందర్శకుని పేరు',
    'report.yes': 'అవును',
    'report.no': 'లేదు',
    'report.msgShared': 'పంచుకున్న దేవుని వాక్యం',
    'report.msgTitle': 'వాక్య అంశం',
    'report.msgDesc': 'వాక్య వివరాలు',
    'report.discussion': 'చర్చ',
    'report.discConducted': 'చర్చ జరిగిందా?',
    'report.discTopic': 'చర్చ అంశం',
    'report.discDetails': 'చర్చ వివరాలు',
    'report.testimony': 'సాక్ష్యం',
    'report.testShared': 'సాక్ష్యం చెప్పబడిందా?',
    'report.testDetails': 'సాక్ష్య వివరాలు',
    'report.submittedBy': 'సమర్పించిన వారు',
    'report.success': 'సమావేశ నివేదిక విజయవంతంగా సమర్పించబడింది.',
    
    'prayer.title': 'ప్రార్థన మనవి',
    'prayer.personName': 'వ్యక్తి పేరు',
    'prayer.desc': 'ప్రార్థన మనవి వివరాలు',
    'prayer.success': 'ప్రార్థన మనవి విజయవంతంగా సమర్పించబడింది.',

    'common.loading': 'లోడ్ అవుతోంది...',
    'common.noData': 'సమాచారం అందుబాటులో లేదు.',

    // Logs
    'logs.title': 'హాజరు రికార్డులు',
    'logs.selectDate': 'తేదీని ఎంచుకోండి',
    'logs.noLogs': 'ఈ తేదీకి హాజరు రికార్డులు లేవు.',
    'logs.presentCount': 'హాజరు',

    // General
    'gen.submit': 'సమర్పించండి',
    'gen.cancel': 'రద్దు చేయండి',
    'gen.save': 'భద్రపరచండి',
    'gen.delete': 'తొలగించండి',
    'gen.edit': 'సవరించండి',
    'gen.view': 'చూడండి',
    'gen.search': 'వెతకండి',
    'gen.close': 'మూసివేయండి',
    'gen.back': 'వెనుకకు',
    'gen.next': 'తదుపరి',
    'gen.today': 'ఈ రోజు',
    'gen.thisWeek': 'ఈ వారం',
    'gen.thisMonth': 'ఈ నెల'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'te' : 'en'));
  };

  const t = (key) => {
    return (translations[language] && translations[language][key]) || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { 
      language: 'en', 
      toggleLanguage: () => {}, 
      t: (key) => translations['en'][key] || key 
    };
  }
  return context;
};
