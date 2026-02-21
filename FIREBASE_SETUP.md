# Firebase Firestore Setup Guide

## Important: Firestore Security Rules

The registration error is likely due to Firestore security rules. You need to configure Firestore to allow read/write access.

### Steps to Fix:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bethelcellgrp**
3. Go to **Firestore Database** → **Rules** tab
4. Update the rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to cellleaders collection
    match /cellleaders/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to students collection
    match /students/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to announcements collection
    match /announcements/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write access to attendance collection
    match /attendance/{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish** to save the rules

### For Production (More Secure Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cell Leaders can read their own data
    match /cellleaders/{leaderId} {
      allow read: if true;
      allow write: if true; // For signup, you might want to restrict this
    }
    
    // Students - Cell Leaders can manage their own students
    match /students/{studentId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Announcements - Everyone can read, only admin can write
    match /announcements/{announcementId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Attendance - Cell Leaders can manage their own attendance
    match /attendance/{attendanceId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Testing Connection

After updating the rules, try registering again. The error message will now be more specific if there are still issues.

## Collections Needed

Make sure these collections exist in Firestore (they will be created automatically on first write):
- `cellleaders`
- `students`
- `announcements`
- `attendance`
