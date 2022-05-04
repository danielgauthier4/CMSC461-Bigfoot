package com.cbmu.bigfoot;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class Weather {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer reportID;
    private Float highTemperature;
    private Float midTemperature;
    private Float lowTemperature;
    private Float dewPoint;
    private Float humidity;
    private Float cloudCover;
    private Float moonPhase;
    private Float precipitationIntensity;
    private Float precipitationProbability;
    private String precipitationType;
    private Float pressure;
    private String summary;
    private Integer uvIndex;
    private Float visibility;
    private Integer windBearing;
    private Float windSpeed;
}
