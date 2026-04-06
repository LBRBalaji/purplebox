const fs = require('fs');
let content = fs.readFileSync('src/contexts/auth-context.tsx', 'utf8');

content = content.replace(
  `      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          let redirectPath = '/dashboard';
          if (userData.role === 'User') redirectPath = '/dashboard?tab=my-transactions';
          else if (userData.role === 'Warehouse Developer') redirectPath = '/dashboard?tab=registered-leads';
          router.push(redirectPath);
        }
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'User profile not found. Please contact admin.' });
      }`,
  `      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        if (userData.status === 'pending') {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Account Pending Verification', description: 'Your account is under review. You will receive an email once your access is activated.' });
          return;
        }
        if (userData.status === 'rejected') {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Account Not Approved', description: 'Your account has not been approved. Please contact support.' });
          return;
        }
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          let redirectPath = '/dashboard';
          if (userData.role === 'User') redirectPath = '/dashboard?tab=my-transactions';
          else if (userData.role === 'Warehouse Developer') redirectPath = '/dashboard?tab=registered-leads';
          router.push(redirectPath);
        }
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'User profile not found. Please contact admin.' });
      }`
);

fs.writeFileSync('src/contexts/auth-context.tsx', content);
console.log('Done!');
