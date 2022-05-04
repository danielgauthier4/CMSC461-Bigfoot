package com.cbmu.bigfoot;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class ReportClassification {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer reportID;

    private String classification;
}
