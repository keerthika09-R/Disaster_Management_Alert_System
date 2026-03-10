import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RescueTaskService {

  private api = 'http://localhost:8082/api/tasks';

  constructor(private http: HttpClient) {}

  assignTask(payload: any) {
    return this.http.post(this.api, payload);
  }

  getAllTasks() {
    return this.http.get(this.api);
  }

  getRespondersByZone(zone: string) {
    return this.http.get(this.api + '/responders?zone=' + encodeURIComponent(zone));
  }

  getMyTasks() {
    return this.http.get(this.api + '/my');
  }

  getTasksByDisaster(id: number) {
    return this.http.get(this.api + '/disaster/' + id);
  }

  updateTask(id: number, payload: any) {
    return this.http.put(this.api + '/' + id, payload);
  }
}
