package com.cbmu.covidmap;

import org.springframework.data.repository.CrudRepository;

import java.util.Date;
import java.util.List;

//import com.example.accessingdatamysql.User;

// This will be AUTO IMPLEMENTED by Spring into a Bean called nationalCountsRepository.
// CRUD refers Create, Read, Update, Delete

public interface CaliHistoricalFacilityCountsRepository extends CrudRepository<CaliHistoricalFacilityCounts, Integer> {
    List<CaliHistoricalFacilityCounts> findAllByDate(Date date);
}