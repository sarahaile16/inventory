import { Navigate } from 'react-router-dom';
import { getStoredUser, homePath } from '../auth/roles';

const HomeRedirect = () => {
  const user = getStoredUser();
  return <Navigate to={user ? homePath(user.role) : '/login'} replace />;
};

export default HomeRedirect;
