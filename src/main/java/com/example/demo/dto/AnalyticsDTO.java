package com.example.demo.dto;

import java.util.Map;

public class AnalyticsDTO {
    private long totalFloods;
    private long totalFires;
    private long avgResponseTimeMinutes;
    private long totalRespondersDeployed;
    private Map<String, Long> alertsByRegion;
    private long alertsBroadcasted;
    private long alertsAcknowledged;

    public long getTotalFloods() {
        return totalFloods;
    }

    public void setTotalFloods(long totalFloods) {
        this.totalFloods = totalFloods;
    }

    public long getTotalFires() {
        return totalFires;
    }

    public void setTotalFires(long totalFires) {
        this.totalFires = totalFires;
    }

    public long getAvgResponseTimeMinutes() {
        return avgResponseTimeMinutes;
    }

    public void setAvgResponseTimeMinutes(long avgResponseTimeMinutes) {
        this.avgResponseTimeMinutes = avgResponseTimeMinutes;
    }

    public long getTotalRespondersDeployed() {
        return totalRespondersDeployed;
    }

    public void setTotalRespondersDeployed(long totalRespondersDeployed) {
        this.totalRespondersDeployed = totalRespondersDeployed;
    }

    public Map<String, Long> getAlertsByRegion() {
        return alertsByRegion;
    }

    public void setAlertsByRegion(Map<String, Long> alertsByRegion) {
        this.alertsByRegion = alertsByRegion;
    }

    public long getAlertsBroadcasted() {
        return alertsBroadcasted;
    }

    public void setAlertsBroadcasted(long alertsBroadcasted) {
        this.alertsBroadcasted = alertsBroadcasted;
    }

    public long getAlertsAcknowledged() {
        return alertsAcknowledged;
    }

    public void setAlertsAcknowledged(long alertsAcknowledged) {
        this.alertsAcknowledged = alertsAcknowledged;
    }
}
