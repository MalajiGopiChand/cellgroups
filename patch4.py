import re

with open("src/pages/admin/AdminAttendancePage.jsx", "r") as f:
    code = f.read()

new_listener = """    const unsubLeaders = onSnapshot(collection(db, 'cellleaders'), (snap) => {
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

code = re.sub(
    r"const unsubLeaders = onSnapshot\(collection\(db, 'cellleaders'\), \(snap\) => \{.*?setLoading\(false\);\n    \}\);",
    new_listener,
    code,
    flags=re.DOTALL
)

code = code.replace(
    """    return () => {
      unsubAtt();
      unsubLeaders();
    };""",
    """    return () => {
      unsubAtt();
      unsubLeaders();
      unsubStudents();
    };"""
)

with open("src/pages/admin/AdminAttendancePage.jsx", "w") as f:
    f.write(code)
