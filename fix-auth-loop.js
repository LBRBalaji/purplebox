const fs = require('fs');
let content = fs.readFileSync('src/contexts/auth-context.tsx', 'utf8');

// Add fetchUsers to AuthContextType
content = content.replace(
  '  deleteUser: (email: string) => void;\n};',
  '  deleteUser: (email: string) => void;\n  fetchUsers: () => Promise<void>;\n};'
);

// Add fetchUsers to the context provider value
content = content.replace(
  '<AuthContext.Provider value={{ user, users, login, signup, logout, isLoading, addUser, updateUser, deleteUser }}>',
  '<AuthContext.Provider value={{ user, users, login, signup, logout, isLoading, addUser, updateUser, deleteUser, fetchUsers }}>'
);

fs.writeFileSync('src/contexts/auth-context.tsx', content);
console.log('Done');
