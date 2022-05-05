package com.cbmu.bigfoot;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class Weather {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer reportID;
    @Column(name = "temperature_high")
    private Float highTemperature;
    @Column(name = "temperature_mid")
    private Float midTemperature;
    @Column(name = "temperature_low")
    private Float lowTemperature;
    private Float dewPoint;
    private Float humidity;
    private Float cloudCover;
    private Float moonPhase;
    @Column(name = "precip_intensity")
    private Float precipitationIntensity;
    @Column(name = "precip_probability")
    private Float precipitationProbability;
    @Column(name = "precip_type")
    private String precipitationType;
    private Float pressure;
    private String summary;
    private Integer uvIndex;
    private Float visibility;
    private Integer windBearing;
    private Float windSpeed;
}
