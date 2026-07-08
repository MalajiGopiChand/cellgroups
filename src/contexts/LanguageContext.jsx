import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.members': 'Members',
    'nav.attendance': 'Attendance',
    'nav.birthdays': 'Birthdays',
    'nav.logs': 'Logs',
    'nav.logout': 'Logout',
    
    // Descriptions
    'desc.overview': 'Overview & Alerts',
    'desc.manage': 'Manage group',
    'desc.mark': 'Mark daily',
    'desc.birthdays': 'Member birthdays',
    'desc.past': 'Past attendance',

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
    'add.primaryDetails': 'PRIMARY MEMBER DETAILS',
    'add.name': 'Name of Member',
    'add.dob': 'Date of Birth (Optional)',
    'add.phone': 'Mobile Number (Optional)',
    'add.addFamily': 'Add Family Members (Optional)',
    'add.familyMembers': 'Family Members',
    'add.addMemberBtn': 'Add Member',
    'add.relation': 'Relationship',
    'add.saveBtn': 'Add Family Group',
    'add.myMembers': 'My Members',
    'add.noMembers': 'No members found. Add one above.',
    'add.edit': 'Edit',

    // Attendance
    'att.title': 'Take Attendance',
    'att.date': 'Date:',
    'att.download': 'Download IMG',
    'att.saveBtn': 'Save Attendance',
    'att.addFirst': 'Add members first',
    'att.presentBtn': 'Present',
    'att.absentBtn': 'Absent',
    'att.savedAlert': 'Attendance saved successfully for',
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
    'common.loading': 'Loading...',

    // Logs
    'logs.title': 'Attendance Logs',
    'logs.selectDate': 'Select Date:',
    'logs.noLogs': 'No attendance logs found for this date.',
    'logs.presentCount': 'Present',

    // General
    'gen.cancel': 'Cancel',
    'gen.save': 'Save',
    'gen.delete': 'Delete'
  },
  te: {
    // Navigation
    'nav.home': 'హోమ్',
    'nav.members': 'సభ్యులు',
    'nav.attendance': 'హాజరు',
    'nav.birthdays': 'పుట్టినరోజులు',
    'nav.logs': 'లాగ్స్',
    'nav.logout': 'లాగ్అవుట్',
    
    // Descriptions
    'desc.overview': 'అవలోకనం & హెచ్చరికలు',
    'desc.manage': 'సమూహాన్ని నిర్వహించండి',
    'desc.mark': 'ప్రతిరోజూ గుర్తించండి',
    'desc.birthdays': 'సభ్యుల పుట్టినరోజులు',
    'desc.past': 'గత హాజరు',

    // Home & Dashboard
    'dash.overview': 'శీఘ్ర అవలోకనం',
    'dash.groupMembers': 'సమూహ సభ్యులు',
    'dash.todayAtt': "నేటి హాజరు",
    'dash.quickActions': 'శీఘ్ర చర్యలు',
    'dash.active': 'చురుకుగా',
    'dash.notMarked': 'గుర్తించబడలేదు',
    'dash.present': 'హాజరు',
    
    // Add Member Page
    'add.title': 'సభ్యుడిని / కుటుంబాన్ని జోడించండి',
    'add.primaryDetails': 'ప్రాథమిక సభ్యుని వివరాలు',
    'add.name': 'సభ్యుని పేరు',
    'add.dob': 'పుట్టిన తేదీ (ఐచ్ఛికం)',
    'add.phone': 'మొబైల్ నంబరు (ఐచ్ఛికం)',
    'add.addFamily': 'కుటుంబ సభ్యులను జోడించండి (ఐచ్ఛికం)',
    'add.familyMembers': 'కుటుంబ సభ్యులు',
    'add.addMemberBtn': 'సభ్యుడిని జోడించండి',
    'add.relation': 'సంబంధం',
    'add.saveBtn': 'కుటుంబ సమూహాన్ని జోడించండి',
    'add.myMembers': 'నా సభ్యులు',
    'add.noMembers': 'సభ్యులు కనుగొనబడలేదు. పైన ఒకరిని జోడించండి.',
    'add.edit': 'సవరించు',

    // Attendance
    'att.title': 'హాజరు తీసుకోండి',
    'att.date': 'తేదీ:',
    'att.download': 'IMG డౌన్‌లోడ్',
    'att.saveBtn': 'హాజరును సేవ్ చేయండి',
    'att.addFirst': 'ముందుగా సభ్యులను జోడించండి',
    'att.presentBtn': 'హాజరు',
    'att.absentBtn': 'గైర్హాజరు',
    'att.savedAlert': 'హాజరు విజయవంతంగా సేవ్ చేయబడింది:',
    'att.notMarked': 'గుర్తించబడలేదు',

    // Birthdays
    'bday.title': 'పుట్టినరోజులు',
    'bday.today': "నేటి పుట్టినరోజులు",
    'bday.upcoming': 'రాబోయే పుట్టినరోజులు',
    'bday.noBirthdays': 'ప్రస్తుతం చూపించడానికి పుట్టినరోజులు లేవు.',
    'bday.todayLabel': 'ఈరోజు 🎉',
    'bday.in': 'ఇంకా',
    'bday.days': 'రోజుల్లో',
    'bday.day': 'రోజులో',
    'bday.thisWeek': 'ఈ వారం (ఆదివారం నుండి శనివారం వరకు)',
    'bday.noBirthdaysThisWeek': 'ఈ వారం పుట్టినరోజులు లేవు.',
    'bday.viewAll': 'అన్ని పుట్టినరోజులు చూడండి',
    'bday.ago': 'క్రితం',
    'common.loading': 'లోడ్ అవుతోంది...',

    // Logs
    'logs.title': 'హాజరు లాగ్స్',
    'logs.selectDate': 'తేదీని ఎంచుకోండి:',
    'logs.noLogs': 'ఈ తేదీకి హాజరు లాగ్‌లు కనుగొనబడలేదు.',
    'logs.presentCount': 'హాజరు',

    // General
    'gen.cancel': 'రద్దు చేయి',
    'gen.save': 'సేవ్ చేయి',
    'gen.delete': 'తొలగించు'
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
