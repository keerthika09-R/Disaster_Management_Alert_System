package com.example.demo.dto;

import java.util.Map;

public class AnalyticsDTO {
    private long disastersHandledThisMonth;
    private long disastersHandledThisYear;
    private long avgResponseTimeMinutes;
    private long totalRespondersDeployed;
    private Map<String, Long> alertsByRegion;
    private long alertsBroadcasted;
    private long alertsAcknowledged;

    public long getDisastersHandledThisMonth() {
        return disastersHandledThisMonth;
    }

    public void setDisastersHandledThisMonth(long disastersHandledThisMonth) {
        this.disastersHandledThisMonth = disastersHandledThisMonth;
    }

    public long getDisastersHandledThisYear() {
        return disastersHandledThisYear;
    }

    public void setDisastersHandledThisYear(long disastersHandledThisYear) {
        this.disastersHandledThisYear = disastersHandledThisYear;
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
