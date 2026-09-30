import re

with open("src/pages/admin/AdminAttendancePage.jsx", "r") as f:
    code = f.read()

# 1. Add students to state
code = code.replace(
    "const [leaders, setLeaders] = useState([]);",
    "const [leaders, setLeaders] = useState([]);\n  const [students, setStudents] = useState([]);"
)

# 2. Add currentStudentsSnap
code = code.replace(
    "let currentLeadersSnap = null;",
    "let currentLeadersSnap = null;\n      let currentStudentsSnap = null;"
)

# 3. Add to processData
code = code.replace(
    "if (!currentAttSnap || !currentLeadersSnap) return;",
    "if (!currentAttSnap || !currentLeadersSnap || !currentStudentsSnap) return;"
)

# 4. Process students in processData
code = code.replace(
    "const leadersData = currentLeadersSnap.docs.map(d => ({ id: d.id, ...d.data() }));",
    "const leadersData = currentLeadersSnap.docs.map(d => ({ id: d.id, ...d.data() }));\n          const studentsData = currentStudentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));\n          const studentsMap = {};\n          studentsData.forEach(s => { studentsMap[s.id] = s; });\n          // Map by name fallback\n          studentsData.forEach(s => { if (s.name) studentsMap[s.name.toLowerCase()] = s; });"
)

# 5. Enrich grouped attendance with family details
code = code.replace(
    """grouped[key].attendance.push({
              id: d.id,
              studentId: data.memberId,
              name: data.memberName,
              status: data.status
            });""",
    """const studentInfo = studentsMap[data.memberId] || studentsMap[data.memberName?.toLowerCase()] || {};
            grouped[key].attendance.push({
              id: d.id,
              studentId: data.memberId,
              name: data.memberName,
              status: data.status,
              familyId: studentInfo.familyId || `single_${data.memberId}`,
              isHead: studentInfo.isHead || false,
            });"""
)

# 6. Add students snapshot listener
code = code.replace(
    """const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
        currentLeadersSnap = snap;
        processData();
      }, (error) => {
        console.error('Error fetching leaders:', error);
        setLoading(false);
      });""",
    """const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
        currentLeadersSnap = snap;
        processData();
      }, (error) => {
        console.error('Error fetching leaders:', error);
        setLoading(false);
      });

      const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
        currentStudentsSnap = snap;
        processData();
      }, (error) => {
        console.error('Error fetching students:', error);
      });"""
)

# 7. Unsubscribe students
code = code.replace(
    """return () => {
        unsubAtt();
        unsubLeaders();
      };""",
    """return () => {
        unsubAtt();
        unsubLeaders();
        unsubStudents();
      };"""
)

with open("src/pages/admin/AdminAttendancePage.jsx", "w") as f:
    f.write(code)
