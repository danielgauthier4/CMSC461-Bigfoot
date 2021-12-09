package com.cbmu.covidmap;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class NationalCounts {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer id;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String measure;

    private Integer count;

    private Integer reporting;

    private String missing;
}
