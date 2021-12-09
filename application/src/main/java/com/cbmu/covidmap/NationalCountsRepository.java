package com.cbmu.covidmap;

import org.springframework.data.repository.CrudRepository;

import java.util.Date;
import java.util.List;



// This will be AUTO IMPLEMENTED by Spring into a Bean called nationalCountsRepository.
// CRUD refers Create, Read, Update, Delete

public interface NationalCountsRepository extends CrudRepository<NationalCounts, Integer> {
    List<NationalCounts> findAllByDate(Date date);
}