from rest_framework import serializers
from .models import Trip, Vehicle, Carrier, Driver, DutyStatus, ELDLog


# Custom field to correctly serialize a GeoDjango PointField to a list
class PointField(serializers.Field):
    """
    A custom field to serialize a GeoDjango Point object to a [lon, lat] list.
    """

    def to_representation(self, value):
        if value is None:
            return None
        return [value.x, value.y]


class VehicleSerializer(serializers.ModelSerializer):
    assigned_driver_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = "__all__"
    
    def get_assigned_driver_name(self, obj):
        if obj.assigned_driver:
            return obj.assigned_driver.user.get_full_name() or obj.assigned_driver.user.username
        return None


class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = "__all__"


class DriverSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source="user.get_full_name")
    username = serializers.ReadOnlyField(source="user.username")
    email = serializers.ReadOnlyField(source="user.email")
    carrier_name = serializers.ReadOnlyField(source="carrier.name")

    class Meta:
        model = Driver
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "license_number",
            "role",
            "carrier",
            "carrier_name",
            "created_at",
        ]


class TripSerializer(serializers.ModelSerializer):
    # --- Read-only fields for displaying data ---
    vehicle = VehicleSerializer(read_only=True)
    current_location = PointField(read_only=True)
    pickup_location = PointField(read_only=True)
    pickup_location = PointField(read_only=True)
    dropoff_location = PointField(read_only=True)
    driver_name = serializers.ReadOnlyField(source="driver.user.get_full_name")

    # --- Write-only fields for creating/updating a trip ---
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(), source="vehicle", write_only=True
    )
    current_location_input = serializers.ListField(
        child=serializers.FloatField(), write_only=True
    )
    pickup_location_input = serializers.ListField(
        child=serializers.FloatField(), write_only=True
    )
    dropoff_location_input = serializers.ListField(
        child=serializers.FloatField(), write_only=True
    )

    class Meta:
        model = Trip
        fields = [
            "id",
            "driver",
            "driver_name",
            "vehicle",
            "vehicle_id",
            "current_location_name",
            "current_location",
            "current_location_input",
            "pickup_location_name",
            "pickup_location",
            "pickup_location_input",
            "dropoff_location_name",
            "dropoff_location",
            "dropoff_location_input",
            "initial_odometer",
            "final_odometer",
            "last_service_date",
            "fuel_used",
            "total_miles",
            "total_engine_hours",
            "fuel_efficiency",
            "current_cycle_hours",
            "start_time",
            "end_time",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("driver", "total_miles", "fuel_efficiency", "total_engine_hours")

    def create(self, validated_data):
        """
        Correctly creates a Trip instance, handling the driver and vehicle relationships.
        """
        driver_instance = validated_data.pop("driver", None)
        vehicle_instance = validated_data.pop("vehicle")

        if not driver_instance:
            user = self.context["request"].user
            if hasattr(user, "driver"):
                driver_instance = user.driver
            else:
                raise serializers.ValidationError(
                    "A driver could not be associated with this trip."
                )
        current_coords = validated_data.pop("current_location_input")
        pickup_coords = validated_data.pop("pickup_location_input")
        dropoff_coords = validated_data.pop("dropoff_location_input")

        trip = Trip.objects.create(
            driver=driver_instance,
            vehicle=vehicle_instance,
            current_longitude=current_coords[0],
            current_latitude=current_coords[1],
            pickup_longitude=pickup_coords[0],
            pickup_latitude=pickup_coords[1],
            dropoff_longitude=dropoff_coords[0],
            dropoff_latitude=dropoff_coords[1],
            **validated_data
        )
        return trip

    def update(self, instance, validated_data):
        """
        Update trip and auto-calculate fields when trip is completed.
        """
        # Update all fields normally
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # If completing the trip, calculate the derived values
        if instance.status == "COMPLETED" and instance.final_odometer and instance.initial_odometer:
            # Calculate total miles from odometer
            instance.total_miles = instance.final_odometer - instance.initial_odometer
            
            # Calculate fuel efficiency (miles per gallon)
            if instance.fuel_used and float(instance.fuel_used) > 0:
                instance.fuel_efficiency = instance.total_miles / float(instance.fuel_used)
            
            # Calculate total engine hours from start/end time
            if instance.end_time and instance.start_time:
                time_diff = instance.end_time - instance.start_time
                instance.total_engine_hours = time_diff.total_seconds() / 3600  # Convert to hours
        
        instance.save()
        return instance


class DutyStatusSerializer(serializers.ModelSerializer):
    location = serializers.ListField(
        child=serializers.FloatField(), write_only=True, required=False
    )

    class Meta:
        model = DutyStatus
        fields = [
            "id",
            "trip",
            "status",
            "start_time",
            "end_time",
            "latitude",
            "longitude",
            "location_description",
            "remarks",
            "created_at",
            "updated_at",
            "location",
        ]
        read_only_fields = [
            "id",
            "trip",
            "created_at",
            "updated_at",
            "latitude",
            "longitude",
        ]

    def create(self, validated_data):
        location_data = validated_data.pop("location", [0.0, 0.0])
        if location_data and len(location_data) == 2:
            validated_data["longitude"] = location_data[0]
            validated_data["latitude"] = location_data[1]

        return super().create(validated_data)


class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = "__all__"
