let users = new Map()
let roles = new Map([
    ["admin", { permissions: ["delete", "manage_users"], parent: "editor" }],
    ["editor", { permissions: ["write"], parent: "viewer" }],
    ["viewer", { permissions: ["read"], parent: null }]
])

function createUser(username, password, role = "viewer") {
    if (users.has(username)) {
        console.log("User už existuje.")
        console.log("--------")
        return false
    }
    users.set(username, { password, role })
    console.log("User vytvořen.")
    console.log("--------")
    return true
}

function getRolePermissions(role) {
    let perms = new Set()
    while (role && roles.has(role)) {
        let { permissions, parent } = roles.get(role)
        permissions.forEach(p => perms.add(p))
        role = parent
    }
    return [...perms]
}

function authenticateUser(username, password) {
    if (!users.has(username)) {
        console.log("Uživatel neexistuje.")
        return false
    }
    let user = users.get(username)
    if (user.password === password) {
        console.log("✅ Přihlášení úspěšné.")
        console.log("Permise:", getRolePermissions(user.role))
        console.log("--------")
        return true
    } else {
        console.log("❌ Nesprávné heslo.")
        console.log("--------")
        return false
    }
}

function getUsersByRole(role) {
    let result = []
    for (let [username, data] of users) {
        if (data.role === role) {
            result.push(username)
        }
    }
    return result
}

function count_active_users() {
    return users.size
}

function get_all_permissions() {
    let perms = new Set()
    for (let role of roles.keys()) {
        getRolePermissions(role).forEach(p => perms.add(p))
    }
    return [...perms]
}

function has_write_access(username) {
    if (!users.has(username)) return false
    let role = users.get(username).role
    let perms = getRolePermissions(role)
    return perms.includes("write")
}

// --- Testy ---
createUser("user", "user")
createUser("adminka7", "admin123", "admin")
authenticateUser("adminka7", "admin")
authenticateUser("user", "user")
authenticateUser("adminka7", "admin123")

console.log(users)
console.log("----------------------------------------")
console.log(getUsersByRole("admin"))
console.log(count_active_users())         
console.log(get_all_permissions())        
console.log(has_write_access("adminka7"))    


function promote_user(promoter, target) {
    if (!users.has(promoter) || users.get(promoter).role !== "admin") {
        console.log("❌ Jen admin může povyšovat uživatele.")
        return false
    }
    if (!users.has(target)) {
        console.log("❌ Cílový uživatel neexistuje.")
        return false
    }

    let currentRole = users.get(target).role
    if (currentRole === "viewer") {
        users.get(target).role = "editor"
        console.log(`✅ ${target} povýšen na editor.`)
    } else if (currentRole === "editor") {
        users.get(target).role = "admin"
        console.log(`✅ ${target} povýšen na admin.`)
    } else if (currentRole === "admin") {
        console.log("⚠️ Admin nemůže být povýšen dál.")
        return false
    }
    return true
}

createUser("alice", "123", "viewer")
createUser("bob", "456", "editor")
createUser("root", "adminpass", "admin")

promote_user("root", "alice") // viewer -> editor
promote_user("root", "bob")   // editor -> admin
promote_user("bob", "root")   // ne jen admin může povyšovat
