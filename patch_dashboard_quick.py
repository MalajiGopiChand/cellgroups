import re

with open("src/pages/AdminDashboard.jsx", "r") as f:
    code = f.read()

# Make sure DownloadIcon is imported in AdminDashboard if not already
if "DownloadIcon" not in code:
    code = code.replace("Comment as CommentIcon", "Comment as CommentIcon,\n  Download as DownloadIcon")

new_button = """    // --- Quick Actions ---
    { 
      id: 13, 
      label: 'Data Downloads', 
      icon: <DownloadIcon />, 
      color: 'var(--primary-forest)',
      bgColor: 'var(--light-sage)',
      description: 'Export Records'
    },"""

if "id: 13," not in code:
    code = code.replace("    // --- Quick Actions ---", new_button)

with open("src/pages/AdminDashboard.jsx", "w") as f:
    f.write(code)
