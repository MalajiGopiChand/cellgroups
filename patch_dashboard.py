import re

with open("src/pages/AdminDashboard.jsx", "r") as f:
    code = f.read()

# Add import
if "AdminDownloadsPage" not in code:
    code = code.replace(
        "import AdminTestimoniesPage from './admin/AdminTestimoniesPage';",
        "import AdminTestimoniesPage from './admin/AdminTestimoniesPage';\nimport AdminDownloadsPage from './admin/AdminDownloadsPage';"
    )

# Add case 13
if "case 13:" not in code:
    code = code.replace(
        "case 12: return <AdminLeaderProfilesListPage onBack={() => setCurrentTab(0)} />;",
        "case 12: return <AdminLeaderProfilesListPage onBack={() => setCurrentTab(0)} />;\n        case 13: return <AdminDownloadsPage onBack={() => setCurrentTab(0)} />;"
    )

with open("src/pages/AdminDashboard.jsx", "w") as f:
    f.write(code)
