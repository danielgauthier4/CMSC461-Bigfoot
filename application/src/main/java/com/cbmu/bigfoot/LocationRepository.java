package com.cbmu.bigfoot;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface LocationRepository extends CrudRepository<Location, Integer> {
    List<Location> findAllByState(String state);
    List<Location> findAllByCounty(String county);
    List<Location> findAllByStateAndCounty(String state, String county);

}
