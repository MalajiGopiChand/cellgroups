import re

with open("src/pages/AdminDashboard.jsx", "r") as f:
    code = f.read()

if "<AdminHomePage onNavigate={(tab) => setCurrentTab(tab)} />" not in code:
    code = code.replace(
        "case 0: return <AdminHomePage />;",
        "case 0: return <AdminHomePage onNavigate={(tab) => setCurrentTab(tab)} />;"
    )
    code = code.replace(
        "default: return <AdminHomePage />;",
        "default: return <AdminHomePage onNavigate={(tab) => setCurrentTab(tab)} />;"
    )

with open("src/pages/AdminDashboard.jsx", "w") as f:
    f.write(code)
