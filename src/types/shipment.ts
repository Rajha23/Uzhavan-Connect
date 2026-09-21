import { OrderTimelineEvent, WorkflowOrder } from './index';

export type ShipmentStatus =
  | 'Pending'
  | 'Assigned'
  | 'Pickup Scheduled'
  | 'Picked Up'
  | 'In Transit'
  | 'Delivered'
  | 'Delayed'
  | 'Cancelled';

export interface Shipment {
  id: string; // e.g. SHP-TN-5510
  orderId: string; // references WorkflowOrder.id
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  variety?: string;
  quantityKg: number;
  pickupLocation: string;
  deliveryLocation: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  driverPhone?: string;
  vehicleType?: string;
  carrierName?: string;
  pickupDate?: string;
  expectedDelivery?: string;
  deliveredAt?: string;
  status: ShipmentStatus;
  timeline: OrderTimelineEvent[];
  temperatureC?: number | string;
  gpsTracking?: WorkflowOrder['gpsTracking'];
  notes?: string;
  routeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetVehiclePreset {
  vehicleNumber: string;
  vehicleType: string;
  capacityKg: number;
  driverName: string;
  driverPhone: string;
  carrierName: string;
  reeferTempTargetC: number;
}
