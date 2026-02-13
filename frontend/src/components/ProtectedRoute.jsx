import { Navigate } from "react-router-dom";
import { hasPermission } from "../utils/permissions";

const ProtectedRoute = ({ user, requiredPermission, children }) => {
  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Permission check
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
