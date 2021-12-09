package com.cbmu.covidmap;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class CaliHistoricalFacilityCounts {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer id;

    private Integer facilityId;
    private String jurisdiction;
    private String state;
    private String name;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String source;
    private Integer residentsConfirmed;
    private Integer staffConfirmed;
    private Integer residentsDeaths;
    private Integer staffDeaths;
    private Integer residentsTadmin;
    private Integer residentsTested;
    private Integer residentsActive;
    private Integer staffActive;
    private Integer populationFeb20;
    private Integer residentsPopulation;
    private Integer residentsInitiated;
    private Integer staffInitiated;
    private Integer residentsCompleted;
    private Integer staffCompleted;
    private Integer residentsVadmin;
    private Integer staffVadmin;
    private Integer webGroup;
    private String address;
    private String zipcode;
    private String city;
    private String county;
    private Float latitude;
    private Float longitude;
    private String countyFips;
    private String iceFieldOffice;
}
