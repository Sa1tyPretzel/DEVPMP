from django.core.management.base import BaseCommand
from apps.core.models import Driver, Carrier, Vehicle, Trip
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Display database statistics and records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model',
            type=str,
            help='Specify model to view: drivers, users, carriers, vehicles, trips',
        )

    def handle(self, *args, **options):
        model = options.get('model')

        if model == 'drivers' or not model:
            self.stdout.write(self.style.SUCCESS('\n=== DRIVERS ==='))
            drivers = Driver.objects.select_related('user', 'carrier').all()
            for driver in drivers:
                self.stdout.write(
                    f"ID: {driver.id} | "
                    f"Name: {driver.user.get_full_name()} | "
                    f"Username: {driver.user.username} | "
                    f"License: {driver.license_number} | "
                    f"Carrier: {driver.carrier.name}"
                )
            self.stdout.write(f"Total: {drivers.count()}\n")

        if model == 'users' or not model:
            self.stdout.write(self.style.SUCCESS('=== USERS ==='))
            users = User.objects.all()
            for user in users:
                driver_info = f" (Driver)" if hasattr(user, 'driver') else ""
                admin_info = " [ADMIN]" if user.is_staff or user.is_superuser else ""
                self.stdout.write(
                    f"ID: {user.id} | "
                    f"Username: {user.username} | "
                    f"Email: {user.email} | "
                    f"Name: {user.get_full_name()}"
                    f"{driver_info}{admin_info}"
                )
            self.stdout.write(f"Total: {users.count()}\n")

        if model == 'carriers' or not model:
            self.stdout.write(self.style.SUCCESS('=== CARRIERS ==='))
            carriers = Carrier.objects.all()
            for carrier in carriers:
                driver_count = carrier.drivers.count()
                vehicle_count = carrier.vehicles.count()
                self.stdout.write(
                    f"ID: {carrier.id} | "
                    f"Name: {carrier.name} | "
                    f"Address: {carrier.main_office_address} | "
                    f"Drivers: {driver_count} | "
                    f"Vehicles: {vehicle_count}"
                )
            self.stdout.write(f"Total: {carriers.count()}\n")

        if model == 'vehicles' or not model:
            self.stdout.write(self.style.SUCCESS('=== VEHICLES ==='))
            vehicles = Vehicle.objects.select_related('carrier').all()
            for vehicle in vehicles:
                self.stdout.write(
                    f"ID: {vehicle.id} | "
                    f"Number: {vehicle.vehicle_number} | "
                    f"Plate: {vehicle.license_plate} | "
                    f"State: {vehicle.state} | "
                    f"Carrier: {vehicle.carrier.name}"
                )
            self.stdout.write(f"Total: {vehicles.count()}\n")

        if model == 'trips' or not model:
            self.stdout.write(self.style.SUCCESS('=== TRIPS ==='))
            trips = Trip.objects.select_related('driver__user', 'vehicle').all()
            for trip in trips:
                self.stdout.write(
                    f"ID: {trip.id} | "
                    f"Driver: {trip.driver.user.get_full_name()} | "
                    f"Vehicle: {trip.vehicle.vehicle_number} | "
                    f"Status: {trip.status} | "
                    f"Miles: {trip.total_miles} | "
                    f"Start: {trip.start_time.strftime('%Y-%m-%d %H:%M')}"
                )
            self.stdout.write(f"Total: {trips.count()}\n")

        if not model:
            self.stdout.write(self.style.SUCCESS('=== SUMMARY ==='))
            self.stdout.write(f"Total Users: {User.objects.count()}")
            self.stdout.write(f"Total Drivers: {Driver.objects.count()}")
            self.stdout.write(f"Total Carriers: {Carrier.objects.count()}")
            self.stdout.write(f"Total Vehicles: {Vehicle.objects.count()}")
            self.stdout.write(f"Total Trips: {Trip.objects.count()}")
