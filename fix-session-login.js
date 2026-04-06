const fs = require('fs');
let content = fs.readFileSync('src/contexts/auth-context.tsx', 'utf8');

content = content.replace(
  `        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          let redirectPath = '/dashboard';
          if (userData.role === 'User') redirectPath = '/dashboard?tab=my-transactions';
          else if (userData.role === 'Warehouse Developer') redirectPath = '/dashboard?tab=registered-leads';
          router.push(redirectPath);
        }`,
  `        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));

        // Session security — skip for SuperAdmin/O2O
        if (userData.role !== 'SuperAdmin' && userData.role !== 'O2O') {
          const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('sessionToken', sessionToken);
          const deviceInfo = navigator.userAgent.substring(0, 100);
          fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userData.email, sessionToken, deviceInfo }),
          }).catch(() => {});
        }

        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          let redirectPath = '/dashboard';
          if (userData.role === 'User') redirectPath = '/dashboard?tab=my-transactions';
          else if (userData.role === 'Warehouse Developer') redirectPath = '/dashboard?tab=registered-leads';
          router.push(redirectPath);
        }`
);

// Clear session on logout
content = content.replace(
  `    sessionStorage.removeItem('user');`,
  `    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionToken');`
);

fs.writeFileSync('src/contexts/auth-context.tsx', content);
console.log('Done!');
