import re

def insert_hardware_back(filepath, state_vars):
    with open(filepath, "r") as f:
        code = f.read()
    
    if "useHardwareBack" not in code:
        code = code.replace("import { db }", "import { useHardwareBack } from '../../hooks/useHardwareBack';\nimport { db }")
    
    # Insert hooks right after state declarations
    insert_point = code.find("useEffect(() => {")
    if insert_point == -1:
        insert_point = code.find("if (!") # fallback
    
    hooks = ""
    for var, setter in state_vars:
        if f"useHardwareBack(!!{var}" not in code:
            hooks += f"  useHardwareBack(!!{var}, () => {setter}(null));\n"
    
    if hooks:
        code = code[:insert_point] + hooks + "\n  " + code[insert_point:]
        
    with open(filepath, "w") as f:
        f.write(code)

insert_hardware_back("src/pages/admin/AdminLeaderProfilePage.jsx", [("selectedMember", "setSelectedMember")])
insert_hardware_back("src/pages/admin/AdminLeaderProfilesListPage.jsx", [("selectedLeader", "setSelectedLeader")])
insert_hardware_back("src/pages/admin/AdminFamilyProfilePage.jsx", [("selectedMember", "setSelectedMember")])
