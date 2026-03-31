import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({
  user,
  loading,
  requiredPermission,
  children,
}) => {

  if (loading) {
    return <h2 style={{ padding: "30px", textAlign: "center"}}>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (
  requiredPermission &&
  (!user.role || !hasPermission(user, requiredPermission))
  ) {
    return <Navigate to="/dashboard" />;
  }
   

  return children;
};

export default ProtectedRoute;
