import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  return (
<></>
  );
};

export default Dashboard;