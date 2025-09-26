let users = new Map()
let roles = new Map([
    ["admin", { permissions: ["delete", "manage_users"], parent: "editor" }],
    ["editor", { permissions: ["write"], parent: "viewer" }],
    ["viewer", { permissions: ["read"], parent: null }]
])

function getRolePermissions(role) {
    let perms = new Set()
    while (role && roles.has(role)) {
        let { permissions, parent } = roles.get(role)
        permissions.forEach(p => perms.add(p))
        role = parent
    }
    return [...perms]
}

function getRoleHierarchy() {
    let order = [], role = "viewer"
    while (role) {
        order.push(role)
        role = roles.get(role)?.parent
    }
    return order.reverse()
}

function createUser(username, password, role = "viewer") {
    if (users.has(username)) return false
    if (!roles.has(role)) role = "viewer"
    users.set(username, { password, role })
    return true
}

function authenticateUser(username, password) {
    if (!users.has(username)) return { success: false, reason: "not_found" }
    let u = users.get(username)
    if (u.password !== password) return { success: false, reason: "wrong_password" }
    return { success: true, permissions: getRolePermissions(u.role) }
}

function getUsersByRole(role) {
    return [...users.entries()].filter(([_, d]) => d.role === role).map(([u]) => u)
}

function countActiveUsers() {
    return users.size
}

function getAllPermissions() {
    let perms = new Set()
    for (let r of roles.keys()) getRolePermissions(r).forEach(p => perms.add(p))
    return [...perms]
}

function userHasPermission(username, perm) {
    return users.has(username) && getRolePermissions(users.get(username).role).includes(perm)
}

function promoteUser(promoter, target) {
    if (!users.has(promoter) || users.get(promoter).role !== "admin") return { success: false, reason: "not_admin" }
    if (!users.has(target)) return { success: false, reason: "target_not_found" }
    let h = getRoleHierarchy(), cur = users.get(target).role, i = h.indexOf(cur)
    if (i === h.length - 1) return { success: false, reason: "max_role" }
    let newRole = h[i + 1]
    users.get(target).role = newRole
    return { success: true, newRole }
}

// --- Test ---
createUser("alice", "123", "viewer")
createUser("bob", "456", "editor")
createUser("root", "adminpass", "admin")

console.log(authenticateUser("alice", "123"))
console.log(userHasPermission("alice", "read"))
console.log(userHasPermission("alice", "write"))
console.log(promoteUser("root", "alice"))
console.log(promoteUser("root", "bob"))
console.log(promoteUser("bob", "root"))
