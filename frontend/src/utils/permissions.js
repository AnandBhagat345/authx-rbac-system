export const hasPermission = (user, permissionCode) => {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return user.role.permissions.includes(permissionCode);
};
