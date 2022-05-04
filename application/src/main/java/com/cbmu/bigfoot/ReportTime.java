package com.cbmu.bigfoot;

import lombok.Data;
import org.aspectj.weaver.ast.Var;
import org.hibernate.type.descriptor.sql.VarcharTypeDescriptor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Data
@Entity // This tells Hibernate to make a table out of this class
public class ReportTime {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    private Integer reportID;

    private String classification;
    private String year;
    private String season;
    private String time_and_conditions;
    private String timestamp;
}
