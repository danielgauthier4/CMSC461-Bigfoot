package com.cbmu.covidmap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;
import java.util.stream.Collectors;

@Slf4j
@Component
public class DateTimeConvert implements Converter<String, Date> {

    private static final List<String> SUPPORTED_FORMATS = Arrays.asList("yyyy-MM-dd'T'hh:mm:ssZ");
    private static final List<DateTimeFormatter> DATE_TIME_FORMATTERS =
            SUPPORTED_FORMATS.stream()
                    .map(DateTimeFormatter::ofPattern)
                    .collect(Collectors.toList());

    //private DateTimeFormatter ZULU = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'hh:mm:ssZ");

    @Override
    public Date convert(String dateString) {
        TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.of("UTC")));

        try {
            return Date.from(Instant.parse(dateString));
        }
        catch (Exception e) {
            log.error(e.getMessage(), e);
            return null;
        }
    }
}
