package com.cbmu.covidmap;

import javax.persistence.*;
import java.util.Date;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class NytCounts {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer id;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String county;

    private String state;

    private String fips;

    private Integer cases;

    private Integer deaths;
}
