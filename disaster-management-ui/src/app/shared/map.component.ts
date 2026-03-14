import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

// Fix leaflet default marker icon issue in angular
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [CommonModule],
    template: `<div #mapContainer class="map-container"></div>`,
    styles: [`
    .map-container { 
      height: 400px; 
      width: 100%; 
      border-radius: 8px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
      z-index: 1; /* leaflet map z-index fix */
    }
  `]
})
export class MapComponent implements AfterViewInit, OnChanges {
    @Input() disasterEvents: any[] = [];
    @Input() centerLat: number = 20.5937; // Default to India roughly
    @Input() centerLng: number = 78.9629;

    @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

    private map!: L.Map;
    private markersGroup: L.LayerGroup = L.layerGroup();

    ngAfterViewInit(): void {
        this.initMap();
        this.updateMarkers();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['disasterEvents'] && !changes['disasterEvents'].firstChange) {
            this.updateMarkers();
        }
    }

    private initMap(): void {
        this.map = L.map(this.mapContainer.nativeElement).setView([this.centerLat, this.centerLng], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.markersGroup.addTo(this.map);
    }

    private updateMarkers(): void {
        if (!this.map) return;

        this.markersGroup.clearLayers();

        if (this.disasterEvents && this.disasterEvents.length > 0) {
            const bounds = L.latLngBounds([]);

            this.disasterEvents.forEach(event => {
                if (event.latitude && event.longitude) {
                    const latLng = L.latLng(event.latitude, event.longitude);
                    const marker = L.marker(latLng)
                        .bindPopup(`
              <b>${event.title || 'Disaster Event'}</b><br>
              Type: ${event.disasterType}<br>
              Severity: ${event.severity}<br>
              Location: ${event.location}
            `);
                    this.markersGroup.addLayer(marker);
                    bounds.extend(latLng);
                }
            });

            if (bounds.isValid()) {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }
}
