from rest_framework import permissions


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Permission that allows managers or admins.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Admins always have access
        if user.is_staff or user.is_superuser:
            return True
        
        # Managers have access
        if hasattr(user, 'driver') and user.driver.role == 'MANAGER':
            return True
        
        return False


class IsCarrierManagerOrAdmin(permissions.BasePermission):
    """
    Permission that allows carrier managers to access only their carrier's resources.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Admins always have access
        if user.is_staff or user.is_superuser:
            return True
        
        # Managers have access for their carrier
        if hasattr(user, 'driver') and user.driver.role == 'MANAGER':
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admins always have access
        if user.is_staff or user.is_superuser:
            return True
        
        # Check if object belongs to manager's carrier
        if hasattr(user, 'driver') and user.driver.role == 'MANAGER':
            # Check for carrier attribute on the object
            if hasattr(obj, 'carrier'):
                return obj.carrier_id == user.driver.carrier_id
            elif hasattr(obj, 'carrier_id'):
                return obj.carrier_id == user.driver.carrier_id
            # For Trip objects, check vehicle's carrier  
            elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'carrier'):
                return obj.vehicle.carrier_id == user.driver.carrier_id
            # For Driver objects
            elif hasattr(obj, 'carrier_id'):
                return obj.carrier_id == user.driver.carrier_id
        
        return False


class IsAdminOrDriverForRead(permissions.BasePermission):
    """
    Permission for admins (full access), managers (carrier access), or drivers (read-only own data).
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Admin has full access
        if user.is_staff or user.is_superuser:
            return True
        
        # Manager has access to their carrier
        if hasattr(user, 'driver') and user.driver.role == 'MANAGER':
            return True
        
        # Driver has read access
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return hasattr(user, 'driver')
    
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Admin has full access
        if user.is_staff or user.is_superuser:
            return True
        
        # Manager has access to their carrier's objects
        if hasattr(user, 'driver') and user.driver.role == 'MANAGER':
            if hasattr(obj, 'carrier_id'):
                return obj.carrier_id == user.driver.carrier_id
            elif hasattr(obj, 'vehicle') and hasattr(obj.vehicle, 'carrier_id'):
                return obj.vehicle.carrier_id == user.driver.carrier_id
        
        # Driver has access to their own objects
        if hasattr(user, 'driver'):
            if hasattr(obj, 'driver_id'):
                return obj.driver_id == user.driver.id
            if hasattr(obj, 'driver'):
                return obj.driver.id == user.driver.id
        
        return False
